import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@listeningkit/ui': fileURLToPath(new URL('./src/ui.tsx', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // The agent connector registry lives in rank-core so the CLI, the MCP
      // server, and this app all render the same CONNECTORS data. The module
      // is pure types plus data (no node builtins), so it bundles for the
      // browser unchanged.
      '@rank/connectors': fileURLToPath(
        new URL('../../packages/rank-core/src/connectors/index.ts', import.meta.url),
      ),
    },
  },
  server: {
    port: 3000,
  },
})
