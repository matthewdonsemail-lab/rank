# Local proxy — catch the agent's calls without the agent knowing (`treg serve`)

**Status:** shipped (P0–P5 + `treg serve`, branch `feat/local-proxy`, 2026-07-30) · **Depends on:** one
small server addition, the `X-Treg-Error` marker · **v1 scope:** capture locally, inject on the server.

## The problem this solves

treg works today only when the agent is told to use it — `treg call …`, or the `/call/` URL. The moment
an agent writes its own script that calls `api.stripe.com` directly, treg is invisible and the script
has no key.

A local proxy closes that gap: the agent makes an ordinary call, we catch it on the way out, and the
**server** adds the credential. Nothing about the agent changes.

## What we take from oneCLI, and what we do not

Their design is two separable halves. We want one of them.

| Half | oneCLI | treg |
|---|---|---|
| Catching the request | `HTTPS_PROXY` + its own certificate authority | **same** |
| Applying the credential | locally, decrypting real keys on the user's machine | **on the server** — keys never land |

Their gateway holds `SECRET_ENCRYPTION_KEY` and decrypts secrets on the laptop (`crypto.rs`,
`connect.rs`). That is the exact situation treg exists to prevent, so we keep the capture mechanism and
throw away the injection half.

**v1 is server-injection only.** A future "inject locally under `treg-run`" mode is possible — the
grant path, the run-proof gate and the owned-vs-shared rule already exist — but it is deliberately out
of scope. Deciding it later costs nothing; getting it wrong now costs the product's main promise.

## How it works

```
agent → api.stripe.com/v1/charges
   ↓  HTTPS_PROXY=127.0.0.1:<port>
local proxy   — is this host a registered tool?
   ├─ no  → blind tunnel, bytes untouched, we never see inside
   └─ yes → terminate TLS with a leaf cert we sign, read the request, re-address it
              ↓
        treg server  POST /call/https://api.stripe.com/v1/charges   (X-Treg-Token)
              ↓  server injects the credential — the existing relay
        Stripe → response streams all the way back to the agent
```

The proxy carries the member's **treg token** and nothing else. No vendor key ever reaches the machine.

Because the call lands on the normal `/call/` path, everything already built applies unchanged: the
per-member tool ACL, project scope, deny rules, daily caps, the audit record, OAuth auto-refresh. There
is no second policy engine to write — the reason oneCLI needed 24k lines of Rust and we do not.

## Hard constraint: the CLI must stay light

`pip install tools-registry` is the **CLI only** (`httpx` + `questionary`). Certificate generation needs
`cryptography`, which is a compiled dependency and lives in the `[server]` extra today. It must not
enter the base install.

**Decision: a third extra, `[proxy]` → `cryptography` only.** The proxy itself uses `asyncio` + `ssl`
from the standard library and `httpx` (already base). Without the extra the proxy raises
`ProxyDependencyError` with the exact install line. `[server]` already includes `cryptography`, so a
self-hoster gets it free. **Shipped** — see `[project.optional-dependencies].proxy` in `pyproject.toml`.

## Components

| Piece | Where | Notes |
|---|---|---|
| Proxy server | `src/treg/localproxy.py` (new) | named for `localrun.py`; **not** `proxy.py`, which is the server relay |
| CA + leaf certs | same module | ECDSA P-256, leaf cached per host in memory |
| CLI flags | `cmd_shell_start` in `cli.py` | `treg shell start --proxy [--proxy-port] [--renew-ca]` |
| Daemon | `cmd_serve_*` in `cli.py` | `treg serve start\|stop\|status\|env` — `eval "$(treg serve env)"` |
| Shell wiring | `shell.py` | `start_session(extra_env=…, on_close=…)` publishes the env, stops the proxy |
| State | `~/.treg/proxy/` | `ca-key.pem` 0600 · `ca-cert.pem` 0644 · `ca-bundle.pem` 0644 · `proxy.json` 0600 (**daemon only** — port + proxy token, so another terminal can find it; `--proxy` writes none of it) · `serve.log`. Follows `TREG_CONFIG` when set |

