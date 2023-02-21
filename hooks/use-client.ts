import { useEffect, useState } from 'react'

const useClient = (): boolean => {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
        setIsClient(true)
    }, [])
    return isClient
}

export default useClient
