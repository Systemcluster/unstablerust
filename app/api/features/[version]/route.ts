import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest, { params }: { params: any }): Promise<NextResponse> {
    try {
        const maxAge = params.version === 'nightly' || params.version === 'beta' ? 60 * 15 : 60 * 60 * 24 * 7
        const cargoRequest = await fetch(`https://doc.rust-lang.org/${params.version}/cargo/reference/unstable.html`, {
            cache: 'no-store',
        })
        let book = ''
        try {
            const bookRequest = await fetch(`https://doc.rust-lang.org/${params.version}/unstable-book/toc.html`, {
                cache: 'no-store',
            })
            if (bookRequest.status === 404) {
                throw new Error('toc.html not found')
            }
            book = await bookRequest.text()
        } catch {
            const bookRequest = await fetch(`https://doc.rust-lang.org/${params.version}/unstable-book/the-unstable-book.html`, {
                cache: 'no-store',
            })
            book = await bookRequest.text()
        }
        const cargo = await cargoRequest.text()
        return NextResponse.json(
            {
                raw: book,
                cargo: cargo,
            },
            {
                headers: {
                    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
                    'CDN-Cache-Control': `public, s-maxage=${maxAge}`,
                    'Vercel-CDN-Cache-Control': `public, s-maxage=${maxAge}`,
                },
            }
        )
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: `${error.message ?? error}` },
            {
                status: 500,
            }
        )
    }
}
