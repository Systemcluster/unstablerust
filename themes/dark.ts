import { Theme } from '@theme-ui/core'

const makeTheme = <T extends Theme>(theme: T) => theme
export const darkTheme = makeTheme({
    config: { useRootStyles: false, useBorderBox: false, useLocalStorage: false },
    fonts: {
        body: 'Monoid, var(--font-system)',
        heading: 'Monoid, var(--font-system)',
        monospace: 'Monoid, var(--font-mono)',
    },
    breakpoints: [40, 52, 64].map((n) => n + 'em'),
    space: [0, 4, 8, 16, 24, 32, 64, 128, 256, 512, 1024, 1280, 1920],
    sizes: [0, 4, 8, 16, 24, 32, 64, 128, 256, 512, 1024, 1280, 1920],
    fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 86],
    lineHeights: {
        body: 1.5,
        heading: 1.125,
    },
    colors: {
        background: ['#080808', '#111112', '#151618', '#1d1d1d', '#292929'],
        text: ['#ffffff', '#f5f5f5', '#d4d4d4', '#adadad', '#9ca3af'],
        primary: ['#baebeb', '#88cb68', '#d9b815', '#961d2a', '#d49ed2', '#5779b8', '#dd5c3f'],
        secondary: ['#c7ffff', '#a9fd81', '#ffd817', '#ba2333', '#e6abe3', '#6b96e5', '#dd5c3f'],
        muted: ['#506565', '#334d28', '#68590a', '#551017', '#614760', '#334669', '#853929'],
        error: ['#dd5c3f'],
        warning: ['#d9b815'],
        success: ['#88cb68'],
        link: ['#6b96e5', '#5779b8'],
    },
    radii: [2, 6, 12],
    transitions: {
        standard: '0.12s ease-in-out',
        medium: '0.24s ease-in-out',
        slow: '0.36s ease-in-out',
    },
})
