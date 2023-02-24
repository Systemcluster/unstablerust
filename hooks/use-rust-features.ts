import { useCallback } from 'react'

import useAsync from './use-async'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from './use-stored-state'

export type RustFeature = {
    name: string
    url: string
    version: string
}

export type RustFeatures = {
    flags: RustFeature[]
    langFeatures: RustFeature[]
    libFeatures: RustFeature[]
    received: number
}

const mapFeatures = (features: Array<Element>, version: string): RustFeature[] => {
    return [...features].map((li) => ({
        name: (li.querySelector('a')?.textContent ?? '').replace(/\d+\.\d+\.? */, ''),
        url: li.querySelector('a')?.getAttribute('href') ?? '',
        version,
    }))
}

const getRustFeatures = async (version: string): Promise<RustFeatures> => {
    if (!version) throw new Error('No version provided')
    const cached = getLocalStorage(`rust-release-${version}`)
    if (cached) {
        let acceptAge = version === 'nightly' || version === 'beta' ? 1000 * 60 * 15 : 1000 * 60 * 60 * 24 * 7
        try {
            const features = JSON.parse(cached)
            if (Date.now() - features.received < acceptAge) {
                return {
                    flags: features.flags ?? [],
                    langFeatures: features.langFeatures ?? [],
                    libFeatures: features.libFeatures ?? [],
                    received: features.received ?? 0,
                }
            }
        } catch {
            removeLocalStorage(`rust-release-${version}`)
        }
    }
    return fetch(`/api/features/${version}`)
        .then(async (res) => {
            const json = await res.json()
            return [res.status, json]
        })
        .then(([status, json]) => {
            if (status !== 200) {
                throw new Error('Failed to get Rust features')
            }
            const parser = new DOMParser()
            const doc = parser.parseFromString(json.raw, 'text/html')
            const features = [...doc.querySelectorAll('#sidebar ol.section')]
            const collected = {
                flags: mapFeatures([...features[0].querySelectorAll('li')], version),
                langFeatures: mapFeatures([...features[1].querySelectorAll('li')], version),
                libFeatures: mapFeatures([...features[2].querySelectorAll('li')], version),
                received: Date.now(),
            } as RustFeatures
            setLocalStorage(`rust-release-${version}`, JSON.stringify(collected))
            return collected
        })
}

const useRustFeatures = (version: string) => {
    const callback = useCallback(async () => {
        return getRustFeatures(version)
    }, [version])
    const { status, value, error } = useAsync(callback, true)
    return { status, value, error }
}

export default useRustFeatures
