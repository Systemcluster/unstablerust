/* eslint-env node */

/** @type {import('next').NextConfig} */
const config = {
    distDir: 'build',
    basePath: '',
    compiler: {
        emotion: {
            autoLabel: 'dev-only',
            sourceMap: false,
        },
    },
    images: {
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {},
    reactStrictMode: true,
    swcMinify: true,
    compress: true,
    pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
    poweredByHeader: false,
    staticPageGenerationTimeout: 60,
    experimental: {
        nextScriptWorkers: false,
    },
    devIndicators: {
        buildActivity: true,
    },
}

export default config
