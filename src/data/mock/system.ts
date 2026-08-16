import type { SystemStatus } from "@/types/domain";
import { ago } from "./time";

export const SYSTEM_STATUS: SystemStatus = {
  pipelineCounts: {
    INTAKE: 24,
    FORGE: 18,
    PROVE: 12,
    RESOLVE: 4,
    PRODUCT_DNA: 8,
    SHIP: 6,
  },
  cohort: {
    source: "supplier_catalogue.xlsx",
    total: 1_000,
    processed: 842,
    verified: 731,
    review: 113,
    blocked: 45,
  },
  apiStatus: "OPERATIONAL",
  lastSync: ago(3),
  intakeQueue: 9,
  forgeQueue: 18,
  proveQueue: 12,
  resolveQueue: 4,
  shipReady: 6,
  sourceHealth: { healthy: 3, degraded: 1, critical: 1 },
  operator: "R. Okafor",
  operatorRole: "Data Operations Lead",
};
