# Channel Profiles

The `channels` field stores optional communication profiles on a `BrandEntity`. It is data for local reply simulation and future consumers; it is not a currently active outreach stage.

Each profile may contain:

- `style`: `casual` or `standard`.
- `examples`: User-approved writing examples.
- `triage`: Ordered contextual guidance.
- `autoreplies`: Keyword-matched response templates.

`simulateOutbound()` resolves a context string against enabled channel profiles using the brand helpers. It returns a simulated result and does not call an external messaging provider.
