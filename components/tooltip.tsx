import { ReactNode, RefObject, useEffect, useState } from 'react'
import { FloatingPortal, useFloating, useHover, useInteractions } from '@floating-ui/react'

const Tooltip = ({
    content,
    children,
    parent,
}: {
    content: string | ReactNode
    children: ReactNode | ReactNode[]
    parent: RefObject<Element>
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const { x, y, strategy, refs, context, update } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'right',
        strategy: 'fixed',
    })
    const hover = useHover(context, { restMs: 500 })
    const { getReferenceProps, getFloatingProps } = useInteractions([hover])
    useEffect(() => {
        let num = 0
        const resize = () => {
            clearTimeout(num)
            num = setTimeout(() => {
                update()
            }, 50) as unknown as number
        }
        window.addEventListener('resize', resize)
        const currentParent = parent.current
        currentParent?.addEventListener('scroll', resize)
        return () => {
            window.removeEventListener('resize', resize)
            currentParent?.removeEventListener('scroll', resize)
        }
    }, [parent, update])
    return (
        <div
            ref={refs.setReference}
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
            }}
            {...getReferenceProps()}
        >
            {children}
            <FloatingPortal root={parent.current as HTMLElement}>
                <div
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
                        pointerEvents: 'none',
                        transition: 'standard',
                        transitionProperty: 'opacity, top, left',
                        fontSize: '11px',
                        width: 'max-content',
                    }}
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                        opacity: isOpen ? 0.95 : 0,
                    }}
                    {...getFloatingProps()}
                >
                    {content}
                </div>
            </FloatingPortal>
        </div>
    )
}

export default Tooltip