### The environment we set

```
HTTPS_PROXY / HTTP_PROXY = http://treg:<local-token>@127.0.0.1:<port>
NODE_USE_ENV_PROXY       = 1      # Node's built-in fetch IGNORES HTTPS_PROXY without this
NODE_EXTRA_CA_CERTS      = ~/.treg/proxy/ca-bundle.pem
SSL_CERT_FILE            = "
REQUESTS_CA_BUNDLE       = "
CURL_CA_BUNDLE           = "
GIT_SSL_CAINFO           = "
DENO_CERT                = "
AWS_CA_BUNDLE            = "
NO_PROXY                 = localhost,127.0.0.1,<treg host>
```

`NODE_USE_ENV_PROXY` is the one that will otherwise cost a day of debugging: since Node 18 the built-in
`fetch` silently ignores proxy env vars and goes straight out. oneCLI carries the same flag in their
integration docs.

The bundle is **system CAs + ours**, so the agent still trusts the real internet. Never replace the
system roots; append to them.

## The non-negotiables

1. **The CA private key is generated per machine.** Never shipped, never shared, never committed. A
   single CA distributed to all users would let anyone impersonate any site to every user.
2. **Never touch the system trust store in v1.** Env-var scoping means only the agent's process tree
   trusts us — not the browser, not the OS. oneCLI does the same; there is no `add-trusted-cert`
   anywhere in their repo.
3. **Allow-list only.** Intercept a host only when it is a registered tool. Everything else is a blind
   tunnel we cannot read. This is also what stops us breaking (and reading) the agent's own calls to
   `api.anthropic.com` / `api.openai.com`.
4. **Bind `127.0.0.1` only** — never `0.0.0.0`.
5. **Proxy auth.** A random token minted per session, carried in the proxy URL, so another local process
   cannot quietly spend the member's quota through us.
6. **`trust_env=False` on the proxy's own httpx client.** Otherwise it reads `HTTPS_PROXY` from its own
   environment and talks to itself — an infinite loop on the first request.
7. **Never log bodies, headers or the token.** Host and status only.

## Phases — each independently testable

**P0 · Skeleton (no interception). — DONE.** Listen, authenticate, blind-tunnel everything both ways.
*Proof:* `curl -x http://treg:<token>@127.0.0.1:PORT https://example.com` works exactly as without the
proxy (verified: 200, `ssl_verify_result=0`); without the token it is a 407.

**P1 · Certificates. — DONE.** Generate + persist the CA, build the bundle, sign and cache leaf certs
(`ensure_ca`, `build_bundle`, `CertAuthority.leaf_pem` / `context_for`), plus `proxy_env()`, the exact
environment P4 will publish.
*Proof:* unit tests sign a leaf and complete a real TLS handshake against it; `curl --cacert
ca-bundle.pem` accepts it, and curl with the system roots alone rejects it.

**P2 · Intercept and forward. — DONE.** For allow-listed hosts: terminate TLS (`_intercept`), read the
request, re-address to `{base}/call/https://{host}{path}` (`_treg_url`), swap the caller's transport and
`x-treg-*` headers for our own (`_forward_headers`), and stream the answer back (`_write_response`).
Keep-alive is honoured, so several calls share one handshake.
*Proof:* `test_the_agent_calls_the_vendor_and_treg_injects_the_key` runs a plain `httpx.Client` — no treg
awareness, no key — through the proxy against the **real** FastAPI app; the credential arrives at the
upstream because the server injected it.

**P3 · Allow-list + errors. — DONE.** Fetch hosts from `GET /tools` at start, refresh on a timer — `ProxyConfig.hosts`
is the seam, currently filled by the caller. Map treg's failures to something readable: a 404 from
`_resolve_call` means "no tool registered for this host or path"; a 403 means "you do not have access".
(The treg-unreachable case is already handled — a 502 that names treg and says the vendor call was **not**
made, so an agent does not blame a healthy vendor and retry.)

