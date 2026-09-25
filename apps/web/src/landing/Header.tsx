import * as React from "react"
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from "@floating-ui/react"
import { Menu, X, ChevronDown } from "lucide-react"
import {
  Bookmark,
  MessageSquareQuote,
  Users,
  HelpCircle,
  PlayCircle,
  Scale,
  Wrench,
  Newspaper,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { createPortal } from "react-dom"

import { Button } from "@listeningkit/ui"
import {
  SquircleButton,
  SquircleLink,
  squircleClipPath,
  useComposedRef,
  useSquircleClip,
  useSquircleBorder,
} from "@listeningkit/ui"
import { cn } from "@listeningkit/ui"

const MENU_ICONS: Record<string, React.ReactNode> = {
  bookmark: <Bookmark className="size-7" strokeWidth={2} />,
  testimonials: <MessageSquareQuote className="size-7" strokeWidth={2} />,
  affiliate: <Users className="size-7" strokeWidth={2} />,
  "why-choose": <HelpCircle className="size-7" strokeWidth={2} />,
  demo: <PlayCircle className="size-7" strokeWidth={2} />,
  versus: <Scale className="size-7" strokeWidth={2} />,
  tools: <Wrench className="size-7" strokeWidth={2} />,
  articles: <Newspaper className="size-7" strokeWidth={2} />,
}

function resolveMenuIcon(name?: string): React.ReactNode | undefined {
  if (!name) return undefined
  return MENU_ICONS[name]
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-4 fill-current", className)}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-4 fill-current", className)}
    >
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

/**
 * GitHub-style "Star" link for a repo. Fetches the live star count once and
 * falls back to `fallbackStars` (or nothing) if the API is unreachable.
 */
