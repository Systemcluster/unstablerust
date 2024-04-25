import { useCallback } from 'react'

import useAsync from './use-async'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from './use-stored-state'

export type RustFeature = {
    name: string
    url: string
    version: string
}

export type CargoFeature = {
    name: string
    url: string
    version: string
    content: string
}

export type RustFeatures = {
    flags: RustFeature[]
    langFeatures: RustFeature[]
    libFeatures: RustFeature[]
    cargoFeatures: CargoFeature[]
    received: number
}

const mapFeatures = (features: Array<Element>, version: string): RustFeature[] => {
    return [...features].map((li) => ({
        name: (li.querySelector('a')?.textContent ?? '').replace(/\d+\.\d+\.? */, ''),
        url: li.querySelector('a')?.getAttribute('href') ?? '',
        version,
    }))
}

const extractCargoFeatures = (parent: Element, version: string): CargoFeature[] => {
    let features: CargoFeature[] = []
    const topHeader = parent.querySelector('#list-of-unstable-features')
    let current = topHeader
    while (current) {
        if (current.id === 'stabilized-and-removed-features') {
            break
        }
        let a = current.querySelector('a')
        if (!a) {
            break
        }
        let item = {
            name: a.textContent?.toLowerCase() ?? '?',
            url: a.getAttribute('href') ?? '',
            version,
            content: '',
        }
        current = current.nextElementSibling
        let wrapper = document.createElement('div')
        while (current && current.tagName !== topHeader!.tagName && current.id !== 'stabilized-and-removed-features') {
            wrapper.append(current.cloneNode(true))
            current = current.nextElementSibling
        }
        item.content = wrapper.innerHTML
        features.push(item)
    }
    return features
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
                    cargoFeatures: features.cargoFeatures ?? [],
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
            const featuresParser = new DOMParser()
            const featuresDoc = featuresParser.parseFromString(json.raw, 'text/html')
            const featuresFeatures = [...featuresDoc.querySelectorAll('#sidebar ol.section')]
            const cargoParser = new DOMParser()
            const cargoDoc = cargoParser.parseFromString(json.cargo, 'text/html')
            const cargoFeaturesRoot = cargoDoc.querySelector('#content main')
            const collected = {
                flags: mapFeatures([...featuresFeatures[0].querySelectorAll('li')], version),
                langFeatures: mapFeatures([...featuresFeatures[1].querySelectorAll('li')], version),
                libFeatures: mapFeatures([...featuresFeatures[2].querySelectorAll('li')], version),
                cargoFeatures: cargoFeaturesRoot ? extractCargoFeatures(cargoFeaturesRoot, version) : [],
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
