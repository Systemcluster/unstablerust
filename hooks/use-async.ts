import { useCallback, useEffect, useRef, useState } from 'react'

type AsyncStatusIdle = 'idle'
type AsyncStatusPending = 'pending'
type AsyncStatusSuccess = 'success'
type AsyncStatusError = 'error'
type AsyncStatus = AsyncStatusIdle | AsyncStatusPending | AsyncStatusSuccess | AsyncStatusError

type AsyncState<T, E extends Error> =
    | {
          execute: () => Promise<T>
          status: AsyncStatusIdle | AsyncStatusPending
          value: null
          error: null
      }
    | {
          execute: () => Promise<T>
          status: AsyncStatusSuccess
          value: T
          error: null
      }
    | {
          execute: () => Promise<T>
          status: AsyncStatusError
          value: null
          error: E
      }

const useAsync = <T, E extends Error>(callback: () => Promise<T>, immediate = true, override = false): AsyncState<T, E> => {
    const [status, setStatus] = useState<AsyncStatus>('idle')
    const [value, setValue] = useState<T | null>(null)
    const [error, setError] = useState<E | null>(null)

    const requestId = useRef(0)
    const execute = useCallback(async () => {
        setStatus('pending')
        setValue(null)
        setError(null)
        let newId = requestId.current + 1
        requestId.current = newId
        try {
            const response = await callback()
            if (requestId.current !== newId) {
                return
            }
            setValue(response)
            setStatus('success')
            return response
        } catch (error: any) {
            if (requestId.current !== newId) {
                return
            }
            setError(error)
            setStatus('error')
            return error
        }
    }, [callback])

    const isExecuting = useRef(false)
    useEffect(() => {
        if (!override && isExecuting.current) {
            return
        }
        isExecuting.current = true
        if (immediate) {
            execute().finally(() => {
                isExecuting.current = false
            })
        }
    }, [execute, immediate, override])

    return { execute, status, value, error } as AsyncState<T, E>
}

export default useAsync
