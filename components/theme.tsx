'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, type Theme } from '@theme-ui/core'
import { useServerInsertedHTML } from 'next/navigation'
import { ReactNode, useRef, useState } from 'react'

export default function RootStyleRegistry({ children }: { children: ReactNode | ReactNode[] }) {
    const [{ cache, flush }] = useState(() => {
        const cache = createCache({ key: 'css' })
        cache.compat = true
        const flush = () => {
            const styles = []
            const regularCssIds = [] as string[]
            let regularCss = ''
            Object.keys(cache.inserted).forEach((id) => {
                if (cache.registered[`${cache.key}-${id}`]) {
                    // regular css can be added in one style tag
                    regularCssIds.push(id)
                    regularCss += cache.inserted[id]
                } else {
                    // each global styles require a new entry so it can be independently flushed
                    styles.push({
                        key: `${cache.key}-global`,
                        ids: [id],
                        css: cache.inserted[id],
                    })
                }
            })
            styles.push({ key: cache.key, ids: regularCssIds, css: regularCss })
            return styles
        }
        return { cache, flush }
    })
    const isServerInserted = useRef(false)
    useServerInsertedHTML(() => {
        if (!isServerInserted.current) {
            isServerInserted.current = true
            const styles = flush()
            return styles.map((style) => (
                <style
                    data-emotion={`${style.key} ${style.ids.join(' ')}`}
                    key={style.key}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: style.css }}
                />
            ))
        }
    })
    return <CacheProvider value={cache}>{children}</CacheProvider>
}

export const ThemeWrapper = ({ theme, children }: { theme: Theme; children: ReactNode | ReactNode[] }) => {
    return (
        <RootStyleRegistry>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </RootStyleRegistry>
    )
}
