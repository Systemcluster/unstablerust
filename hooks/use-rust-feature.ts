import { useCallback } from 'react'

import useAsync from './use-async'
import { RustFeature } from './use-rust-features'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from './use-stored-state'

type RustFeatureDetail = {
    content: string
    received: number
}

const getRustFeature = async (feature: RustFeature): Promise<RustFeatureDetail> => {
    if (!feature) throw new Error('No version provided')
    const cached = getLocalStorage(`rust-feature-${feature.version}-${feature.name}`)
    if (cached) {
        let acceptAge = feature.version === 'nightly' || feature.version === 'beta' ? 1000 * 60 * 120 : 1000 * 60 * 60 * 24 * 7
        try {
            const feature = JSON.parse(cached)
            if (Date.now() - feature.received < acceptAge) {
                return feature
            }
        } catch {
            removeLocalStorage(`rust-feature-${feature.version}-${feature.name}`)
        }
    }
    return fetch(`/api/feature/${feature.version}/${feature.url}`)
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
            const content = doc.querySelector('#content main')
            if (!content) throw new Error('Failed to get feature details')
            const collected = {
                content: content.innerHTML.trim(),
                received: Date.now(),
            } as RustFeatureDetail
            setLocalStorage(`rust-feature-${feature.version}-${feature.name}`, JSON.stringify(collected))
            return collected
        })
}

const useRustFeature = (feature?: RustFeature) => {
    const callback = useCallback(async () => {
        if (!feature) return null
        return getRustFeature(feature)
    }, [feature])
    const { status, value, error } = useAsync(callback, true)
    return { status, value, error }
}

export default useRustFeature
