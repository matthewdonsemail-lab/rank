# OAuth for the MCP server — one authorization server, any MCP client

**Status: SHIPPED and live on production.** Built in the six steps below, each reviewed
before the next. The acceptance test passed — the MCP SDK's own OAuth client drove the
whole flow with no treg-specific special case — and ChatGPT connected over CIMD, made a
metered call and was billed correctly. Reference doc: `docs/context/architecture/mcp-oauth.md`.

## Not a ChatGPT feature

The MCP authorization spec is not ChatGPT's. Any client that implements it — Claude Code, Claude
Desktop, Cursor, whatever ships next — uses the same two metadata documents, the same PKCE flow, the
same consent screen. **ChatGPT is the first consumer, not the design target.** Written that way it
also becomes the answer to a problem the Codex path has today: a bearer token in an environment
variable is a credential the user copies by hand, and this replaces it with "open a link, choose a
team, done".

Two decisions follow, both cheap now and awkward to retrofit:

- **No hard-coded redirect URI.** ChatGPT's `https://chatgpt.com/connector/oauth/{callback_id}` is
  one registered client's callback, validated per client — not a constant in our code.
- **Support dynamic client registration as well as CIMD.** ChatGPT prefers CIMD; Claude Code and most
  other clients use DCR. Supporting only CIMD would quietly lock everyone else out, and we would not
  notice because our one test client is the one that does not need it.

## Why this is not optional

ChatGPT's connector form offers exactly three authentication choices: **OAuth**, **No Auth**, **Mixed**.
There is no bearer-token option. Codex has one (`codex mcp add --bearer-token-env-var`), which is why
the Codex half works today and the ChatGPT half does not.

`No Auth` is not a lesser version of the product, it is a different product. Verified against
production with no token:

| tool | No Auth |
|---|---|
| `catalog_search`, `catalog_get` | work — the catalog is public |
| `call`, `balance`, `my_tools` | `{"error": "not authenticated"}` |

treg is multi-tenant: every call has to answer whose balance pays, whose keys may be used, whose cap
applies, whose audit row is written. The token is what answers that. Without one there is no caller —
not for a reviewer, and not for anyone who installs the plugin. Putting a token in the URL instead
would hand every user in the directory the same team's balance and the same team's private keys,
which is the exact thing treg exists to prevent.

## The direction is new

treg already speaks OAuth, but only as a **client**: `oauth.py` builds PKCE challenges to sign in
with GitHub and Google and to connect provider accounts. Here treg must be the **authorization
server** — the thing that issues tokens rather than the thing that redeems them. That role does not
exist yet.

Two pieces do carry over:

- `session.py` mints HMAC-signed tokens with claims and an expiry (`make` / `read_claims`). An access
  token is the same shape with more claims, so the signing machinery is written and reviewed.
- The three sign-in doors (GitHub, Google, email code) already identify a human in a browser. The
  authorize endpoint reuses that session rather than inventing a login.

## What the spec requires

These come from the MCP authorization spec, which is what every compliant client implements. The
ChatGPT-specific column is only its redirect URI and its preference for CIMD — everything else is
common to all of them:

| Requirement | Detail |
|---|---|
| Flow | OAuth 2.1 authorization code + **PKCE `S256`** |
| Protected-resource metadata | `GET /.well-known/oauth-protected-resource` on the MCP host |
| Authorization-server metadata | `GET /.well-known/oauth-authorization-server` |
| Client identity | **CIMD** — ChatGPT sends an HTTPS metadata URL as `client_id`. Advertise `client_id_metadata_document_supported: true`. **We add DCR too**, for the clients that use it |
| Redirect URI | ChatGPT's is `https://chatgpt.com/connector/oauth/{callback_id}` — stored per client, never assumed |
| `resource` parameter | ChatGPT appends `resource=<our mcp url>` to authorize AND token requests; it **must** be copied into the token's `aud` claim |
| Client auth | `none` (public client + PKCE) or `private_key_jwt` |

## What gets built

### 0. Client registration — both ways in

`POST /oauth/register` (RFC 7591) for clients that register dynamically: they send their name and
redirect URIs, we store them and return a `client_id`. And CIMD for clients that send an HTTPS
metadata URL as their `client_id`, which we fetch and cache.

