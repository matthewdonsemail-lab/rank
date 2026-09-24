import { Treg } from "@listeningkit/treg";

/**
 * Helper to instantiate the Treg client wrapper from a component reference.
 */
export function createTregClient(componentRef: unknown): Treg {
  return new Treg(componentRef as any);
}
