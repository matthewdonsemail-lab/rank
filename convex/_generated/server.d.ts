/* eslint-disable */
import {
  actionGeneric,
  httpActionGeneric,
  queryGeneric,
  mutationGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";

export const query: typeof queryGeneric;
export const mutation: typeof mutationGeneric;
export const action: typeof actionGeneric;
export const httpAction: typeof httpActionGeneric;
export const internalQuery: typeof internalQueryGeneric;
export const internalMutation: typeof internalMutationGeneric;
export const internalAction: typeof internalActionGeneric;