**P4 · Wiring UX. — DONE.** `treg shell start` mints a token, starts the proxy and merges `handle.env(treg_host)`
into the subshell environment (`start_session` already builds that dict), stopping it on teardown. The
banner says which hosts are captured. No standalone command — decision 1.

**P5 · Docs. — DONE.** `docs/context/architecture/local-proxy.md` fragment (new subsystem, so it needs one),
plus `/llms.txt` and the dashboard's agent instructions.

## Testing

- **Unit, no network:** CA + leaf generation, allow-list matching, URL rewrite, header filtering,
  `NO_PROXY` parsing.
- **Integration:** run the proxy against the existing ASGI test app; drive it with `httpx` configured to
  use the proxy and trust the bundle. Assert the request that lands on `/call/` is byte-faithful.
- **Loop guard:** an explicit test that the proxy's own client ignores `HTTPS_PROXY`.
- **Blind tunnel:** assert a non-registered host is never decrypted (no leaf generated for it).

## Known limits — say these out loud in the docs

- **Certificate pinning.** A tool that accepts only its own exact certificate will refuse. Needs a
  per-host "never intercept" list.
- **Remote MCP servers are not covered.** A local (stdio) MCP server inherits our env and is captured; a
  hosted one makes its calls on someone else's machine.
- **Not HTTPS, not covered:** SSH, database wire protocols. WebSockets should be tunnelled, not
  intercepted — the relay is request/response.
- **Latency + a hard dependency.** Every intercepted call goes to treg and back; if treg is down those
  calls fail. This is the price of the key never landing.
- **Large uploads flow through us.** Watch request timeouts on Render.
- **Some vendor CLIs still need `treg run`.** `gh` refuses before it makes any network call, so there is
  nothing to intercept. The proxy widens coverage; it does not replace `treg run`.

## Deliberately not in v1

Local injection under `treg-run` · system trust store install · Windows · WebSocket interception ·
per-agent proxy tokens (one per session is enough) · request/response inspection beyond routing.

## Decisions (settled 2026-07-30, with Unclecode)

1. **Command shape — `treg shell start --proxy` first, `treg serve` added after.** The original
   decision was shell-only, because the proxy then starts and dies with a session and its token never
   has to be written to disk. After testing it live, Unclecode asked for the daemon too, so both
   shipped: `--proxy` for a subshell, `treg serve start|stop|status|env` for a background service that
   other terminals point at with `eval "$(treg serve env)"`. The daemon's cost is exactly the thing the
   first decision avoided — a `proxy.json` (0600) holding the port and the proxy token — and that is
   stated in USAGE so the choice is informed. `_start_proxy_handle` is the single shared code path.
2. **CA lifetime — 2 years**, regenerated automatically inside its last 30 days
   (`_RENEW_WITHIN_DAYS`), plus an explicit renew. Not oneCLI's 10 years: a key sitting on a laptop
   for a decade is a long time for something that can impersonate any site.
3. **Default port — 18791**, next to the dev server's 18790.
4. **`[proxy]` extra — yes**, `cryptography` alone. Folding it into base was rejected: it is compiled,
   and `pip install tools-registry` must stay the light CLI.

## Build log

- **P0 + P1 shipped** (2026-07-30) — `src/treg/localproxy.py`, `tests/test_localproxy.py` (34 tests).
  Verified with a real `curl`: `https://example.com` and `https://api.github.com` tunnel through
  untouched with certificate verification intact; a leaf signed by the CA is accepted by
  curl/OpenSSL when pointed at `ca-bundle.pem` and **rejected** with system roots only — the proof
  that non-negotiable #2 holds.
- The `_is_self` loop guard and the plain-`http://` forward path (which strips `Proxy-Authorization`
  before the upstream sees it) were added beyond the P0 sketch — `HTTP_PROXY` is set alongside
  `HTTPS_PROXY`, so an http caller must not simply break.
