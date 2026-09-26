#!/usr/bin/env bun
/**
 * Rank CLI entrypoint.
 *
 * A thin wrapper on purpose: argument parsing, command dispatch, and all
 * behaviour live in the `cli` domain so they can be tested without spawning a
 * process.
 */
import { runCli } from "../src/cli/index.ts";

const code = await runCli(process.argv.slice(2));
process.exit(code);
