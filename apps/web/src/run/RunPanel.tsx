import { useRun, type StepState } from './RunProvider'
import type { Prospect, RunResult, StepName } from './pipeline'

const STEP_LABELS: Record<StepName, string> = {
  enrichment: 'Reading your website',
  discovery: 'Finding your competitors',
  evaluation: 'Reading their sites, ranking them, and judging the best',
}
const STEP_ORDER: StepName[] = ['enrichment', 'discovery', 'evaluation']

const ACTION_LABEL: Record<Prospect['action'], string> = {
  act: 'Worth pitching',
  review: 'Needs a look',
  drop: 'Skip',
  failed: 'Could not judge',
}
const ACTION_STYLE: Record<Prospect['action'], string> = {
  act: 'bg-[#2A8CFF] text-white',
  review: 'bg-[#1A1A19] text-[#F8F8F8]',
  drop: 'bg-[#1A1A19]/10 text-[#1A1A19]/70',
  failed: 'bg-[#1A1A19]/10 text-[#1A1A19]/70',
}
const FIT_LABEL = ['No fit', 'Possible fit', 'Strong fit']

const LINK_BUTTON = 'self-start text-lg font-black text-[#1A1A19] underline decoration-[#2A8CFF] decoration-2 underline-offset-4'

function Steps({ steps }: { steps: StepState }) {
  return (
    <ol className="flex flex-col gap-3">
      {STEP_ORDER.map((step, index) => {
        const status = steps[step]
        const tone =
          status === 'done'
            ? 'bg-[#2A8CFF] text-white'
            : status === 'running'
              ? 'animate-pulse bg-[#1A1A19] text-[#F8F8F8]'
              : status === 'failed'
                ? 'bg-[#1A1A19] text-[#F8F8F8]'
                : 'bg-[#1A1A19]/10 text-[#1A1A19]/40'
        return (
          <li key={step} className="flex items-center gap-3 text-lg font-bold text-[#1A1A19]" aria-current={status === 'running' ? 'step' : undefined}>
            <span aria-hidden="true" className={'flex size-7 items-center justify-center text-sm font-black ' + tone}>
              {status === 'done' ? '✓' : status === 'failed' ? '!' : index + 1}
            </span>
            <span className={status === 'waiting' ? 'text-[#1A1A19]/40' : undefined}>{STEP_LABELS[step]}</span>
          </li>
        )
      })}
    </ol>
  )
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const facts: string[] = []
  if (prospect.confidence !== null) facts.push(`${Math.round(prospect.confidence * 100)}% sure`)
  if (prospect.fitScore !== null) facts.push(FIT_LABEL[Math.round(prospect.fitScore)] ?? `Fit ${prospect.fitScore}`)
  if (prospect.spamProbability !== null && prospect.spamProbability >= 0.5) facts.push('Looks spammy')
  return (
    <li className="flex flex-col gap-2 bg-white p-5 shadow-[0_2px_0_rgba(26,26,25,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href={prospect.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xl font-black text-[#1A1A19] underline decoration-[#2A8CFF] decoration-2 underline-offset-4"
        >
          {prospect.position}. {prospect.domain}
        </a>
        <span className={'px-3 py-1 text-sm font-black ' + ACTION_STYLE[prospect.action]}>{ACTION_LABEL[prospect.action]}</span>
      </div>
      {facts.length ? <p className="text-sm font-bold text-[#1A1A19]/60">{facts.join(' · ')}</p> : null}
      {prospect.reasons.map((reason) => (
        <p key={reason} className="text-base text-[#1A1A19]/80">
          {reason}
        </p>
      ))}
    </li>
  )
}

function Results({ result, onReset }: { result: RunResult; onReset(): void }) {
  const worth = result.prospects.filter((p) => p.action === 'act').length
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-black text-[#1A1A19]">{result.brand.name}</h2>
        <p className="text-lg text-[#1A1A19]/60">{result.brand.tagline}</p>
      </div>
      <p className="text-lg font-bold text-[#1A1A19]">
        Found {result.competitorsFound} competitors. Ranked them against your site and judged the best {result.prospects.length}:{' '}
        {worth === 0 ? 'none is a clear yes yet' : `${worth} worth pitching`}.
      </p>
      <ul className="flex flex-col gap-4">
        {result.prospects.map((prospect) => (
          <ProspectCard key={prospect.runId} prospect={prospect} />
        ))}
      </ul>
      <button type="button" onClick={onReset} className={LINK_BUTTON}>
        Try another site
      </button>
    </div>
  )
}

/** Shows a run under the hero: progress while it works, the ranked list when it is done, or what went wrong. */
export function RunPanel() {
  const { state, reset } = useRun()
  if (state.phase === 'idle') return null
  return (
    <section id="results" aria-live="polite" className="bg-[#f8f8f8] px-4 pb-24 pt-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {state.phase === 'running' ? (
          <>
            <h2 className="text-2xl font-black text-[#1A1A19]">Working on {state.website}</h2>
            <Steps steps={state.steps} />
            <p className="text-base text-[#1A1A19]/60">This can take a minute or two. Keep this page open.</p>
          </>
        ) : null}
        {state.phase === 'error' ? (
          <>
            {state.step ? <Steps steps={state.steps} /> : null}
            <p role="alert" className="text-lg font-bold text-[#1A1A19]">
              {state.message}
            </p>
            <button type="button" onClick={reset} className={LINK_BUTTON}>
              Try again
            </button>
          </>
        ) : null}
        {state.phase === 'done' ? <Results result={state.result} onReset={reset} /> : null}
      </div>
    </section>
  )
}
