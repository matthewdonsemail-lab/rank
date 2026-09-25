import { Header } from './landing/Header'
import { Hero } from './landing/hero'

export function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header
        tone="light"
        homeHref="/"
        logoLabel="ListeningKit"
        navItems={[]}
        accountItems={[{ href: '#hero', label: 'Get started', variant: 'cta' }]}
      />
      <Hero />
    </div>
  )
}
