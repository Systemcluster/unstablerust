import { Dispatch, SetStateAction, useCallback, useState } from 'react'

export function getLocalStorage(name: string): string | null {
    if (!global.window?.localStorage) return null
    try {
        return window.localStorage.getItem(name)
    } catch {
        return null
    }
}

export function setLocalStorage(name: string, value: string): void {
    if (!window.localStorage) return
    try {
        return window.localStorage.setItem(name, value)
    } catch {
        return
    }
}

export function removeLocalStorage(name: string): void {
    if (!window.localStorage) return
    try {
        return window.localStorage.removeItem(name)
    } catch {
        return
    }
}

const useStoredState = <T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {
    const readValue = () => {
        const value = getLocalStorage(key)
        if (value) {
            try {
                return JSON.parse(value)
            } catch {
                return defaultValue
            }
        }
        return defaultValue
    }
    const [value, setValue] = useState(readValue())
    const setValueAndRemember = useCallback(
        (newValue: Dispatch<SetStateAction<T>>) => {
            const changedValue = typeof newValue === 'function' ? newValue(value) : newValue
            setValue(changedValue)
            setTimeout(() => setLocalStorage(key, JSON.stringify(changedValue)), 1)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    )
    return [value, setValueAndRemember] as [T, Dispatch<SetStateAction<T>>]
}

export default useStoredState
