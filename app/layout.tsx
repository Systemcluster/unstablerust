/** @jsxImportSource react */

import '../styles/reset.css'
import '../styles/global.css'
import '../styles/fonts/monoid.css'

import { Fragment, ReactNode } from 'react'

import { AnalyticsWrapper } from '@/components/analytics'

export const runtime = 'edge'

export const metadata = {
    title: {
        default: 'Unstable Rust Feature Explorer',
        template: '%s | Unstable Rust Feature Explorer',
    },
    description: 'Explore and compare the unstable features between versions of the Rust programming language.',
    keywords: 'rust, programming, nightly rust, rust features, rust nightly, feature comparison, versions, unstable features',
    authors: [
        {
            name: 'Systemcluster',
        },
    ],
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
    icons: [
        {
            rel: 'icon',
            url: '/favicon.svg',
            type: 'image/svg+xml',
        },
        {
            rel: 'apple-touch-icon',
            url: '/favicon.svg',
            type: 'image/svg+xml',
        },
    ],
    robots: {
        index: true,
        follow: true,
        nocache: false,
        noarchive: true,
    },
    themeColor: '#030303',
    other: {
        darkreader: 'disable',
        'X-UA-Compatible': 'IE=edge',
    },
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <Fragment>
                {children}
                <AnalyticsWrapper />
            </Fragment>
        </html>
    )
}
