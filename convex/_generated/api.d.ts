/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as brand from "../brand.js";
import type * as competitorDiscovery from "../competitorDiscovery.js";
import type * as email from "../email.js";
import type * as enrichment from "../enrichment.js";
import type * as firecrawl from "../firecrawl.js";
import type * as http from "../http.js";
import type * as lib_firecrawl from "../lib/firecrawl.js";
import type * as lib_server from "../lib/server.js";
import type * as outbound from "../outbound.js";
import type * as prospectEvaluation from "../prospectEvaluation.js";
import type * as rank from "../rank.js";
import type * as telnyx from "../telnyx.js";
import type * as treg from "../treg.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  brand: typeof brand;
  competitorDiscovery: typeof competitorDiscovery;
  email: typeof email;
  enrichment: typeof enrichment;
  firecrawl: typeof firecrawl;
  http: typeof http;
  "lib/firecrawl": typeof lib_firecrawl;
  "lib/server": typeof lib_server;
  outbound: typeof outbound;
  prospectEvaluation: typeof prospectEvaluation;
  rank: typeof rank;
  telnyx: typeof telnyx;
  treg: typeof treg;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  agentmail: import("@agentmail/convex/_generated/component.js").ComponentApi<"agentmail">;
  firecrawl: import("@firecrawl/firecrawl-convex/_generated/component.js").ComponentApi<"firecrawl">;
  treg: import("@listeningkit/treg/_generated/component.js").ComponentApi<"treg">;
  telnyx: import("@listeningkit/telnyx/_generated/component.js").ComponentApi<"telnyx">;
};
