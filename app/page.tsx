'use client'

import { ComponentProps, Fragment, RefObject, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { keyframes } from '@emotion/react'
import { Theme, ThemeProvider } from '@theme-ui/core'
import hljs from 'highlight.js'

import { darkTheme } from 'themes/dark'
import { lightTheme } from 'themes/light'

import {
    IconArrowLeftCircleLine,
    IconLoader4Line,
    IconErrorWarningLine,
    IconExternalLinkFill,
    IconMoonFill,
    IconSunFill,
    IconMapPin3Line,
    IconGithubLine,
} from 'remixicon'

import useRustReleases, { RustRelease } from '@/hooks/use-rust-releases'
import useRustFeatures, { RustFeature, RustFeatures } from '@/hooks/use-rust-features'
import useStoredState from '@/hooks/use-stored-state'
import useRustFeature from '@/hooks/use-rust-feature'
import useRustFeaturesCached from '@/hooks/use-rust-features-cached'
import Tooltip from '@/components/tooltip'

const Nav = ({ children, ...props }: ComponentProps<'nav'>): JSX.Element => {
    return (
        <nav
            sx={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                width: '100%',
                zIndex: 800,
                backdropFilter: 'blur(10px)',
                background: 'background.0',
                borderBottom: '1px solid',
                borderColor: 'background.2',
            }}
            {...props}
        >
            <div
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    left: 0,
                    right: 0,
                    top: 0,
                    overflow: 'auto',
                    maxWidth: 12,
                    margin: '0 auto',
                }}
            >
                <div
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'left',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                        maxWidth: 12,
                        height: '100%',
                        padding: 3,
                    }}
                >
                    {children}
                </div>
            </div>
        </nav>
    )
}

const NavLink = ({ children, href, ...props }: ComponentProps<typeof Link>): JSX.Element => {
    return (
        <Link
            sx={{
                display: 'flex',
                px: 2,
                py: 2,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'heading',
                fontSize: 16,
                fontWeight: 600,
                color: 'text.2',
                transition: 'standard',
                transitionProperty: 'color background',
                userSelect: 'none',
                ':hover': {
                    opacity: 1,
                    color: 'text.0',
                },
                ':first-of-type': {
                    pl: 0,
                },
            }}
            href={href}
            {...props}
        >
            {children}
        </Link>
    )
}

const Content = ({ children, ...props }: ComponentProps<'div'>): JSX.Element => {
    return (
        <div
            sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gridTemplateRows: 'auto 1fr',
                placeItems: 'start center',
                width: '100%',
            }}
            {...props}
        >
            {children}
        </div>
    )
}

const ErrorMessage = ({ children, ...props }: ComponentProps<'div'>): JSX.Element => {
    return (
        <div
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                width: 'max-content',
                padding: 2,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'error.0',
                background: 'error.0',
                color: 'white',
                pr: 3,
                pl: 3,
                position: 'relative',
            }}
            {...props}
        >
            <IconErrorWarningLine size={24} />
            {children}
        </div>
    )
}

const Loader = ({ children, ...props }: ComponentProps<'div'>): JSX.Element => {
    return (
        <div sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} {...props}>
            <IconLoader4Line size={32} sx={{ animation: `${spin} 0.5s linear infinite` }} />
            <div sx={{ opacity: 0.8 }}>{children}</div>
        </div>
    )
}

const Button = ({ children, ...props }: ComponentProps<'button'>): JSX.Element => {
    return (
        <button
            sx={{
                all: 'unset',
                display: 'inline-flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: '1px solid',
                borderColor: 'transparent',
                transition: 'standard',
                transitionProperty: 'color',
            }}
            {...props}
        >
            {children}
        </button>
    )
}

