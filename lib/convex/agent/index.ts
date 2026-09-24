// Domain types
export type {
  AgentSessionConfig,
  FormattedThreadMessage,
  AgentRunResult,
} from './types.js';

// Domain service
export { ConvexAgentClient } from './client.js';

// Clean helper re-exports
export {
  formatThreadMessage,
  filterVisibleMessages,
} from './helpers/index.js';
