import { forgeStore } from "@/store/forgeStore";
import type { Evidence } from "@/types/domain";
import { delay } from "./api";

/**
 * PROVE service.
 * Future contract: GET /api/products/:id/evidence · GET /api/prove
 * Mock adapter reads/writes the in-memory store.
 */

export const proveService = {
  async listEvidenceFor(productId: string): Promise<Evidence[]> {
    await delay(160);
    return forgeStore
      .getState()
      .evidence.filter((e) => e.productId === productId);
  },

  async productsInProve(): Promise<string[]> {
    await delay(120);
    return forgeStore
      .getState()
      .products.filter((p) => p.stage === "PROVE")
      .map((p) => p.id);
  },
};