const FeatureList = ({
    releases,
    ...props
}: ComponentProps<'div'> & { releases: RustRelease[]; children?: never }): JSX.Element => {
    const lastStableRelease = useMemo(
        () => releases.find((release) => release.value !== 'nightly' && release.value !== 'beta'),
        [releases]
    )

    const cachedNightlyFeatures = useRustFeaturesCached('nightly')
    const cachedBetaFeatures = useRustFeaturesCached('beta')

    const [newRelease, setNewRelease] = useStoredState('rust-selected-new-release', 'nightly')
    const newFeatures = useRustFeatures(newRelease)

    const [baseRelease, setBaseRelease] = useStoredState('rust-selected-base-release', '')
    const baseFeatures = useRustFeatures(baseRelease)

    const [selectedFeature, setSelectedFeature] = useStoredState<RustFeature | undefined>('rust-selected-feature', undefined)
    const featureDetails = useRustFeature(selectedFeature)

    useEffect(() => {
        if (!baseRelease && lastStableRelease?.value) {
            setBaseRelease(lastStableRelease?.value)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastStableRelease, setBaseRelease])

    const updateNewRelease = (release: RustRelease) => {
        if (release.value === newRelease) {
            return
        }
        const releaseIndex = releases.findIndex((r) => r.value === release.value)
        const compareIndex = releases.findIndex((r) => r.value === baseRelease)
        if (releaseIndex >= compareIndex) {
            setBaseRelease(releases.at(releaseIndex + 1)?.value ?? release.value)
        }
        setNewRelease(release.value)
        setSelectedFeature(undefined)
    }

    const diffFeatures = useMemo(() => {
        if (!baseFeatures.value || !newFeatures.value) {
            return null
        }
        const newFlags = newFeatures.value.flags
        const compareFlags = baseFeatures.value.flags
        const newLangFeatures = newFeatures.value.langFeatures
        const compareLangFeatures = baseFeatures.value.langFeatures
        const newLibFeatures = newFeatures.value.libFeatures
        const compareLibFeatures = baseFeatures.value.libFeatures

        const addedFlags = newFlags.filter((flag) => !compareFlags.some((c) => c.name === flag.name))
        const addedLangFeatures = newLangFeatures.filter((feature) => !compareLangFeatures.some((c) => c.name === feature.name))
        const addedLibFeatures = newLibFeatures.filter((feature) => !compareLibFeatures.some((c) => c.name === feature.name))
        const removedFlags = compareFlags.filter((flag) => !newFlags.some((c) => c.name === flag.name))
        const removedLangFeatures = compareLangFeatures.filter((feature) => !newLangFeatures.some((c) => c.name === feature.name))
        const removedLibFeatures = compareLibFeatures.filter((feature) => !newLibFeatures.some((c) => c.name === feature.name))

        return {
            addedFlags,
            addedLangFeatures,
            addedLibFeatures,
            removedFlags,
            removedLangFeatures,
            removedLibFeatures,
        }
    }, [baseFeatures.value, newFeatures.value])

    const newUpdatedFeatures = useMemo(() => {
        if (newRelease !== 'nightly' && newRelease !== 'beta') {
            return null
        }
        let compareValue: RustFeatures | null = null
        if (newRelease === 'nightly') {
            if (!cachedNightlyFeatures || !newFeatures.value) {
                return null
            }
            compareValue = cachedNightlyFeatures
        }
        if (newRelease === 'beta') {
            if (!cachedBetaFeatures || !newFeatures.value) {
                return null
            }
            compareValue = cachedBetaFeatures
        }
        if (!newFeatures.value || !compareValue) {
            return null
        }
        return {
            addedFlags: newFeatures.value.flags.filter((flag) => !compareValue?.flags.some((f) => f.name === flag.name)),
            addedLangFeatures: newFeatures.value.langFeatures.filter(
                (feature) => !compareValue?.langFeatures.some((f) => f.name === feature.name)
            ),
            addedLibFeatures: newFeatures.value.libFeatures.filter(
                (feature) => !compareValue?.libFeatures.some((f) => f.name === feature.name)
            ),
            removedFlags: compareValue?.flags.filter((flag) => !newFeatures.value?.flags.some((f) => f.name === flag.name)),
            removedLangFeatures: compareValue?.langFeatures.filter(
                (feature) => !newFeatures.value?.langFeatures.some((f) => f.name === feature.name)
            ),
            removedLibFeatures: compareValue?.libFeatures.filter(
                (feature) => !newFeatures.value?.libFeatures.some((f) => f.name === feature.name)
            ),
        }
    }, [cachedBetaFeatures, cachedNightlyFeatures, newFeatures.value, newRelease])

    const restFeatures = useMemo(() => {
        if (!newFeatures.value) {
            return null
        }
        if (!diffFeatures) {
            return newFeatures.value
        }
        return {
            flags: newFeatures.value.flags.filter((flag) => !diffFeatures.addedFlags.some((f) => f.name === flag.name)),
            langFeatures: newFeatures.value.langFeatures.filter(
                (feature) => !diffFeatures.addedLangFeatures.some((f) => f.name === feature.name)
            ),
            libFeatures: newFeatures.value.libFeatures.filter(
                (feature) => !diffFeatures.addedLibFeatures.some((f) => f.name === feature.name)
            ),
        } as RustFeatures
    }, [newFeatures.value, diffFeatures])

    const versionListRef = useRef<HTMLDivElement>(null)
    const featureListRef = useRef<HTMLDivElement>(null)
    return (
        <div
            sx={{
                display: 'grid',
                gridTemplateColumns: ['1fr', '50% 50%', '225px 415px 1fr'],
                gridTemplateRows: ['max(25%, 120px) max(25%, 120px) auto', '50% 50%', '100%'],
                overflow: 'hidden',
            }}
            {...props}
        >
            <div
                sx={{
                    overflow: 'auto',
                    px: 0,
                    pr: 3,
                    py: 3,
                    pb: 5,
                    position: 'relative',
                    zIndex: 200,
                }}
                ref={versionListRef}
            >
                <div
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {releases?.length > 0 ? (
                        releases.map((release, i) => (
                            <div
                                key={release.value}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <div>
                                    <Button
                                        sx={{
                                            ':hover': {
                                                borderColor: 'text.0',
                                            },
                                            ':focus': {
                                                outline: 'none',
                                                borderColor: 'text.0',
                                            },
                                        }}
                                        style={{
                                            fontWeight: release.value === newRelease ? 600 : 400,
                                        }}
                                        onClick={(e) => {
                                            e.currentTarget?.blur()
                                            updateNewRelease(release)
                                        }}
                                    >
                                        {release.label}
                                    </Button>
                                    {release.created > 0 && (
                                        <span sx={{ color: 'text.2', fontSize: '0.675em', ml: 3, opacity: 0.5 }}>
                                            {new Date(release.created).toISOString().slice(0, 10)}
                                        </span>
                                    )}
                                </div>
                                <Tooltip content="Select for feature comparison" parent={versionListRef}>
                                    <Button
                                        sx={{
                                            opacity: release.value === baseRelease ? 1 : 0.2,
                                            pl: 1,
                                            ':hover': {
                                                opacity: release.value === baseRelease ? 0.8 : 0.6,
                                            },
                                            ':focus': {
                                                outline: 'none',
                                                opacity: release.value === baseRelease ? 0.8 : 0.6,
                                            },
                                            ':disabled': {
                                                opacity: 0.1,
                                                cursor: 'not-allowed',
                                            },
                                        }}
                                        disabled={releases.findIndex((r) => r.value === newRelease) >= i}
                                        onClick={(e) => {
                                            e.currentTarget?.blur()
                                            if (baseRelease === release.value) {
                                                setBaseRelease('')
                                            } else {
                                                setBaseRelease(release.value)
                                            }
                                        }}
                                    >
                                        <IconArrowLeftCircleLine size={16} />
                                    </Button>
                                </Tooltip>
                            </div>
                        ))
                    ) : (
                        <Loader sx={{ my: 0 }}></Loader>
                    )}
                </div>
            </div>
            <div
                sx={{
                    borderWidth: 0,
                    borderLeftWidth: ['0', '1px'],
                    borderRightWidth: ['0', '0', '1px'],
                    borderTopWidth: ['1px', '0', '0'],
                    borderStyle: 'solid',
                    borderColor: 'background.2',
                    overflow: 'auto',
                    px: [0, 3],
                    py: 3,
                    pb: 5,
                    pt: 0,
                    position: 'relative',
                    zIndex: 100,
                }}
                ref={featureListRef}
            >
                {newFeatures.status === 'error' && (
                    <ErrorMessage sx={{ mt: 3 }}>
                        <div>{newFeatures.error?.message}</div>
                    </ErrorMessage>
                )}
                {newFeatures.status !== 'error' && (
                    <div
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0,
                        }}
                    >
                        {(!restFeatures || baseFeatures.status === 'pending') && <Loader sx={{ mt: 3 }}></Loader>}
                        <FeatureGroup
                            parent={featureListRef}
                            title="New Compiler Flags"
                            features={diffFeatures?.addedFlags ?? []}
                            diff="added"
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                            highlight={newUpdatedFeatures?.addedFlags ?? []}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="New Language Features"
                            features={diffFeatures?.addedLangFeatures ?? []}
                            diff="added"
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                            highlight={newUpdatedFeatures?.addedLangFeatures ?? []}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="New Library Features"
                            features={diffFeatures?.addedLibFeatures ?? []}
                            diff="added"
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                            highlight={newUpdatedFeatures?.addedLibFeatures ?? []}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="Removed Compiler Flags"
                            features={diffFeatures?.removedFlags ?? []}
                            diff="removed"
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                            highlight={newUpdatedFeatures?.removedFlags ?? []}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="Removed Language Features"
                            features={diffFeatures?.removedLangFeatures ?? []}
                            diff="removed"
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                            highlight={newUpdatedFeatures?.removedLangFeatures ?? []}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="Removed Library Features"
                            features={diffFeatures?.removedLibFeatures ?? []}
                            diff="removed"
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                            highlight={newUpdatedFeatures?.removedLibFeatures ?? []}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="All Compiler Flags"
                            features={newFeatures.value?.flags ?? []}
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="All Language Features"
                            features={newFeatures.value?.langFeatures ?? []}
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                        />
                        <FeatureGroup
                            parent={featureListRef}
                            title="All Library Features"
                            features={newFeatures.value?.libFeatures ?? []}
                            selectFeature={setSelectedFeature}
                            selected={selectedFeature}
                        />
                    </div>
                )}
            </div>
            <div
                sx={{
                    overflow: 'auto',
                    px: [0, 0, 3],
                    py: 3,
                    pb: 5,
                    pt: 0,
                    borderWidth: 0,
                    borderTopWidth: ['1px', '1px', '0'],
                    borderStyle: 'solid',
                    borderColor: 'background.2',
                    gridColumn: ['auto', '1 / 3', 'auto'],
                    position: 'relative',
                    zIndex: 50,
                }}
            >
                {featureDetails.status === 'error' && (
                    <ErrorMessage sx={{ mt: 3 }}>
                        <div>{featureDetails.error?.message}</div>
                    </ErrorMessage>
                )}
                {featureDetails.status !== 'error' && (
                    <Fragment>
                        {featureDetails.status === 'pending' && <Loader sx={{ mt: 3 }}></Loader>}
                        {featureDetails.status !== 'pending' && !featureDetails.value && (
                            <div sx={{ mt: 3, opacity: 0.75 }}>Select a release and a feature on the left.</div>
                        )}
                        {featureDetails.value && selectedFeature && (
                            <FeatureDetails feature={selectedFeature} content={featureDetails.value.content} />
                        )}
                    </Fragment>
                )}
            </div>
        </div>
    )
}

