import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { getSvgPath } from 'figma-squircle'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Ref<T> = React.Ref<T> | undefined

function assignRef<T>(ref: Ref<T>, node: T | null) {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else (ref as React.MutableRefObject<T | null>).current = node
}

export function useComposedRef<T>(...refs: Ref<T>[]) {
  const refsRef = React.useRef(refs)
  refsRef.current = refs
  return React.useCallback((node: T | null) => {
    for (const ref of refsRef.current) assignRef(ref, node)
  }, [])
}

export function squirclePath(width: number, height: number, cornerRadius: number) {
  if (width <= 0 || height <= 0) return undefined
  const radius = Math.min(cornerRadius, width / 2, height / 2)
  return getSvgPath({
    width,
    height,
    cornerRadius: radius,
    topLeftCornerRadius: radius,
    topRightCornerRadius: radius,
    bottomRightCornerRadius: radius,
    bottomLeftCornerRadius: radius,
    cornerSmoothing: 1,
  })
}

export function squircleClipPath(width: number, height: number, cornerRadius: number) {
  const path = squirclePath(width, height, cornerRadius)
  return path ? `path('${path}')` : undefined
}

export function useSquircleClip<T extends HTMLElement>(cornerRadius: number) {
  const [node, setNode] = React.useState<T | null>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({})
  const ref = React.useCallback((element: T | null) => setNode(element), [])

  React.useLayoutEffect(() => {
    if (!node) return
    const update = () => {
      const clipPath = squircleClipPath(node.offsetWidth, node.offsetHeight, cornerRadius)
      if (clipPath) setStyle({ clipPath })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, cornerRadius])

  return { ref, style }
}

export function useSquircleBorder<T extends HTMLElement>(cornerRadius: number) {
  const [node, setNode] = React.useState<T | null>(null)
  const [state, setState] = React.useState<{ width: number; height: number; path: string | undefined }>({
    width: 0,
    height: 0,
    path: undefined,
  })
  const ref = React.useCallback((element: T | null) => setNode(element), [])

  React.useLayoutEffect(() => {
    if (!node) return
    const update = () => {
      setState({
        width: node.offsetWidth,
        height: node.offsetHeight,
        path: squirclePath(node.offsetWidth, node.offsetHeight, cornerRadius),
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, cornerRadius])

  return { ref, state }
}

const controlBase = 'inline-flex min-h-10 items-center px-3 py-1 text-base transition-colors duration-150 focus-visible:shadow-[inset_0_0_0_2px_var(--header-focus)]'

type SquircleLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  cornerRadius?: number
  track?: 'cta' | 'nav'
}

export const SquircleLink = React.forwardRef<HTMLAnchorElement, SquircleLinkProps>(function SquircleLink(
  { cornerRadius = 12, className, track = 'cta', ...props },
  forwardedRef,
) {
  const clip = useSquircleClip<HTMLAnchorElement>(cornerRadius)
  const ref = useComposedRef(clip.ref, forwardedRef)
  return <a ref={ref} style={clip.style} className={cn(controlBase, track === 'nav' ? 'js-nav' : 'js-cta', className)} {...props} />
})

type SquircleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  cornerRadius?: number
}

export const SquircleButton = React.forwardRef<HTMLButtonElement, SquircleButtonProps>(function SquircleButton(
  { cornerRadius = 12, className, type = 'button', ...props },
  forwardedRef,
) {
  const clip = useSquircleClip<HTMLButtonElement>(cornerRadius)
  const ref = useComposedRef(clip.ref, forwardedRef)
  return <button ref={ref} style={clip.style} type={type} className={cn(controlBase, className)} {...props} />
})

type ButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean
  variant?: 'default' | 'blue' | 'ink' | 'ghost' | 'outline'
  shadow?: 'none' | 'hard'
  size?: 'default' | 'sm' | 'lg'
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-ink text-paper hover:bg-ink/90',
  blue: 'bg-[#2A8CFF] text-white hover:bg-[#1F6FE6]',
  ink: 'bg-ink text-paper hover:bg-ink/90',
  ghost: 'hover:bg-ink/10',
  outline: 'border border-ink/20 bg-transparent hover:bg-ink/5',
}

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-10 gap-1.5 px-4',
  sm: 'h-8 gap-1 px-3 text-sm',
  lg: 'h-12 gap-2 px-5 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'default', shadow = 'none', asChild = false, ...props },
  forwardedRef,
) {
  const clip = useSquircleClip<HTMLElement>(12)
  const Component = asChild ? Slot : 'button'
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-base font-medium outline-none',
    variants[variant],
    sizes[size],
    shadow === 'hard' ? 'shadow-[0_4px_0_0_#1F6FE6] active:translate-y-[2px] active:shadow-none' : '',
    className,
  )
  return <Component ref={asChild ? (clip.ref as React.Ref<HTMLButtonElement>) : forwardedRef} style={asChild ? clip.style : undefined} className={classes} {...props} />
})

export function SquircleBorder({
  border,
  stroke,
  strokeWidth = 1.5,
  fill = 'none',
  className,
}: {
  border: { width: number; height: number; path: string | undefined }
  stroke: string
  strokeWidth?: number
  fill?: string
  className?: string
}) {
  if (!border.path) return null
  return (
    <svg className={cn('pointer-events-none absolute inset-0 block size-full overflow-visible', className)} width={border.width} height={border.height} viewBox={`0 0 ${border.width} ${border.height}`} aria-hidden="true">
      <path d={border.path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}
