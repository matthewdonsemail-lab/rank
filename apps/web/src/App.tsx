import { Header } from './landing/Header'
import { Hero } from './landing/hero'
import { RunPanel } from './run/RunPanel'
import { RunProviders } from './run/RunProvider'

export function App() {
  return (
    <RunProviders>
      <div className="min-h-screen bg-paper text-ink">
        <Header
          tone="light"
          homeHref="/"
          logoLabel="ListeningKit"
          navItems={[]}
          accountItems={[{ href: '#hero', label: 'Get started', variant: 'cta' }]}
        />
        <Hero />
        <RunPanel />
      </div>
    </RunProviders>
  )
}