- **P2 shipped** (2026-07-30) — 21 more tests, 55 in the file. Beyond the sketch:
  - **The edge-WAF retry.** Render's edge 403s a body that looks like injection. The CLI's
    `_RegistryClient` already re-sends such a body base64-encoded under `X-Treg-Body-Encoding`; an
    intercepted call has to do the same, or a legitimate SQL query fails invisibly. Bodies up to 1 MiB
    are buffered so a retry is possible at all; larger ones stream and cannot be retried.
  - **`_CALLER_MUST_NOT_SET`.** An agent that sets its own `X-Treg-Token` must not be able to spend
    another member's quota through our proxy. The caller's `x-treg-*` headers are dropped; the proxy's
    identity is the only one that reaches treg.
  - **`intercepts()` refuses without a credential.** With no CA or no treg token we would terminate TLS
    and then have no way to finish the call — worse than not intercepting, because the agent's own
    request breaks for a reason it cannot see.
  - **`_body_chunks`.** `aiter_raw()` raises `StreamConsumed` on a response a transport already loaded,
    which would silently drop the body. Both shapes are handled.
  - **Framing is re-derived, not copied** — `Content-Length` when treg gave one, chunked when it did
    not — because our hop must be self-consistent even when the hop into treg was framed differently.

- **`treg serve` shipped** (2026-07-30, after the live test) — `cmd_serve_start/_stop/_status/_env` +
  the state helpers in `localproxy.py` (`write_state`, `read_state`, `running`, `pid_alive`). Two
  findings the tests produced, both real:
  - `pid_alive(0)` returned **True**, because `os.kill(0, …)` signals the caller's whole process
    group. A truncated pid in the state file would have read as "running", and `treg serve stop` would
    have signalled the user's terminal. Non-positive pids are now rejected before the call.
  - The parent said only "see the log" when the detached child died. It now prints the child's last
    log line — which is how the port-collision case reads as a sentence instead of a scavenger hunt.
- Verified live end to end: `serve start` → `eval "$(treg serve env)"` → a plain `curl` to a captured
  host arrived at the vendor with `Authorization: Bearer …` injected server-side, an uncaptured host
  went straight out, `--unset` cleared the shell, a second `start` was refused, `stop` removed the
  state file, and a stale file with a dead pid was cleaned up on the next call.

- **Agent hook shipped** (2026-07-30) — `treg serve hook [--install] [--agent]`. Unclecode asked how
  oneCLI avoids the eval; reading their code, it does not: `onecli run` is the parent, containers get
  `-e HTTPS_PROXY=…`, and their Claude plugin sets **`BASH_ENV`** to a generated `env.sh`
  (`plugins/claude/hooks/session-start.mjs:236`). We now do the third one, reusing the harness
  registry in `agents.py`. Proven with a bare `BASH_ENV=… bash -c 'curl …'`: credentialed while the
  proxy runs, plain after `serve stop`.
- **The hook was replaced by `treg <command>`, same day.** Unclecode rejected the global installer, and
  he was right: writing `BASH_ENV` into `~/.claude/settings.json` captures every session of that agent
  on the machine, forever, whether or not you wanted treg that day — and leaves no easy way to use your
  own personal key instead. The launcher (`cmd_with`) gives the same "no eval ever" result with none of
  the reach: treg is the parent of the one command it runs. `treg claude` uses team access; plain
  `claude` is untouched. Nothing is written to any config file. `treg serve hook`, `env.sh` and the
  three config installers were deleted — do not re-add them.
- **Next, requested but not built:** `treg claude` could also pre-load the team's skills into the
  session instead of the agent downloading and installing them.
- **Measured, and it corrects the plan:** `NODE_USE_ENV_PROXY` only exists from **Node 24**. On the dev
  machine (Node 23.11) `node --use-env-proxy` is a "bad option" and a plain `fetch()` through the proxy
  arrives uncredentialed. Setting the variable is still right for Node 24+, but the plan's line about it
  read as "Node works now", which is only true on 24. Documented in the fragment, USAGE and /llms.txt.
- **`examples/proxy-demo/`** — a zero-dependency Node app with a small web UI: click a button, it calls
  `api.openai.com` (registered) or `example.com` (not). `node server.js` gets a 401; `treg node
  server.js` gets the real answer, same code. It speaks CONNECT by hand because of the Node caveat
  above, and its README says why real apps do not need to.