const FeatureDetails = ({ feature, content }: { feature: RustFeature; content: string }) => {
    const mainContentRef = useRef<HTMLElement>(null)
    useEffect(() => {
        if (!mainContentRef.current) {
            return
        }
        mainContentRef.current.querySelectorAll('pre code').forEach((element) => {
            hljs.highlightElement(element as HTMLElement)
        })
    }, [content])
    const source = content.replace(
        /<a href="((?:\.\.\/|\/)*)?([\d./a-z-]+\.html)(#[a-z-]*)?">/g,
        (match, p1, p2, p3) =>
            `<a href="https://doc.rust-lang.org/${feature?.version}/unstable-book/${feature?.url.split('/', 2)[0]}/${
                p1 || ''
            }${p2}${p3 || ''}">`
    )

    return (
        <div
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                '.rust-external': {
                    'h1:first-of-type': {
                        display: 'none',
                    },
                    'h1 + hr': {
                        display: 'none',
                    },
                    'h1, h2, h3, h4, h5, h6': {
                        fontSize: 0,
                        m: 0,
                        mb: '8px',
                        pt: 3,
                        pb: '4px',
                        zIndex: 10,
                        position: 'sticky',
                        top: 0,
                        width: '100%',
                        backgroundColor: 'background.0',
                    },
                    'h1 + hr + h2': {
                        pt: 2,
                    },
                    hr: {
                        opacity: 0.2,
                        my: 3,
                    },
                    'hr:last-child': {
                        display: 'none',
                    },
                    a: {
                        color: 'link.0',
                        borderBottom: '1px solid',
                        borderColor: 'transparent',
                        ':hover': {
                            color: 'link.0',
                            borderColor: 'text.2',
                        },
                        ':visited': {
                            color: 'link.1',
                        },
                    },
                    'pre, blockquote': {
                        my: 2,
                        backgroundColor: 'background.1',
                        p: 3,
                        whiteSpace: 'pre-wrap',
                        borderRadius: '2px',
                    },
                    'pre > pre': {
                        my: 0,
                        backgroundColor: 'transparent',
                        p: 0,
                    },
                    code: {
                        backgroundColor: 'background.1',
                        px: 1,
                        py: '2px',
                        borderRadius: '2px',
                    },
                    'pre code': {
                        px: 0,
                        py: 0,
                    },
                    p: {
                        lineHeight: '1.6em',
                        mb: 2,
                    },
                    'p:not(:first-of-type)': {
                        mt: 2,
                    },
                    table: {
                        mb: 3,
                    },
                    'th, td': {
                        py: 1,
                        px: 2,
                        pr: 3,
                        textAlign: 'left',
                    },
                    tr: {
                        borderBottom: '1px solid',
                        borderColor: 'background.2',
                    },
                    ul: {
                        listStyleType: 'disc',
                    },
                    'ul ul': {
                        listStyleType: 'circle',
                        mb: 1,
                    },
                    li: {
                        listStylePosition: 'outside',
                        mb: 1,
                    },

                    '.hljs': {
                        color: 'text.2',
                        '.hljs-tag, .hljs-meta': {
                            color: 'text.3',
                        },
                        '.hljs-comment': {
                            color: 'text.4',
                        },
                        '.hljs-keyword,.hljs-attribute,.hljs-selector-tag,\
                        .hljs-meta .hljs-keyword,.hljs-doctag,.hljs-name,.hljs-title,.hljs-section': {
                            fontWeight: 'bold',
                        },
                        '.hljs-title,.hljs-section,.hljs-type,.hljs-string,\
                        .hljs-number,.hljs-selector-id,.hljs-selector-class,.hljs-quote,\
                        .hljs-template-tag,.hljs-deletion': {
                            color: 'primary.5',
                        },
                        '.hljs-regexp,.hljs-symbol,.hljs-variable,.hljs-template-variable,\
                        .hljs-link,.hljs-selector-attr,.hljs-selector-pseudo': {
                            color: 'secondary.3',
                        },
                        '.hljs-literal, .hljs-built_in,.hljs-bullet,.hljs-code,.hljs-addition': {
                            color: 'primary.1',
                        },
                        '.hljs-meta .hljs-string': {
                            color: 'primary.2',
                        },
                        '.hljs-emphasis': {
                            fontStyle: 'italic',
                        },
                        '.hljs-strong': {
                            fontWeight: 'bold',
                        },
                    },
                },
            }}
        >
            <h1
                sx={{
                    fontSize: 0,
                    m: 0,
                    mb: '8px',
                    pb: '4px',
                    pt: 3,
                    position: 'sticky',
                    top: 0,
                    width: '100%',
                    backgroundColor: 'background.0',
                    zIndex: 10,
                }}
            >
                <a
                    // eslint-disable-next-line max-len
                    href={`https://doc.rust-lang.org/${feature?.version}/unstable-book/${feature?.url}`}
                    sx={{
                        color: 'link.0',
                        borderBottom: '1px solid',
                        borderColor: 'transparent',
                        ':hover': {
                            color: 'link.0',
                            borderColor: 'text.2',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        width: 'min-content',
                        gap: 2,
                        mt: '-2px',
                    }}
                >
                    <span>{feature?.name}</span>
                    <span
                        sx={{
                            opacity: 0.8,
                            background: 'background.2',
                            borderRadius: '2px',
                            px: 1,
                            py: '2px',
                        }}
                    >
                        {feature?.version}
                    </span>
                    <span sx={{ opacity: 0.3, mt: '-2px', width: '14px', color: 'text.0' }}>
                        <IconExternalLinkFill size={14} />
                    </span>
                </a>
            </h1>
            <main className="rust-external" dangerouslySetInnerHTML={{ __html: source }} ref={mainContentRef} />
        </div>
    )
}