Same table either way, so everything downstream — authorize, token, consent — reads one shape and
does not care how the client arrived.

### 1. Two metadata documents

Static JSON, no state. `/.well-known/oauth-protected-resource` names the canonical resource
(`https://treg.superdesign.dev/mcp/`), points at treg as its own authorization server, and lists
scopes. `/.well-known/oauth-authorization-server` advertises the authorize and token endpoints,
`code_challenge_methods_supported: ["S256"]`, and CIMD support.

### 2. `GET /oauth/authorize` — the consent screen

Reuses the browser session. If the visitor is not signed in, send them through the existing door and
back. Then show one page: **which team** this connector may act for, and what it will be able to do.

The team picker is not decoration — it is the answer to a real problem. A person can belong to
several teams, and `balance` already had to refuse and ask when none was marked active. Consent is
where that choice genuinely belongs, made once by a human, instead of being guessed per call.

Issues a short-lived authorization code bound to: user, chosen org, `code_challenge`, `redirect_uri`,
and `resource`.

### 3. `POST /oauth/token` — the exchange

Verifies the PKCE verifier against the stored challenge (`S256`), that the redirect URI matches, and
that the code is unused and unexpired. Codes are **single-use** — deleted on redemption, so a replay
gets nothing.

Returns an access token carrying `sub` (user), `org` (the chosen team), `aud` (the `resource` value,
verbatim), and an expiry, plus a refresh token. Refresh matters: a connector that dies after an hour
and cannot recover is a support ticket per user per day.

### 3b. The user-facing link

Because the consent page is a normal URL, a client with no browser integration can still use it: print
the link, the human opens it, approves, and pastes back a short code — the same shape as
`treg login` today. That keeps Claude Code and any terminal client working without special support
from us.

### 4. Token acceptance in `mcp.py`

`_bearer()` already reads the header. It gains a branch: if the token is an OAuth access token,
validate the signature, check `aud` matches our own MCP URL — **rejecting a token minted for a
different resource is the whole point of that claim** — and resolve `sub`+`org` to the membership.
Existing per-org and identity tokens keep working unchanged, so Codex is unaffected.

### 5. Storage

One new table for authorization codes (short-lived, single-use) and one for refresh tokens
(revocable). Access tokens stay stateless like the session cookie: signed, self-describing, no lookup
on the hot path.

## What could go wrong, and where I would look first

- **`aud` mishandling.** If we accept a token whose audience is another resource, a token issued for
  someone else's server would work on ours. This is the single most important assertion in the test
  suite.
- **CIMD fetching.** `client_id` is a URL we retrieve. Fetching an attacker-supplied URL from our
  server is a request-forgery risk: it must be HTTPS, must be fetched with a timeout and no
  redirects to private addresses, and the result must be cached.
- **The consent screen is the security boundary.** It is the only place a human sees what they are
  granting. It has to name the team and the capability plainly, and it must not be embeddable in a
  frame.
- **Refresh-token rotation.** Rotate on use and detect reuse; a leaked refresh token that lives
  forever is worse than a short access token.
- **Scope creep into the proxy.** OAuth decides *who* is calling. It must not become a second place
  that decides *what* they may call — that stays in `_resolve_marketplace_call`, or the two copies
  drift.

## Order, and where to stop and look

1. Metadata documents + the `aud` check in `mcp.py`. Nothing issues tokens yet; this is the part that
   refuses the wrong ones.
2. Client registration — DCR and CIMD into one table.
3. `authorize` + `token` with PKCE, codes in the database, no UI — driven by tests.
4. The consent screen, including the team picker.
5. Refresh tokens and rotation.
6. **Stop, and connect a real client.** Two of them, deliberately: ChatGPT (CIMD) and Claude Code
   (DCR). If the second one needs a code change on our side, the design was wrong and this is the
   cheapest moment to learn it.
7. Then the plugin manifest, the demo recording, and the rest of the submission.

## Honest sizing

This is days, not hours — the flow itself is well-trodden, but it is a new security surface and the
test suite has to be convincing rather than merely green. The Codex path keeps working throughout and
needs none of it, so there is a shippable product the whole time.

Settled: this is a **general MCP authorization server**, not a ChatGPT integration. ChatGPT is the
first client through it, and the acceptance test for "did we build it right" is that a second client
— Claude Code — connects with no code changes on our side.
