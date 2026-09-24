# Convex Documentation Index

> Local offline copy of documentation from [docs.convex.dev](https://docs.convex.dev).

Convex is the reactive, type-safe database and backend application platform. All queries are pure TypeScript, cached automatically, and update client UIs reactively in real time.

---

## 📚 Complete Aggregated References

- **Full Documentation (Single File):** [`llms-full.txt`](./llms-full.txt) (2.6 MB complete reference covering all concepts, databases, functions, APIs, and client guides)
- **Upstream Index:** [`llms.txt`](./llms.txt)

---

## 🧭 Major Documentation Sections

### 1. Understanding & Architecture
- [Best Practices](./understanding/best-practices.md) — Essential architectural and performance best practices.
- [TypeScript Guidelines](./understanding/best-practices/typescript.md) — End-to-end type safety.
- [Convex Overview](./understanding/overview.md) — How the reactive database engine works.
- [Dev Workflow](./understanding/workflow.md) — Local development through production releases.
- [The Zen of Convex](./understanding/zen.md) — Philosophy and design patterns.

### 2. Database & Data Modeling
- [Database Overview](./database/overview.md) — JSON documents with relational indexing.
- [Reading Data & Queries](./database/reading-data.md) — Filtering, indexing, and ordering.
- [Indexes & Query Performance](./database/reading-data/indexes/indexes-and-query-perf.md) — Index optimization.
- [Writing Data & Mutations](./database/writing-data.md) — Atomic transactions and mutations.
- [Document IDs & Relations](./database/document-ids.md) — Defining relations with typed IDs.
- [Paginated Queries](./database/pagination.md) — Real-time infinite scroll & pagination.
- [OCC & Atomicity](./database/advanced/occ.md) — Optimistic concurrency control.

### 3. Server Functions & Runtimes
- [Functions Overview](./functions/overview.md) — Queries, mutations, and actions.
- [Query Functions](./functions/query-functions.md) — Deterministic, cached, reactive reads.
- [Mutation Functions](./functions/mutation-functions.md) — Transactional writes and updates.
- [Actions](./functions/actions.md) — Calling third-party APIs and non-deterministic tasks.
- [HTTP Actions](./functions/http-actions.md) — Building custom webhooks and REST endpoints.
- [Scheduling & Crons](./scheduling/cron-jobs.md) — Background jobs and recurring execution.
- [Validation](./functions/validation.md) — Argument and return value validators (`v.string()`, `v.object()`, etc.).

### 4. Search & AI
- [Search Overview](./search.md)
- [Vector Search](./search/vector-search.md) — Real-time embeddings and vector indexing.
- [Full-Text Search](./search/text-search.md) — BM25-style lexical search indexes.
- [AI Gateway](./ai-gateway/overview.md) — Managed LLM inference routing and caching.
- [Agents Framework](./agents/overview.md) — Building agent workflows on Convex.

### 5. Client Libraries & Quickstarts
- [Quickstarts Overview](./quickstart/overview.md) (React, Next.js, Bun, Node.js, Python, Swift, Kotlin, Rust)
- [React Client](./client/react.md) — `useQuery`, `useMutation`, `useAction`.
- [Next.js Integration](./client/react/nextjs.md) — App Router, Server Components, and SSR.
- [Python Client](./quickstart/python.md) — Python applications and scripts.
- [File Storage](./file-storage.md) — Uploading, serving, and deleting user files.
- [Authentication](./auth/overview.md) — Clerk, Auth0, WorkOS, and custom JWTs.

### 6. Management & Deployment APIs
- [CLI Reference](./cli.md) — `npx convex dev`, `npx convex deploy`, environment management.
- [Management API](./management-api.md) — Programmatic control of deployments and projects.
- [Deployment API](./deployment-api.md) — Environment variables, secrets, and runs.
