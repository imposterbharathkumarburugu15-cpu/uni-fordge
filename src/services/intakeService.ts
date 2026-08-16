import { forgeStore } from "@/store/forgeStore";
import type { SourceDocument, SourceType } from "@/types/domain";
import { delay } from "./api";

/**
 * INTAKE service.
 * Future contract: GET /api/intake · POST /api/intake · POST /api/intake/:id/process
 * Mock adapter reads/writes the in-memory store.
 */

const PROCESS_STEPS = [18, 42, 68, 88, 100];

export const intakeService = {
  async list(): Promise<SourceDocument[]> {
    await delay(120);
    return forgeStore.getState().sources;
  },

  async enqueue(
    items: Array<{ filename: string; type: SourceType; supplierId: string; sizeBytes: number }>,
  ): Promise<string[]> {
    await delay(180);
    return forgeStore.addSources(items);
  },

  /** QUEUED → PROCESSING → INGESTED with simulated progress ticks. */
  async process(sourceId: string): Promise<void> {
    forgeStore.setSourceProgress(sourceId, "PROCESSING", 4);
    const timer = (i: number) =>
      setTimeout(
        () => {
          const pct = PROCESS_STEPS[i];
          forgeStore.setSourceProgress(
            sourceId,
            pct >= 100 ? "INGESTED" : "PROCESSING",
            pct,
          );
        },
        (i + 1) * 620,
      );
    PROCESS_STEPS.forEach((_, i) => timer(i));
  },

  async retry(sourceId: string): Promise<void> {
    forgeStore.setSourceProgress(sourceId, "PROCESSING", 6);
    const timer = (i: number) =>
      setTimeout(
        () => {
          const pct = PROCESS_STEPS[i];
          forgeStore.setSourceProgress(
            sourceId,
            pct >= 100 ? "INGESTED" : "PROCESSING",
            pct,
          );
        },
        (i + 1) * 620,
      );
    PROCESS_STEPS.forEach((_, i) => timer(i));
  },

  /** REQUIRES_REVIEW → INGESTED (operator accepted review findings). */
  async acknowledge(sourceId: string): Promise<void> {
    await delay(160);
    forgeStore.acknowledgeSource(sourceId);
  },
};
