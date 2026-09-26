import { useEffect, useRef, useState, type VideoHTMLAttributes } from 'react'

/** Start loading a clip this far before it scrolls into view. */
const LOAD_MARGIN = '400px'

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & {
  src: string
  /** Called with the <video> element, like a ref. */
  videoRef?: (el: HTMLVideoElement | null) => void
}

/**
 * A <video> that has no `src` until it is near the screen. An autoplay video downloads its whole file at once, whatever
 * `preload` says. The landing page has 12 of them (about 6 MB), most far down the page, so they are held back until
 * the visitor scrolls close.
 */
export function LazyVideo({ src, videoRef, ...rest }: LazyVideoProps) {
  const el = useRef<HTMLVideoElement | null>(null)
  const [near, setNear] = useState(typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = el.current
    if (near || !node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: LOAD_MARGIN },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [near])

  return (
    <video
      {...rest}
      ref={(node) => {
        el.current = node
        videoRef?.(node)
      }}
      src={near ? src : undefined}
    />
  )
}