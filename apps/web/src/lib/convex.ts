import { ConvexReactClient } from "convex/react";

const deploymentUrl = import.meta.env.VITE_CONVEX_URL?.trim();

export const convexReactClient = deploymentUrl ? new ConvexReactClient(deploymentUrl) : null;
