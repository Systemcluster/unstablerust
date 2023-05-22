import { ComponentProps, ReactNode, useEffect, useRef, useState } from 'react'

import { ClientOnly } from '@/components/client-only'
import useTheme from '@/hooks/use-theme'
import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingPortal,
    offset,
    Placement,
    shift,
    useFloating,
    useHover,
    useInteractions,
} from '@floating-ui/react'

type TooltopProps = ComponentProps<'div'> & {
    content: string | ReactNode
    placement?: Placement
    children: ReactNode | ReactNode[] | string
}
const ClientTooltip = ({ content, placement, children, ...props }: TooltopProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const arrowRef = useRef(null)
    const { x, y, strategy, refs, context, update } = useFloating({
        open: isOpen,
        onOpenChange: (open) => {
            requestAnimationFrame(() => {
                setIsOpen(open)
            })
        },
        placement: placement ?? 'right',
        strategy: 'fixed',
        middleware: [
            flip({}),
            shift({
                padding: 8,
            }),
            offset(8),
            arrow({
                element: arrowRef,
            }),
        ],
        whileElementsMounted: autoUpdate,
    })
    useEffect(() => {
        requestAnimationFrame(() => {
            update()
        })
    }, [update, isOpen])
    const hover = useHover(context, { restMs: 500 })
    const { getReferenceProps, getFloatingProps } = useInteractions([hover])
    const { theme } = useTheme()
    return (
        <div
            ref={refs.setReference}
            sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
            }}
            {...props}
            {...getReferenceProps()}
        >
            {children}
            <FloatingPortal>
                <div
                    onPointerDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        ;(document.activeElement as HTMLElement).blur()
                        setIsOpen(false)
                    }}
                    ref={refs.setFloating}
                    sx={{
                        zIndex: 1000,
                        background: 'background.0',
                        border: '1px solid',
                        borderColor: 'background.2',
                        color: 'text.0',
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        transition: 'standard',
                        transitionProperty: 'opacity, top, left',
                        fontSize: '11px',
                        width: 'max-content',
                        boxShadow: '0 0 2px 0 ' + theme.colors.background[4],
                    }}
                    style={{
                        position: strategy,
                        top: y && !Number.isNaN(y) ? y : 0,
                        left: x && !Number.isNaN(x) ? x : 0,
                        opacity: isOpen ? 0.95 : 0,
                        pointerEvents: isOpen ? 'all' : 'none',
                    }}
                    {...getFloatingProps()}
                >
                    {content}
                    <ClientOnly>
                        <FloatingArrow
                            ref={arrowRef}
                            context={context}
                            fill={theme.colors.background[0]}
                            strokeWidth={1}
                            width={12}
                            height={5}
                            stroke={theme.colors.background[2]}
                            sx={{
                                opacity: 0.95,
                            }}
                        />
                    </ClientOnly>
                </div>
            </FloatingPortal>
        </div>
    )
}

const Tooltip = ({ content, placement, children, ...props }: TooltopProps) => {
    return (
        <ClientOnly>
            <ClientTooltip content={content} placement={placement} {...props}>
                {children}
            </ClientTooltip>
        </ClientOnly>
    )
}

export default Tooltip
