import { useMemo } from 'react'
import { RustFeatures } from './use-rust-features'
import { getLocalStorage, removeLocalStorage } from './use-stored-state'

const useRustFeaturesCached = (version: string): RustFeatures | null => {
    const features = useMemo(() => {
        if (!version) return null
        const cached = getLocalStorage(`rust-release-${version}`)
        if (cached) {
            try {
                const features = JSON.parse(cached)
                return features
            } catch {
                removeLocalStorage(`rust-release-${version}`)
            }
        }
        return null
    }, [version])
    return features
}

export default useRustFeaturesCached
