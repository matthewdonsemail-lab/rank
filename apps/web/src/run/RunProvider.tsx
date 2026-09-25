import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ClerkProvider, useAuth, useClerk } from '@clerk/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient, useConvex } from 'convex/react'
import { anyApi } from 'convex/server'
import { parseWebsite } from '@/lib/site'
import {
  runProspecting,
  RunError,
  type ProspectAction,
  type QueueItem,
  type RunApi,
  type RunResult,
  type StepName,
  type StepStatus,
} from './pipeline'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

export type StepState = Record<StepName, 'waiting' | StepStatus | 'failed'>

export type RunState =
  | { phase: 'idle' }
  | { phase: 'running'; website: string; steps: StepState }
  | { phase: 'done'; website: string; result: RunResult }
  | { phase: 'error'; website: string; steps: StepState; step: StepName | null; message: string }

export interface RunControls {
  /** False when the Clerk or Convex address is missing, so a run cannot start. */
  configured: boolean
  state: RunState
  /** Start a run for what was typed in the hero box. Opens sign-in first when the visitor is signed out. */
  start(input: string): void
  reset(): void
}

const freshSteps = (): StepState => ({ enrichment: 'waiting', discovery: 'waiting', evaluation: 'waiting' })

const RunContext = createContext<RunControls>({ configured: false, state: { phase: 'idle' }, start: () => {}, reset: () => {} })

export const useRun = () => useContext(RunContext)

/** Backend calls for one signed-in visitor. `anyApi` builds the function names, so this needs no generated code. */
function useRunApi(): RunApi {
  const convex = useConvex()
  return useMemo(
    () => ({
      startEnrichment: (url) => convex.action(anyApi.enrichment.startBrandEnrichment, { url }),
      startDiscovery: (enrichmentRunId, limit) =>
        convex.action(anyApi.competitorDiscovery.startCompetitorDiscovery, { sourceEnrichmentRunId: enrichmentRunId, limit }),
      startEvaluations: (discoveryRunId, limit) =>
        convex.action(anyApi.prospectEvaluation.startCompetitorProspectEvaluations, { sourceDiscoveryRunId: discoveryRunId, limit }),
      listQueue: (action: ProspectAction) => {
        const query =
          action === 'act'
            ? anyApi.prospectEvaluation.listActiveProspects
            : action === 'review'
              ? anyApi.prospectEvaluation.listReviewProspects
              : anyApi.prospectEvaluation.listDroppedProspects
        return convex.query(query, {}) as Promise<QueueItem[]>
      },
    }),
    [convex],
  ) as RunApi
}

function LiveRunner({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const clerk = useClerk()
  const api = useRunApi()
  const [state, setState] = useState<RunState>({ phase: 'idle' })
  // What was typed before sign-in, so the run starts by itself once the visitor is back.
  const pending = useRef<string | null>(null)
  const running = useRef(false)

  const run = useCallback(
    async (website: string, url: string) => {
      if (running.current) return
      running.current = true
      const steps = freshSteps()
      setState({ phase: 'running', website, steps: { ...steps } })
      const onStep = (step: StepName, status: StepStatus) => {
        steps[step] = status
        setState({ phase: 'running', website, steps: { ...steps } })
      }
      try {
        setState({ phase: 'done', website, result: await runProspecting(api, url, onStep) })
      } catch (error) {
        const step = error instanceof RunError ? error.step : null
        if (step) steps[step] = 'failed'
        setState({ phase: 'error', website, steps: { ...steps }, step, message: error instanceof Error ? error.message : 'Something went wrong.' })
      } finally {
        running.current = false
      }
    },
    [api],
  )

  const start = useCallback(
    (input: string) => {
      const parsed = parseWebsite(input)
      if (!parsed.ok) {
        setState({ phase: 'error', website: input, steps: freshSteps(), step: null, message: parsed.reason })
        return
      }
      if (!isSignedIn) {
        pending.current = input
        clerk.openSignIn({})
        return
      }
      void run(parsed.host, parsed.url)
    },
    [clerk, isSignedIn, run],
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn || pending.current === null) return
    const input = pending.current
    pending.current = null
    start(input)
  }, [isLoaded, isSignedIn, start])

  const controls = useMemo<RunControls>(
    () => ({ configured: true, state, start, reset: () => setState({ phase: 'idle' }) }),
    [state, start],
  )
  return <RunContext.Provider value={controls}>{children}</RunContext.Provider>
}

/** Wraps the page. Without both addresses in the environment the page still shows, and a run says it is not switched on. */
export function RunProviders({ children }: { children: ReactNode }) {
  if (!publishableKey || !convexClient) {
    return <>{children}</>
  }
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        <LiveRunner>{children}</LiveRunner>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
