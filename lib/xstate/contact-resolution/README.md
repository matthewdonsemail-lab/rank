# Contact Resolution Machine

`contactResolutionMachine` is an XState v6 machine for owner-scoped deliverability and contact resolution.
The contact-resolution machine owns deliverability state for one owner and one publication contact. It does not perform DNS or email-provider I/O in transition functions; Convex actions or future verification workers send typed results.

## States

- `idle`: resolution has not started.
- `checking_domain`: the sending domain and reputation are being checked.
- `checking_contact`: a candidate email is being verified or enriched.
- `deliverable`: a verified contact is ready for outreach.
- `needs_alternate`: the domain or contact cannot be used; a new candidate is required.
- `bounced`: a previously deliverable address bounced.
- `failed`: the resolver itself failed.
- `cancelled`: the owner or campaign stopped resolution.

## Context

Context stores the owner, publication domain/URL, candidate email, resolved email, verification source, confidence, reason, attempt count, timestamps, and error. Provider clients and API keys never enter the snapshot.

`RETRY` returns to `checking_domain` and increments `attempt`. A bounce moves `deliverable` to `bounced`, allowing an alternate contact path without losing the original resolution history.
