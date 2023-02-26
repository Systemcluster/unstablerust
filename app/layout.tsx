'use client'

import '../styles/reset.css'
import '../styles/global.css'
import '../styles/fonts/monoid.css'

import { Fragment, ReactNode } from 'react'

import { AnalyticsWrapper } from '@/components/analytics'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                />
                <meta name="theme-color" content="#030303" />
                <title>Unstable Rust Feature Explorer</title>
                <meta
                    name="description"
                    content="Explore and compare the unstable features between versions of the Rust programming language."
                />
                <meta
                    name="keywords"
                    content="rust, programming, nightly rust, rust features, rust nightly,
                    feature comparison, versions, unstable features"
                />
                <meta name="author" content="Systemcluster" />

                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

                <link rel="icon" type="image/svg" href="/favicon.svg" />
                <link rel="apple touch icon" href="/favicon.svg" />

                <meta name="darkreader" content="disable" />
            </head>
            <Fragment>
                {children}
                <AnalyticsWrapper />
            </Fragment>
        </html>
    )
}