const FeatureGroup = ({
    title,
    features,
    diff,
    selected,
    selectFeature,
    highlight,
    parent,
}: {
    title: string
    features: RustFeature[]
    diff?: 'added' | 'removed'
    selected?: RustFeature
    selectFeature: (feature: RustFeature) => void
    highlight?: RustFeature[]
    parent: RefObject<Element>
}): JSX.Element => {
    return features.length === 0 ? (
        <Fragment />
    ) : (
        <Fragment>
            <div
                sx={{
                    fontSize: 0,
                    fontWeight: 600,
                    width: '100%',
                    color: diff === 'added' ? 'success.0' : diff === 'removed' ? 'error.0' : 'text.0',
                    position: 'sticky',
                    top: 0,
                    background: 'background.0',
                    pt: 3,
                    pb: 1,
                }}
            >
                <span sx={{ opacity: 0.8 }}>{title}</span>
            </div>
            <ul sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {features.map((feature) => (
                    <li
                        key={feature.name}
                        data-feature={feature.name}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                    >
                        <Button
                            sx={{
                                ':hover': {
                                    borderColor: 'text.0',
                                },
                                ':focus': {
                                    outline: 'none',
                                    borderColor: 'text.0',
                                },
                            }}
                            style={{
                                fontWeight: feature.name === selected?.name ? 600 : 400,
                            }}
                            onClick={(e) => {
                                e.currentTarget?.blur()
                                selectFeature(feature)
                            }}
                        >
                            <span>{feature.name}</span>
                        </Button>
                        {highlight?.some((f) => f.name === feature.name) && (
                            <Tooltip content="New addition since last visit" parent={parent}>
                                <IconMapPin3Line size={14} sx={{ ml: 2, opacity: 0.5, paddingBottom: '1px' }} />
                            </Tooltip>
                        )}
                    </li>
                ))}
            </ul>
        </Fragment>
    )
}

