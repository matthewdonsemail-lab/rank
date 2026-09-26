import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { getSvgPath } from 'figma-squircle'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

interface ToastContextType {
  toasts: Toast[]
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Global toast helper for non-React contexts
export const toast = {
  success: (title: string, message?: string) => {
    const event = new CustomEvent('toast', { detail: { type: 'success', title, message } })
    window.dispatchEvent(event)
  },
  error: (title: string, message?: string) => {
    const event = new CustomEvent('toast', { detail: { type: 'error', title, message } })
    window.dispatchEvent(event)
  },
  info: (title: string, message?: string) => {
    const event = new CustomEvent('toast', { detail: { type: 'info', title, message } })
    window.dispatchEvent(event)
  },
  warning: (title: string, message?: string) => {
    const event = new CustomEvent('toast', { detail: { type: 'warning', title, message } })
    window.dispatchEvent(event)
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: Toast['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Listen for global toast events
  useEffect(() => {
    const handler = (e: Event) => {
      const { type, title, message } = (e as CustomEvent).detail
      addToast(type, title, message)
    }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  }, [addToast])

  // Stable functions: components put `toast.error` in effect dependencies; a new function each render made a failing
  // load toast, re-render, and load again without end.
  const actions = useMemo(
    () => ({
      success: (t: string, m?: string) => addToast('success', t, m),
      error: (t: string, m?: string) => addToast('error', t, m),
      info: (t: string, m?: string) => addToast('info', t, m),
      warning: (t: string, m?: string) => addToast('warning', t, m),
      dismiss,
    }),
    [addToast, dismiss],
  )
  const value = useMemo(() => ({ toasts, ...actions }), [toasts, actions])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-3 right-3 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const clip = useSquircleClip<HTMLDivElement>(14)
  const border = useSquircleBorder<HTMLDivElement>(14)
  const ref = useComposedRef(clip.ref, border.ref)

  const bgColors = {
    success: 'bg-emerald-50',
    error: 'bg-rose-50',
    info: 'bg-blue-50',
    warning: 'bg-amber-50',
  }

  const borderColors = {
    success: '#a7f3d0',
    error: '#fecdd3',
    info: '#bfdbfe',
    warning: '#fde68a',
  }

  const textColors = {
    success: 'text-emerald-800',
    error: 'text-rose-800',
    info: 'text-blue-800',
    warning: 'text-amber-800',
  }

  return (
    <div ref={ref} style={clip.style} className={`relative w-72 ${bgColors[toast.type]} p-3 shadow-lg animate-in slide-in-from-right`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColors[toast.type]}`}>{toast.title}</p>
          {toast.message && (
            <p className={`text-xs mt-1 ${textColors[toast.type]} opacity-80`}>{toast.message}</p>
          )}
        </div>
        <button onClick={() => onDismiss(toast.id)} className="ml-2 text-current opacity-50 hover:opacity-100">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <SquircleBorder border={border.state} stroke={borderColors[toast.type]} strokeWidth={2} />
    </div>
  )
}