function GithubStarsLink({
  repo,
  className,
  fallbackStars,
}: {
  repo: string
  className?: string
  fallbackStars?: number
}) {
  const [stars, setStars] = React.useState<number | undefined>()
  const light = useHeaderTone() === "light"
  const { ref, style } = useSquircleClip<HTMLAnchorElement>(12)

  React.useEffect(() => {
    let cancelled = false
    const [owner, name] = repo.split("/")
    if (!owner || !name) return
    fetch(`https://api.github.com/repos/${owner}/${name}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.stargazers_count === "number") {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {
        /* fall back */
      })
    return () => {
      cancelled = true
    }
  }, [repo])

  const count = stars ?? fallbackStars

  return (
    <a
      ref={ref}
      style={style}
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Star ${repo} on GitHub`}
      className={cn(
        "js-track js-cta js-click js-header",
        "inline-flex h-10 items-center px-3 py-1 text-base transition-colors duration-150 focus-visible:shadow-[inset_0_0_0_2px_var(--header-focus)]",
        "gap-1.5",
        light ? "text-ink hover:bg-ink/10" : "text-paper hover:bg-dither-frame/10",
        className
      )}
    >
      <GithubIcon className="size-4" />
      <span className="text-sm">Star</span>
      {typeof count === "number" ? (
        <span className="inline-flex items-center gap-1 text-sm font-medium">
          <StarIcon className="size-3.5" />
          <span>{count}</span>
        </span>
      ) : null}
    </a>
  )
}

export type HeaderItem = {
  href: string
  label: string
  variant?: "ghost" | "cta" | "pricing"
  ear?: string
  earFilter?: string
  earJitter?: boolean
}

export type HeaderMenuItem = {
  href: string
  label: string
  action?: string
  swatchClassName: string
  description?: string
  icon?: string
  ear?: string
  earFilter?: string
  earJitter?: boolean
}

export type HeaderProps = {
  isLoggedIn?: boolean
  homeHref?: string
  logoLabel?: string
  className?: string
  tone?: "light" | "dark"
  navItems?: HeaderItem[]
  accountItems?: HeaderItem[]
  menuItems?: HeaderMenuItem[]
  /** Menu items keyed by nav item href, shown in a hover panel under that nav link. */
  navMenuItems?: Record<string, HeaderMenuItem[]>
  /** Owner/repo to render as a GitHub star button in the right pill. */
  githubRepo?: string
}

export const SECTION_EAR_MAP: Record<string, { src: string; filter?: string; jitter?: boolean }> = {
  "#features": {
    src: "/images/ears/ear1.webp",
    filter: "hue-rotate(90deg) saturate(2.4) brightness(1.1)",
  },
  "#how-it-works": {
    src: "/images/ears/ear2.webp",
    filter: "hue-rotate(185deg) saturate(2.2) brightness(1.05)",
  },
  "#use-cases": {
    src: "/images/ears/ear3.webp",
    filter: "hue-rotate(275deg) saturate(2.1) contrast(1.15)",
  },
  "#why-free": {
    src: "/images/ears/ear4.webp",
    filter: "hue-rotate(45deg) saturate(2.4) brightness(1.1)",
  },
  "#socials": {
    src: "/images/ears/ear5.webp",
    filter: "hue-rotate(140deg) saturate(2.2) brightness(1.05)",
  },
  "#other-cases": {
    src: "/images/ears/ear7.webp",
    filter: "hue-rotate(330deg) saturate(2.5) contrast(1.1)",
  },
  "#unemployed": {
    src: "/images/ears/ear6.webp",
    filter: "hue-rotate(215deg) saturate(2.3) brightness(1.15)",
  },
  "#rasputin": {
    src: "/images/ears/ear8.webp",
    filter: "hue-rotate(305deg) saturate(2.4) brightness(1.2)",
    jitter: true,
  },
}

export function resolveItemEar(
  item: HeaderItem | HeaderMenuItem
): { src: string; filter?: string; jitter?: boolean } | undefined {
  if (item.ear) {
    return { src: item.ear, filter: item.earFilter, jitter: item.earJitter }
  }
  const match = SECTION_EAR_MAP[item.href]
  if (match) return match
  const stripped = item.href.split("?")[0]
  if (SECTION_EAR_MAP[stripped]) return SECTION_EAR_MAP[stripped]
  return undefined
}

const defaultNavItems: HeaderItem[] = [
  {
    href: "#features",
    label: "Features",
    variant: "ghost",
    ear: "/images/ears/ear1.webp",
    earFilter: "hue-rotate(90deg) saturate(2.4) brightness(1.1)",
  },
  {
    href: "#how-it-works",
    label: "How it works",
    variant: "ghost",
    ear: "/images/ears/ear2.webp",
    earFilter: "hue-rotate(185deg) saturate(2.2) brightness(1.05)",
  },
  {
    href: "#use-cases",
    label: "Use cases",
    variant: "ghost",
    ear: "/images/ears/ear3.webp",
    earFilter: "hue-rotate(275deg) saturate(2.1) contrast(1.15)",
  },
  {
    href: "#why-free",
    label: "Why free",
    variant: "ghost",
    ear: "/images/ears/ear4.webp",
    earFilter: "hue-rotate(45deg) saturate(2.4) brightness(1.1)",
  },
]

const loggedOutAccountItems: HeaderItem[] = [
  { href: "/sign-in", label: "Sign in", variant: "ghost" },
  { href: "/onboarding", label: "Get started", variant: "cta" },
]

const loggedInAccountItems: HeaderItem[] = [
  { href: "/dashboard/projects", label: "Projects", variant: "ghost" },
  { href: "/dashboard", label: "Dashboard", variant: "cta" },
]

const defaultNavMenuItems: Record<string, HeaderMenuItem[]> = {
  "#features": [
    {
      href: "#features",
      label: "Tech Stack",
      action: "Explore",
      swatchClassName: "bg-blue-500",
      description: "Built with Convex, Firecrawl, Treg and TypeSafe",
      ear: "/images/ears/ear1.webp",
      earFilter: "hue-rotate(90deg) saturate(2.4) brightness(1.1)",
    },
    {
      href: "#socials",
      label: "Platforms",
      action: "Explore",
      swatchClassName: "bg-emerald-500",
      description: "Listen across Reddit, X (Twitter), Facebook & more",
      ear: "/images/ears/ear5.webp",
      earFilter: "hue-rotate(140deg) saturate(2.2) brightness(1.05)",
    },
  ],
  "#how-it-works": [
    {
      href: "#how-it-works",
      label: "Social Listening",
      action: "Explore",
      swatchClassName: "bg-sky-500",
      description: "Catch conversations and intent in real-time",
      ear: "/images/ears/ear2.webp",
      earFilter: "hue-rotate(185deg) saturate(2.2) brightness(1.05)",
    },
    {
      href: "#why-free",
      label: "Self-Hosted Control",
      action: "Explore",
      swatchClassName: "bg-amber-500",
      description: "Run locally on your terms with zero retainers",
      ear: "/images/ears/ear6.webp",
      earFilter: "hue-rotate(45deg) saturate(2.4) brightness(1.1)",
    },
  ],
  "#use-cases": [
    {
      href: "#use-cases",
      label: "Customer Intent",
      action: "Explore",
      swatchClassName: "bg-violet-500",
      description: "Find buyers asking for recommendations",
      ear: "/images/ears/ear3.webp",
      earFilter: "hue-rotate(275deg) saturate(2.1) contrast(1.15)",
    },
    {
      href: "#other-cases",
      label: "Other Cases",
      action: "Explore",
      swatchClassName: "bg-rose-500",
      description: "Emergencies, freelance gigs, contractors",
      ear: "/images/ears/ear7.webp",
      earFilter: "hue-rotate(330deg) saturate(2.5) contrast(1.1)",
    },
    {
      href: "#unemployed",
      label: "For the Unemployed",
      action: "Explore",
      swatchClassName: "bg-ink",
      description: "Massive news for finding gigs and opportunities",
      ear: "/images/ears/ear4.webp",
      earFilter: "hue-rotate(215deg) saturate(2.3) brightness(1.15)",
    },
    {
      href: "#rasputin",
      label: "Rasputin Tribute",
      action: "Explore",
      swatchClassName: "bg-emerald-500",
      description: "Made for our mate Rasputin who was mega unemployed",
      ear: "/images/ears/ear8.webp",
      earFilter: "hue-rotate(305deg) saturate(2.4) brightness(1.2)",
      earJitter: true,
    },
  ],
}

const HeaderToneContext = React.createContext<"light" | "dark">("light")

function useHeaderTone() {
  return React.useContext(HeaderToneContext)
}

function HeaderPill({
  children,
  className,
  ref,
  layoutSize = false,
  ...props
}: Omit<React.ComponentProps<"div">, "ref"> & {
  ref?: React.Ref<HTMLDivElement>
  layoutSize?: boolean
}) {
  const pill = useSquircleClip<HTMLDivElement>(16)
  const nodeRef = React.useRef<HTMLDivElement | null>(null)
  const setRef = useComposedRef(pill.ref, ref, nodeRef)
  const tone = useHeaderTone()
  const light = tone === "light"

  const syncClip = React.useCallback(() => {
    const el = nodeRef.current
    if (!el) return
    const clipPath = squircleClipPath(el.offsetWidth, el.offsetHeight, 16)
    if (clipPath) el.style.clipPath = clipPath
  }, [])

  const motionProps = props as unknown as React.ComponentProps<typeof motion.div>

  return (
    <motion.div
      ref={setRef}
      style={pill.style}
      layout={layoutSize ? "size" : false}
      transition={navCollapseTransition}
      onUpdate={layoutSize ? syncClip : undefined}
      className={cn(
        "site-header__pill px-3 py-1.5",
        light
          ? "bg-white text-ink [--header-focus:color-mix(in_oklab,#0D2A4C_35%,transparent)]"
          : "bg-ink text-paper [--header-focus:color-mix(in_oklab,#F5F1E6_55%,transparent)]",
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

function headerNavId(href: string) {
  const [withoutHash, hash] = href.split("#")
  const path = withoutHash?.split("?")[0] || "/"
  if (hash && (path === "/" || path === "")) return `nav_header_${hash}`
  const last = path.split("/").filter(Boolean).pop() || "home"
  return `nav_header_${last}`
}

function HeaderLogo({ href, label }: { href: string; label: string }) {
  const logo = useSquircleClip<HTMLAnchorElement>(12)
  const light = useHeaderTone() === "light"

  return (
    <a
      ref={logo.ref}
      style={logo.style}
      href={href}
      id="nav_header_home"
      aria-label={`${label} home`}
      className="js-track js-nav js-click js-header site-header__logo p-1.5"
    >
      <img
        src="/logo.svg"
        alt=""
        className={cn("block size-12 shrink-0 rounded-[10px] object-contain", light ? "" : "brightness-0 invert")}
      />
    </a>
  )
}

function handleNavAnchorClick(
  event: React.MouseEvent<HTMLElement>,
  href: string,
  onNavigate?: () => void
) {
  onNavigate?.()
  if (href.startsWith("#")) {
    const target = document.querySelector(href)
    if (target) {
      event.preventDefault()
      target.scrollIntoView({ behavior: "smooth", block: "start" })
      if (typeof history !== "undefined" && history.pushState) {
        history.pushState(null, "", href)
      } else if (typeof window !== "undefined") {
        window.location.hash = href
      }
    }
  }
}

function HeaderActions({
  items,
  className,
  onNavigate,
  label,
  appear = false,
  githubRepo,
  menuItemsByHref,
}: {
  items: HeaderItem[]
  className?: string
  onNavigate?: () => void
  label: string
  appear?: boolean
  githubRepo?: string
  menuItemsByHref?: Record<string, HeaderMenuItem[]>
}) {
  const light = useHeaderTone() === "light"
  const group = useNavMenuGroup(items, menuItemsByHref)

  return (
    <motion.div
      role="group"
      aria-label={label}
      className={cn(
        "site-header__links",
        light ? "text-ink" : "text-paper",
        className
      )}
    >
      {items.map((item) => {
        const menuItems = menuItemsByHref?.[item.href]
        const hasMenu =
          !!menuItems &&
          menuItems.length > 0 &&
          item.variant !== "cta" &&
          item.variant !== "pricing"

        const link =
          githubRepo && item.href === "/login" ? (
            <GithubStarsLink
              key={item.href}
              repo={githubRepo}
              className="site-header__link"
            />
          ) : item.variant === "cta" ? (
            <Button
              key={item.href}
              asChild
              variant="blue"
              shadow="hard"
              size="default"
              id={headerNavId(item.href)}
              onClick={(e) => handleNavAnchorClick(e, item.href, onNavigate)}
              className={cn(
                "js-header js-track js-click js-nav site-header__link",
                "h-10 px-4 text-base font-medium",
              )}
            >
              <a href={item.href} className="inline-flex items-center gap-1.5">
                {(() => {
                  const ear = resolveItemEar(item)
                  return ear ? (
                    <motion.img
                      src={ear.src}
                      alt=""
                      aria-hidden="true"
                      style={ear.filter ? { filter: ear.filter } : undefined}
                      className="size-5 shrink-0 object-contain drop-shadow-sm"
                      animate={
                        ear.jitter
                          ? {
                              x: [0, -2, 3, -2, 2, -3, 2, 0],
                              y: [0, 2, -2, 3, -2, 2, -1, 0],
                              rotate: [0, -5, 6, -4, 5, -3, 4, 0],
                            }
                          : undefined
                      }
                      transition={
                        ear.jitter
                          ? { duration: 0.22, repeat: Infinity, ease: "easeInOut" }
                          : undefined
                      }
                    />
                  ) : null
                })()}
                <span>{item.label}</span>
              </a>
            </Button>
          ) : item.variant === "pricing" ? (
            <Button
              key={item.href}
              asChild
              variant="ink"
              shadow="hard"
              size="default"
              id={headerNavId(item.href)}
              onClick={(e) => handleNavAnchorClick(e, item.href, onNavigate)}
              className={cn(
                "js-header js-track js-click js-nav site-header__link",
                "h-10 px-4 text-base font-medium",
              )}
            >
              <a href={item.href} className="inline-flex items-center gap-1.5">
                {(() => {
                  const ear = resolveItemEar(item)
                  return ear ? (
                    <motion.img
                      src={ear.src}
                      alt=""
                      aria-hidden="true"
                      style={ear.filter ? { filter: ear.filter } : undefined}
                      className="size-5 shrink-0 object-contain drop-shadow-sm"
                      animate={
                        ear.jitter
                          ? {
                              x: [0, -2, 3, -2, 2, -3, 2, 0],
                              y: [0, 2, -2, 3, -2, 2, -1, 0],
                              rotate: [0, -5, 6, -4, 5, -3, 4, 0],
                            }
                          : undefined
                      }
                      transition={
                        ear.jitter
                          ? { duration: 0.22, repeat: Infinity, ease: "easeInOut" }
                          : undefined
                      }
                    />
                  ) : null
                })()}
                <span>{item.label}</span>
              </a>
            </Button>
          ) : hasMenu ? (
            <NavMenuTrigger
              key={item.href}
              item={item}
              group={group}
              onNavigate={onNavigate}
              appear={appear}
            />
          ) : (
            <SquircleLink
              key={item.href}
              href={item.href}
              id={headerNavId(item.href)}
              track="nav"
              onClick={(e) => handleNavAnchorClick(e, item.href, onNavigate)}
              className={cn(
                "js-header site-header__link group",
                "inline-flex items-center gap-1.5 text-base font-medium",
                light
                  ? "text-ink hover:bg-ink/10"
                  : "text-paper hover:bg-paper/10"
              )}
            >
              {(() => {
                const ear = resolveItemEar(item)
                return ear ? (
                  <motion.img
                    src={ear.src}
                    alt=""
                    aria-hidden="true"
                    style={ear.filter ? { filter: ear.filter } : undefined}
                    className="size-5 shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110"
                    animate={
                      ear.jitter
                        ? {
                            x: [0, -2, 3, -2, 2, -3, 2, 0],
                            y: [0, 2, -2, 3, -2, 2, -1, 0],
                            rotate: [0, -5, 6, -4, 5, -3, 4, 0],
                          }
                        : undefined
                    }
                    transition={
                      ear.jitter
                        ? { duration: 0.22, repeat: Infinity, ease: "easeInOut" }
                        : undefined
                    }
                  />
                ) : null
              })()}
              <span>{item.label}</span>
            </SquircleLink>
          )

        if (hasMenu) {
          return link
        }

        if (!appear) {
          return <React.Fragment key={item.href}>{link}</React.Fragment>
        }

        return (
          <motion.span
            key={item.href}
            className="inline-flex"
            variants={navLinkVariants}
            transition={fadeMotion}
          >
            {link}
          </motion.span>
        )
      })}
      {group.anyMenus ? (
        <NavMenuFloatingPanel group={group} onNavigate={onNavigate} />
      ) : null}
    </motion.div>
  )
}

type NavMenuGroup = {
  anyMenus: boolean
  activeHref: string | null
  items: HeaderMenuItem[]
  hasMenu: (item: HeaderItem) => boolean
  openHref: (href: string, node: HTMLElement | null) => void
  scheduleClose: () => void
  clearPending: () => void
  refs: ReturnType<typeof useFloating>["refs"]
  floatingStyles: React.CSSProperties
  context: ReturnType<typeof useFloating>["context"]
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"]
  panelRef: { current: HTMLDivElement | null }
  /** True when this open happened by moving directly from another already-open menu in the group (not from a cold start). */
  isSwitch: boolean
  /** Which way the trigger moved when switching: 1 = toward the end of the list (right), -1 = toward the start (left). */
  direction: 1 | -1
}

/**
 * Drives a single shared floating panel for a row of nav links that each
 * reveal a menu on hover. Rather than every link mounting its own
 * independent panel, one panel lives for the whole group: it only
 * mounts/unmounts when the group goes from "nothing hovered" to
 * "something hovered" (and back), and while it's open, moving from one
 * trigger to the next just repositions/resizes that same panel instead of
 * closing one and opening another.
 */
function useNavMenuGroup(
  items: HeaderItem[],
  menuItemsByHref?: Record<string, HeaderMenuItem[]>,
): NavMenuGroup {
  const [activeHref, setActiveHref] = React.useState<string | null>(null)
  const [isSwitch, setIsSwitch] = React.useState(false)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  const hasMenu = React.useCallback(
    (item: HeaderItem) =>
      !!menuItemsByHref?.[item.href]?.length &&
      item.variant !== "cta" &&
      item.variant !== "pricing",
    [menuItemsByHref],
  )

  const anyMenus = items.some(hasMenu)
  const open = activeHref !== null

  const { refs, floatingStyles, context, update } = useFloating({
    open,
    onOpenChange: (next) => {
      if (!next) setActiveHref(null)
    },
    placement: "bottom-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: (reference, floating, updateFn) =>
      autoUpdate(reference, floating, updateFn, {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
        layoutShift: false,
      }),
    middleware: [
      offset(16),
      shift({ mainAxis: false, padding: 16 }),
      size({
        apply({ elements }) {
          const width = Math.min(880, window.innerWidth - 32)
          elements.floating.style.width = `${width}px`
        },
      }),
    ],
  })
  const dismiss = useDismiss(context, { escapeKey: true })
  const { getFloatingProps } = useInteractions([dismiss])

  const clearPending = React.useCallback(() => {
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  // Switch (or open) immediately — no per-item mount/unmount, just point the
  // shared floating panel at the newly hovered trigger. When moving between
  // two menus that are both already open, work out which way we moved so
  // the panel content can slide in from that side instead of restaging.
  const openHref = React.useCallback(
    (href: string, node: HTMLElement | null) => {
      clearPending()
      if (node) refs.setReference(node)
      if (activeHref && activeHref !== href) {
        const prevIndex = items.findIndex((i) => i.href === activeHref)
        const nextIndex = items.findIndex((i) => i.href === href)
        if (prevIndex !== -1 && nextIndex !== -1 && prevIndex !== nextIndex) {
          setDirection(nextIndex > prevIndex ? 1 : -1)
        }
        setIsSwitch(true)
      } else {
        setIsSwitch(false)
      }
      setActiveHref(href)
      requestAnimationFrame(() => update())
    },
    [activeHref, clearPending, items, refs, update],
  )

  // Small delay on close so moving from a trigger down into the panel (or
  // sideways into the next trigger) doesn't flicker-close the panel.
  const scheduleClose = React.useCallback(() => {
    clearPending()
    timeoutRef.current = setTimeout(() => setActiveHref(null), 250)
  }, [clearPending])

  React.useEffect(() => clearPending, [clearPending])

  return {
    anyMenus,
    activeHref,
    items: activeHref ? menuItemsByHref?.[activeHref] ?? [] : [],
    hasMenu,
    openHref,
    scheduleClose,
    clearPending,
    refs,
    floatingStyles,
    context,
    getFloatingProps,
    panelRef,
    isSwitch,
    direction,
  }
}

function NavMenuTrigger({
  item,
  group,
  onNavigate,
  appear = false,
}: {
  item: HeaderItem
  group: NavMenuGroup
  onNavigate?: () => void
  appear?: boolean
}) {
  const light = useHeaderTone() === "light"
  const nodeRef = React.useRef<HTMLAnchorElement | null>(null)
  const isOpen = group.activeHref === item.href
  const ear = resolveItemEar(item)

  const handleEnter = () => group.openHref(item.href, nodeRef.current)
  const handleLeave = () => group.scheduleClose()

  const trigger = (
    <SquircleLink
      ref={nodeRef}
      href={item.href}
      id={headerNavId(item.href)}
      track="nav"
      onClick={(e) => handleNavAnchorClick(e, item.href, onNavigate)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={(e: React.FocusEvent<HTMLAnchorElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          handleLeave()
        }
      }}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className={cn(
        "js-header js-track js-click js-nav site-header__link group",
        "inline-flex items-center gap-1.5 text-base font-medium",
        light
          ? "text-ink hover:bg-ink/10"
          : "text-paper hover:bg-paper/10",
      )}
    >
      {ear ? (
        <motion.img
          src={ear.src}
          alt=""
          aria-hidden="true"
          style={ear.filter ? { filter: ear.filter } : undefined}
          className="size-5 shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110"
          animate={
            ear.jitter
              ? {
                  x: [0, -2, 3, -2, 2, -3, 2, 0],
                  y: [0, 2, -2, 3, -2, 2, -1, 0],
                  rotate: [0, -5, 6, -4, 5, -3, 4, 0],
                }
              : undefined
          }
          transition={
            ear.jitter
              ? { duration: 0.22, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
      ) : null}
      <span>{item.label}</span>
      <ChevronDown
        size={16}
        strokeWidth={2.25}
        className={cn(
          "stroke-current transition-transform duration-150",
          isOpen && "rotate-180",
        )}
      />
    </SquircleLink>
  )

  if (!appear) {
    return <React.Fragment key={item.href}>{trigger}</React.Fragment>
  }

  return (
    <motion.span
      key={item.href}
      className="inline-flex"
      variants={navLinkVariants}
      transition={fadeMotion}
    >
      {trigger}
    </motion.span>
  )
}

/**
 * The single floating panel shared by a `NavMenuTrigger` row. It mounts
 * once the first trigger in the group is hovered and unmounts once the
 * group is fully left (the "crop wipe" open/close). While it's open,
 * hovering a different trigger in the same group just morphs this same
 * panel — position and height animate via layout, and the inner content
 * cross-fades — instead of closing one panel and mounting a new one.
 */
function NavMenuFloatingPanel({
  group,
  onNavigate,
}: {
  group: NavMenuGroup
  onNavigate?: () => void
}) {
  const open = group.activeHref !== null

  return (
    <FloatingPortal
      root={typeof document !== "undefined" ? document.body : undefined}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            {...group.getFloatingProps()}
            ref={(node) => {
              group.refs.setFloating(node)
              group.panelRef.current = node
            }}
            style={{ ...group.floatingStyles, zIndex: 9999 }}
            className="z-[9999]"
            layout
            transition={surfaceTransition}
            onMouseEnter={group.clearPending}
            onMouseLeave={group.scheduleClose}
          >
            <HeaderMenuSurface label="Menu panel">
              <AnimatePresence mode="popLayout" initial={false} custom={group}>
                <motion.div
                  key={group.activeHref}
                  custom={group}
                  variants={navSwitchVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={fadeMotion}
                >
                  <HeaderMenuList
                    items={group.items}
                    animateItems={!group.isSwitch}
                    onNavigate={() => {
                      group.clearPending()
                      onNavigate?.()
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </HeaderMenuSurface>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </FloatingPortal>
  )
}

const menuEase = [0.22, 1, 0.36, 1] as const
const fadeMotion = { duration: 0.28, ease: menuEase }
const navSwitchOffset = 32
const navSwitchVariants = {
  initial: (group: NavMenuGroup) =>
    group.isSwitch
      ? { opacity: 0, x: group.direction * navSwitchOffset }
      : { opacity: 0, x: 0 },
  animate: { opacity: 1, x: 0 },
  exit: (group: NavMenuGroup) =>
    group.isSwitch
      ? { opacity: 0, x: group.direction * -navSwitchOffset }
      : { opacity: 0, x: 0 },
}
const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.28 },
  },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}
const staticListVariants = { hidden: {}, show: {} }
const staticItemVariants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
}
const surfaceInitial = { height: 0 }
const surfaceAnimate = { height: "auto" }
const surfaceExit = { height: 0 }
const surfaceTransition = { duration: 0.42, ease: menuEase }
const swatchInitial = { opacity: 0, scale: 0.7 }
const swatchAnimate = { opacity: 1, scale: 1 }
const navCollapseTransition = { duration: 0.36, ease: menuEase }
const navCollapseVariants = {
  hidden: { width: 0, opacity: 0 },
  show: {
    width: "auto",
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}
const navLinkVariants = {
  hidden: { opacity: 0, x: 10 },
  show: { opacity: 1, x: 0 },
}

function MenuSwatch({
  className,
  ear,
}: {
  className: string
  ear?: { src: string; filter?: string; jitter?: boolean }
}) {
  const swatch = useSquircleClip<HTMLSpanElement>(12)

  return (
    <motion.span
      ref={swatch.ref}
      style={swatch.style}
      aria-hidden="true"
      className={cn("relative flex size-14 shrink-0 items-center justify-center overflow-hidden", className)}
      initial={swatchInitial}
      animate={swatchAnimate}
      transition={fadeMotion}
    >
      {ear ? (
        <img
          src={ear.src}
          alt=""
          aria-hidden="true"
          style={ear.filter ? { filter: ear.filter } : undefined}
          className="relative z-10 size-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
        />
      ) : null}
    </motion.span>
  )
}

function HeaderMenuIcon({ open }: { open: boolean }) {
  const light = useHeaderTone() === "light"

  return (
    <span
      className={cn(
        "relative inline-flex size-6 items-center justify-center",
        light ? "text-ink" : "text-paper"
      )}
      aria-hidden="true"
    >
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.span
            key="close"
            className="absolute inset-0 inline-flex items-center justify-center"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <X
              size={24}
              strokeWidth={2}
              className="stroke-current"
            />
          </motion.span>
        ) : (
          <motion.span
            key="open"
            className="absolute inset-0 inline-flex items-center justify-center"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Menu
              size={24}
              strokeWidth={2}
              className="stroke-current"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

function HeaderMenuSurface({
  children,
  id,
  label,
}: {
  children: React.ReactNode
  id?: string
  label: string
}) {
  const panel = useSquircleClip<HTMLDivElement>(28)
  const nodeRef = React.useRef<HTMLDivElement | null>(null)
  const setRef = useComposedRef(panel.ref, nodeRef)
  const revealed = React.useRef(false)
  const light = useHeaderTone() === "light"

  const syncClip = React.useCallback(() => {
    const el = nodeRef.current
    if (!el) return
    const clipPath = squircleClipPath(el.offsetWidth, el.offsetHeight, 28)
    if (clipPath) el.style.clipPath = clipPath
  }, [])

  return (
    <motion.div
      ref={setRef}
      id={id}
      role="group"
      aria-label={label}
      style={panel.style}
      layout
      className={cn(
        "w-full overflow-hidden",
        light ? "bg-white text-ink" : "bg-ink text-paper"
      )}
      initial={revealed.current ? false : surfaceInitial}
      animate={surfaceAnimate}
      exit={surfaceExit}
      transition={surfaceTransition}
      onUpdate={syncClip}
      onAnimationStart={syncClip}
      onAnimationComplete={() => {
        revealed.current = true
        syncClip()
      }}
    >
      <div className="p-2">{children}</div>
    </motion.div>
  )
}

function HeaderMenuCardIconBox({
  item,
  isHovered,
}: {
  item: HeaderMenuItem
  isHovered: boolean
}) {
  const clip = useSquircleClip<HTMLSpanElement>(10)
  const border = useSquircleBorder<HTMLSpanElement>(10)
  const icon = resolveMenuIcon(item.icon)
  const hasIcon = !!icon
  const ear = resolveItemEar(item)

  return (
    <span
      ref={border.ref}
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden"
    >
      <span
        ref={clip.ref}
        style={clip.style}
        className={cn(
          "absolute inset-0 transition-colors duration-150",
          hasIcon ? "bg-[#F4F9FF]" : item.swatchClassName,
          isHovered && "bg-[#2A8CFF]",
        )}
        aria-hidden="true"
      />
      {ear ? (
        <motion.img
          src={ear.src}
          alt=""
          aria-hidden="true"
          style={ear.filter ? { filter: ear.filter } : undefined}
          className="relative z-10 size-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
          animate={
            ear.jitter
              ? {
                  x: [0, -3, 3, -2, 3, -3, 2, 0],
                  y: [0, 3, -3, 2, -3, 2, -2, 0],
                  rotate: [0, -6, 6, -5, 5, -4, 4, 0],
                }
              : isHovered
                ? { scale: 1.15, rotate: 8 }
                : { scale: 1, rotate: 0 }
          }
          transition={
            ear.jitter
              ? { duration: 0.22, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        />
      ) : hasIcon ? (
        <span className={cn(
          "relative z-10 flex size-7 items-center justify-center transition-colors duration-150",
          isHovered ? "text-white" : "text-[#288DFF]",
        )}>
          {icon}
        </span>
      ) : null}
      <svg
        width={border.state.width}
        height={border.state.height}
        viewBox={border.state.path ? `0 0 ${border.state.width} ${border.state.height}` : undefined}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        {border.state.path ? (
          <path
            d={border.state.path}
            fill="none"
            stroke={hasIcon ? (isHovered ? "rgba(255,255,255,0.3)" : "#C9E3FF") : "rgba(0,0,0,0)"}
            strokeWidth={1}
          />
        ) : null}
      </svg>
    </span>
  )
}

function HeaderMenuCard({
  item,
  onNavigate,
  light,
  variants = itemVariants,
}: {
  item: HeaderMenuItem
  onNavigate: () => void
  light: boolean
  variants?: typeof itemVariants
}) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <motion.a
      href={item.href}
      id={headerNavId(item.href)}
      role="menuitem"
      aria-label={`${item.label}: ${item.description ?? ""}`}
      onClick={(e) => handleNavAnchorClick(e, item.href, onNavigate)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex max-w-[400px] items-center gap-4 rounded-xl px-3 py-3"
      variants={variants}
      transition={fadeMotion}
    >
      <HeaderMenuCardIconBox item={item} isHovered={isHovered} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={cn(
            "text-lg font-semibold transition-colors",
            light ? "text-[#0D2A4C] group-hover:text-[#288DFF]" : "text-paper group-hover:text-[#87BDF7]",
          )}
        >
          {item.label}
        </p>
        {item.description ? (
          <p
            className={cn(
              "text-[13px] font-medium leading-snug",
              light ? "text-[rgba(13,42,76,0.6)]" : "text-paper/60",
            )}
          >
            {item.description}
          </p>
        ) : null}
      </div>
    </motion.a>
  )
}

function HeaderMenuList({
  id,
  items,
  onNavigate,
  animateItems = true,
}: {
  id?: string
  items: HeaderMenuItem[]
  onNavigate: () => void
  /** When false, items appear immediately with no y-stagger — used while the
   * panel itself is sliding sideways during a switch, so the two motions
   * don't compete. */
  animateItems?: boolean
}) {
  const entered = React.useRef(false)
  const light = useHeaderTone() === "light"

  const hasCards = items.some((item) => item.description)
  const itemMotionVariants = animateItems ? itemVariants : staticItemVariants

  return (
    <motion.ul
      key={items.map((item) => item.href).join("|")}
      id={id}
      aria-label="Site pages"
      className={cn(
        "grid max-h-[min(70dvh,36rem)] gap-x-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        hasCards ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2",
      )}
      initial={animateItems ? (entered.current ? false : "hidden") : false}
      animate="show"
      variants={animateItems ? listVariants : staticListVariants}
      onAnimationComplete={() => {
        entered.current = true
      }}
    >
      {items.map((item) => (
        <motion.li
          key={item.href}
          className={cn(
            "pt-1 pb-1",
          )}
          variants={itemMotionVariants}
          transition={fadeMotion}
        >
          {item.description ? (
            <HeaderMenuCard
              item={item}
              onNavigate={onNavigate}
              light={light}
              variants={itemMotionVariants}
            />
          ) : (
            <a
              href={item.href}
              id={headerNavId(item.href)}
              role="menuitem"
              aria-label={`Go to ${item.label}`}
              className={cn(
                "js-track js-nav js-click js-header flex items-center gap-2 rounded-xl px-2 py-2.5 text-base focus-visible:outline-none",
                light
                  ? "hover:bg-ink/10 focus-visible:bg-ink/10"
                  : "hover:bg-dither-frame/10 focus-visible:bg-dither-frame/10"
              )}
              onClick={(e) => handleNavAnchorClick(e, item.href, onNavigate)}
            >
              <MenuSwatch className={item.swatchClassName} ear={resolveItemEar(item)} />
              <span className="min-w-0 flex-1 font-medium">{item.label}</span>
              <span
                aria-hidden="true"
                className={cn("hidden text-sm sm:inline", light ? "text-ink/50" : "text-paper/60")}
              >
                {item.action ?? "Explore"}
              </span>
            </a>
          )}
        </motion.li>
      ))}
    </motion.ul>
  )
}

function HeaderChrome({
  homeHref,
  logoLabel,
  navItems,
  accounts,
  open,
  menuId,
  leftPillRef,
  setPositionReference,
  setReference,
  getReferenceProps,
  githubRepo,
  menuItemsByHref,
}: {
  homeHref: string
  logoLabel: string
  navItems: HeaderItem[]
  accounts: HeaderItem[]
  open: boolean
  menuId?: string
  leftPillRef: React.Ref<HTMLDivElement>
  setPositionReference: (node: HTMLElement | null) => void
  setReference: (node: HTMLElement | null) => void
  getReferenceProps: (
    userProps?: React.HTMLProps<Element>
  ) => Record<string, unknown>
  githubRepo?: string
  menuItemsByHref?: Record<string, HeaderMenuItem[]>
}) {
  const [atTop, setAtTop] = React.useState(true)
  const [hoverExpand, setHoverExpand] = React.useState(false)
  const showNavLinks = atTop || hoverExpand || open
  const light = useHeaderTone() === "light"

  React.useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY <= 16
      setAtTop((wasTop) => {
        if (wasTop && !top) setHoverExpand(false)
        return top
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <div
      ref={setPositionReference}
      className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3"
    >
      <HeaderPill
        ref={leftPillRef}
        layoutSize
        onMouseEnter={() => {
          if (!atTop) setHoverExpand(true)
        }}
        onMouseLeave={() => setHoverExpand(false)}
        onFocusCapture={() => {
          if (!atTop) setHoverExpand(true)
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setHoverExpand(false)
          }
        }}
        className="flex h-16 min-w-0 flex-1 items-center pl-2 md:flex-none"
      >
        <div className="flex w-full items-center justify-between gap-1 md:w-auto md:justify-start">
          <HeaderLogo href={homeHref} label={logoLabel} />
          <div className="flex items-center gap-1 md:hidden">
            <HeaderActions
              items={accounts.filter(
                (item) => item.variant === "cta" || item.variant === "pricing" || item.variant === "ghost"
              )}
              label="Account"
              githubRepo={githubRepo}
              className="flex items-center gap-1"
            />
            <SquircleButton
              {...getReferenceProps()}
              ref={setReference}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls={menuId}
              aria-label={open ? "Close site menu" : "Open site menu"}
              className={cn(
                "md:hidden",
                light ? "text-ink hover:bg-ink/10" : "text-paper hover:bg-dither-frame/10"
              )}
            >
              <HeaderMenuIcon open={open} />
            </SquircleButton>
          </div>
          <div className="hidden md:block">
            <AnimatePresence>
              {showNavLinks ? (
                <motion.div
                  key="product-pricing"
                  className="overflow-hidden"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={navCollapseVariants}
                  transition={navCollapseTransition}
                >
                  <HeaderActions
                    items={navItems}
                    label="Services and resources"
                    appear
                    menuItemsByHref={menuItemsByHref}
                    className="flex items-center gap-1 whitespace-nowrap"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </HeaderPill>

      <HeaderPill className="hidden h-16 shrink-0 items-center gap-2 md:flex">
        <HeaderActions
          items={accounts}
          label="Account"
          githubRepo={githubRepo}
          className="flex items-center gap-2"
        />
      </HeaderPill>
    </div>
  )
}

function Header({
  isLoggedIn = false,
  homeHref = "/",
  logoLabel = "ListeningKit",
  className,
  tone = "light",
  navItems = defaultNavItems,
  accountItems,
  navMenuItems = defaultNavMenuItems,
  githubRepo,
}: HeaderProps) {
  const [open, setOpen] = React.useState(false)
  const menuId = useId()
  const panelId = useId()
  const listId = useId()
  const accounts =
    accountItems ?? (isLoggedIn ? loggedInAccountItems : loggedOutAccountItems)
  const leftPillRef = React.useRef<HTMLDivElement | null>(null)
  const menuWidthRef = React.useRef(0)

  const combinedMobileMenu = React.useMemo<HeaderMenuItem[]>(() => {
    const seen = new Set<string>()
    const out: HeaderMenuItem[] = []
    for (const items of Object.values(navMenuItems ?? {})) {
      for (const item of items) {
        if (!seen.has(item.href + item.label)) {
          seen.add(item.href + item.label)
          out.push(item)
        }
      }
    }
    return out
  }, [navMenuItems])

  React.useLayoutEffect(() => {
    const el = leftPillRef.current
    if (!el) return

    const capture = () => {
      if (window.scrollY <= 16) {
        menuWidthRef.current = el.offsetWidth
      }
    }

    capture()
    const observer = new ResizeObserver(capture)
    observer.observe(el)
    window.addEventListener("resize", capture)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", capture)
    }
  }, [])

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, update, {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
        layoutShift: false,
      }),
    middleware: [
      offset(16),
      shift({ mainAxis: false, padding: 16 }),
      size({
        apply({ rects, elements }) {
          const left = menuWidthRef.current || leftPillRef.current?.offsetWidth || rects.reference.width
          const desktop = window.matchMedia("(min-width: 768px)").matches
          const width = desktop
            ? Math.min(Math.max(left + 192, 32 * 16), window.innerWidth - 32)
            : Math.min(window.innerWidth - 32, 28 * 16)
          elements.floating.style.width = `${width}px`
        },
      }),
    ],
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "menu" })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ])

  return (
    <HeaderToneContext.Provider value={tone}>
    <nav
      aria-label="Primary navigation"
      className={cn(
        "site-header fixed top-0 left-0 z-50 flex w-full justify-center px-4 pt-4 text-base leading-6 text-ink",
        className
      )}
    >
      <HeaderChrome
        homeHref={homeHref}
        logoLabel={logoLabel}
        navItems={navItems}
        accounts={accounts}
        open={open}
        menuId={menuId}
        leftPillRef={leftPillRef}
        setPositionReference={refs.setPositionReference}
        setReference={refs.setReference}
        getReferenceProps={getReferenceProps}
        githubRepo={githubRepo}
        menuItemsByHref={navMenuItems}
      />

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="header-overlay"
                  aria-hidden="true"
                  className="fixed inset-0 z-[9998] h-dvh w-screen bg-ink/45"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: menuEase }}
                  onClick={() => setOpen(false)}
                />
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
      <FloatingPortal root={typeof document !== "undefined" ? document.body : undefined}>
        <AnimatePresence>
          {open ? (
            <FloatingFocusManager context={context} modal={false}>
              <div
                {...getFloatingProps()}
                ref={refs.setFloating}
                id={menuId}
                style={{ ...floatingStyles, zIndex: 9999 }}
                aria-label="Site menu"
                className="z-[9999] transition-none"
              >
                <HeaderMenuSurface id={panelId} label="Site menu panel">
                    <HeaderMenuList
                      id={listId}
                      items={combinedMobileMenu}
                      onNavigate={() => setOpen(false)}
                    />
                  </HeaderMenuSurface>
              </div>
            </FloatingFocusManager>
          ) : null}
        </AnimatePresence>
      </FloatingPortal>
    </nav>
    </HeaderToneContext.Provider>
  )
}

export { Header }