const spin = keyframes({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
})

const Home = ({ setTheme }: { setTheme: (colorMode: string) => void }): JSX.Element => {
    const { status, value, error } = useRustReleases()
    const [colorMode, setColorMode] = useStoredState(
        'theme-color-mode',
        global.window ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 'light'
    )
    useEffect(() => {
        if (colorMode) {
            setTheme(colorMode)
        }
    }, [colorMode, setTheme])
    return (
        <body
            sx={{
                fontFamily: 'body',
                backgroundColor: 'background.0',
                color: 'text.0',
                fontSize: [0],
            }}
            data-theme={colorMode}
        >
            <Content sx={{ height: '100%' }} id="content">
                <Nav sx={{ gridColumn: '1 / 4' }}>
                    <NavLink href="/" sx={{ color: 'text.0' }}>
                        Unstable Rust Features
                    </NavLink>
                    <div sx={{ flex: 1 }} />
                    <NavLink
                        href="https://github.com/Systemcluster/unstablerust"
                        sx={{
                            transitionProperty: 'transform, opacity',
                            ':hover': {
                                opacity: 0.8,
                                transform: 'rotate(8deg)',
                            },
                        }}
                    >
                        <IconGithubLine size={16} />
                    </NavLink>
                    <NavLink
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            setColorMode(colorMode === 'light' ? 'dark' : 'light')
                        }}
                        sx={{
                            transitionProperty: 'transform, opacity',
                            ':hover': {
                                opacity: 0.8,
                                transform: 'rotate(8deg)',
                            },
                        }}
                    >
                        {colorMode === 'light' ? <IconMoonFill size={24} /> : <IconSunFill size={24} />}
                    </NavLink>
                </Nav>
                {status === 'error' && (
                    <ErrorMessage sx={{ my: 3 }}>
                        <div>{error?.message}</div>
                    </ErrorMessage>
                )}
                {status !== 'error' && (
                    <FeatureList releases={value ?? []} sx={{ width: '100%', maxWidth: 12, px: 3, height: '100%' }} />
                )}
            </Content>
        </body>
    )
}

const Body = (): JSX.Element => {
    const [theme, setTheme] = useState(darkTheme as Theme)
    useEffect(() => {
        hljs.configure({
            ignoreUnescapedHTML: true,
        })
    }, [])
    return (
        <ThemeProvider theme={theme}>
            <Home
                setTheme={(colorMode) => {
                    if (colorMode === 'dark') {
                        setTheme(darkTheme)
                    } else {
                        setTheme(lightTheme)
                    }
                }}
            />
        </ThemeProvider>
    )
}

export default Body
