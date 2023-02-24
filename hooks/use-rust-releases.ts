import useAsync from './use-async'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from './use-stored-state'

export type RustRelease = {
    value: string
    label: string
    created: number
}

const getRustReleases = async (): Promise<RustRelease[]> => {
    const cached = getLocalStorage('rust-releases')
    const timestamp = getLocalStorage('rust-releases-timestamp')
    try {
        if (cached && timestamp && Date.now() - Number.parseInt(timestamp) < 1000 * 60 * 30) {
            const releases = JSON.parse(cached)
            if (releases?.length > 0) {
                return releases
            }
        }
    } catch {
        removeLocalStorage('rust-releases')
        removeLocalStorage('rust-releases-timestamp')
    }
    return fetch('https://api.github.com/repos/rust-lang/rust/releases')
        .then(async (res) => {
            const json = await res.json()
            return [res.status, json]
        })
        .then(([status, json]) => {
            if (status !== 200) {
                throw new Error(json.message ?? 'Failed to get Rust releases')
            }
            const releases = json.map((release: any) => ({
                value: release.tag_name,
                label: release.name,
                created: Date.parse(release.created_at),
            })) as RustRelease[]
            const filtered = releases.filter(({ value }, i) => releases.findIndex(({ value: v }) => v === value) === i)
            return [
                { value: 'nightly', label: 'Rust Nightly', created: 0 },
                { value: 'beta', label: 'Rust Beta', created: 0 },
                ...filtered,
            ]
        })
        .then((releases) => {
            setLocalStorage('rust-releases', JSON.stringify(releases))
            setLocalStorage('rust-releases-timestamp', Date.now().toString())
            return releases
        })
}

const useRustReleases = () => {
    const { status, value, error } = useAsync(getRustReleases, true)
    return { status, value, error }
}

export default useRustReleases
