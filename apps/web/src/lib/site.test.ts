import { describe, expect, it } from 'vitest'
import { parseWebsite } from './site'

describe('parseWebsite', () => {
  it('turns a bare domain, a pasted address and a sub-domain into a public https address', () => {
    expect(parseWebsite('acme.com')).toEqual({ ok: true, url: 'https://acme.com', host: 'acme.com' })
    expect(parseWebsite('  https://www.Acme.com/pricing?x=1#top ')).toEqual({ ok: true, url: 'https://acme.com', host: 'acme.com' })
    expect(parseWebsite('www.shop.acme.co.uk')).toMatchObject({ ok: true, host: 'shop.acme.co.uk' })
    expect(parseWebsite('my-site.io')).toMatchObject({ ok: true, host: 'my-site.io' })
  })

  it('refuses an empty box, something that is not a domain, credentials, ports and internal names', () => {
    for (const bad of ['', '   ', 'acme', 'acme.', '.com', 'a b.com', 'user@acme.com', 'acme.com:8080', 'localhost', 'router.local', 'x.internal', '127.0.0.1', 'javascript:alert(1)']) {
      expect(parseWebsite(bad), bad).toMatchObject({ ok: false })
    }
  })

  it('gives a reason in plain words', () => {
    const result = parseWebsite('acme')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toContain('acme.com')
  })
})
