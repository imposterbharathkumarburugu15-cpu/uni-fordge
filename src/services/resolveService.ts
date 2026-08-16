import { forgeStore } from "@/store/forgeStore";
import type { Conflict, Resolution, ResolutionMode } from "@/types/domain";
import { delay } from "./api";

/**
 * RESOLVE service.
 * Future contract: GET /api/conflicts · POST /api/conflicts/:id/resolve
 * Mock adapter reads/writes the in-memory store.
 */

export const resolveService = {
  async listConflicts(): Promise<Conflict[]> {
    await delay(140);
    return forgeStore.getState().conflicts;
  },

  async resolve(
    conflictId: string,
    opts: { selectedValue: string; reason: string; mode: ResolutionMode },
  ): Promise<Resolution | null> {
    await delay(480);
    return forgeStore.resolveConflict(conflictId, opts);
  },

  async requestMoreEvidence(conflictId: string, reason: string): Promise<void> {
    await delay(300);
    forgeStore.requestMoreEvidence(conflictId, reason);
  },
};
