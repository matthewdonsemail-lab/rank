---
type: is
id: is-01m3fewr0wxgdfs6fkz76g2r6x
title: Rename the CLI exchange route /cli-login to /cli
kind: task
status: closed
priority: 2
version: 2
labels: []
dependencies: []
created_at: 2026-09-26T18:15:59.259Z
updated_at: 2026-09-26T18:17:02.477Z
closed_at: 2026-09-26T18:17:02.477Z
close_reason: null
resolution: null
duplicate_of: null
---
Canonical web route for the browser half of rank login is now /cli; the CLI prints /cli URLs, old /cli-login URLs keep working as an alias for previously built CLI invocations, and the capabilities manifest + tests follow.
