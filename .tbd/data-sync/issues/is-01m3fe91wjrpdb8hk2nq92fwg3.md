---
type: is
id: is-01m3fe91wjrpdb8hk2nq92fwg3
title: Port Usecase showcase and two-column auth screens plus /oauth callback route from listeningkit-hackathon
kind: task
status: closed
priority: 2
version: 2
labels: []
dependencies: []
created_at: 2026-09-26T18:05:14.001Z
updated_at: 2026-09-26T18:09:12.474Z
closed_at: 2026-09-26T18:09:12.473Z
close_reason: null
resolution: null
duplicate_of: null
---
Port the sibling listeningkit-hackathon auth stack into apps/web: vendored Toast into @listeningkit/ui target (src/ui.tsx), Usecase/UsecaseLoop/LazyVideo/Usecase.css into components/ui (Dither layer dropped), simplified OnboardingShell (Clouds/Dither dropped), OnboardingAuth two-column layout with OAuth platform cards and UsecaseLoop showcase, /oauth + /oauth/sign-up callback routes so Clerk finalize happens on a Rank-owned path, branchless icon SVG paths inlined (no simple-icons dep). Brand adapted to Rank, post-auth destination is home.
