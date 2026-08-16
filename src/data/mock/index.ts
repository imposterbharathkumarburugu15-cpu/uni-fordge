import type { ForgeState } from "@/types/domain";
import { ACTIVITY } from "./activity";
import { CONFLICTS, RESOLUTIONS } from "./conflicts";
import { EVIDENCE } from "./evidence";
import { PRODUCTS } from "./products";
import { SHIPMENTS } from "./shipments";
import { SOURCES } from "./sources";
import { SUPPLIERS } from "./suppliers";
import { SYSTEM_STATUS } from "./system";

/**
 * Single assembly point for all mock data.
 * Services swap this for real FastAPI responses without touching the UI.
 */
export function createInitialState(): ForgeState {
  return {
    suppliers: SUPPLIERS,
    sources: SOURCES,
    products: PRODUCTS,
    evidence: EVIDENCE,
    conflicts: CONFLICTS,
    resolutions: RESOLUTIONS,
    shipments: SHIPMENTS,
    activity: ACTIVITY,
    system: SYSTEM_STATUS,
  };
}
