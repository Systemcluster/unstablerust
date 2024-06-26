import { NextResponse, NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest, { params }: { params: any }): Promise<NextResponse> {
    try {
        const maxAge = params.version === 'nightly' || params.version === 'beta' ? 60 * 15 : 60 * 60 * 24 * 7
        const bookRequest = await fetch(`https://doc.rust-lang.org/${params.version}/unstable-book/the-unstable-book.html`, {
            cache: 'no-store',
        })
        const cargoRequest = await fetch(`https://doc.rust-lang.org/${params.version}/cargo/reference/unstable.html`, {
            cache: 'no-store',
        })
        const book = await bookRequest.text()
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
