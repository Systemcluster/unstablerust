import { ComponentProps } from 'react'

export interface IconProps extends ComponentProps<'span'> {
    src: string
    width: number
    height: number
    alt?: string
    inverted?: true
}

export const Icon = ({ src, width, height, alt, style, inverted, ...props }: IconProps): JSX.Element => {
    return (
        <span
            sx={{
                overflow: 'hidden',
                borderRadius: '0.01px',
                flex: '0 0 auto',
                display: 'inline-block',
            }}
            style={{
                width,
                height,
            }}
            role="img"
            aria-label={alt}
            {...props}
        >
            <span
                sx={{
                    backgroundColor: inverted ? 'background.0' : 'text.0',
                    maskRepeat: 'no-repeat',
                    maskSize: '100%',
                    maskPosition: 'center',
                    width: '100%',
                    height: '100%',
                    aspectRatio: '1/1',
                    display: 'block',
                    transform: 'rotate(0deg)',
                }}
                style={{
                    WebkitMaskImage: `url(${src})`,
                    maskImage: `url(${src})`,
                    ...style,
                }}
            />
        </span>
    )
}
