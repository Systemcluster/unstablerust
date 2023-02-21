import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: any }): Promise<NextResponse> {
    try {
        const request = await fetch(`https://doc.rust-lang.org/${params.version}/unstable-book/${params.url.join('/')}`)
        const book = await request.text()
        return NextResponse.json(
            { raw: book },
            {
                headers: {
                    'Cache-Control': `max-age=${
                        params.version === 'nightly' || params.version === 'beta' ? 60 * 120 : 60 * 60 * 24 * 7
                    }, public`,
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
