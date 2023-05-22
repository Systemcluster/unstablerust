'use client'

import { Fragment, ReactNode } from 'react'

import useClient from '@/hooks/use-client'

export const ClientOnly = ({ children, fallback }: { children: ReactNode | ReactNode[]; fallback?: ReactNode | ReactNode[] }) => {
    const isClient = useClient()
    return isClient ? <Fragment>{children}</Fragment> : <Fragment>{fallback}</Fragment>
}
