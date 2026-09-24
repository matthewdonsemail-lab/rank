# Self-Hosting & Local Development Guide

> Step-by-step instructions for running **Rank by ListeningKit** locally or deploying to production.

---

## Prerequisites

- **Node.js**: v20+ or v24+
- **pnpm**: v9+ or v10+
- **Nebius AI Studio API Key**: [studio.nebius.ai](https://studio.nebius.ai)
- **TypeSafe AI API Key** *(optional, for System One evaluations)*: [typesafe.ai](https://typesafe.ai)
- **Convex Account**: [convex.dev](https://convex.dev)

---

## Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/matthewdonsemail-lab/rank.git
cd rank
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the required credentials:

```env
# Nebius AI Studio
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_BASE_URL=https://api.studio.nebius.ai/v1
DEFAULT_RANK_MODEL=BAAI/bge-reranker-v2-m3

# Optional: TypeSafe AI
TYPESAFE_API_KEY=your_typesafe_key_here
TYPESAFE_BASE_URL=https://api.typesafe.ai

# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Server
PORT=3000
```

### 3. Start Development Server

```bash
pnpm run dev
```

The service will start on `http://localhost:3000`.

---

## Running Tests

```bash
pnpm run test
```

---

## Production Deployment

The production deployment runs at **[rank.listeningkit.com](https://rank.listeningkit.com)**.

1. Set environment variables on your hosting provider (e.g. Vercel, Netlify, or custom VPS).
2. Deploy backend functions to Convex:
   ```bash
   npx convex deploy
   ```
3. Set your custom domain (`rank.listeningkit.com`) in DNS pointing to your production deployment.
