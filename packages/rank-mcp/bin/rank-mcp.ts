#!/usr/bin/env bun
/**
 * Rank MCP server entrypoint.
 *
 * Speaks the Model Context Protocol over stdio. stdout is reserved for protocol
 * frames, so every diagnostic goes to stderr.
 */
import { startServer } from "../src/mcp/index.ts";

await startServer();
