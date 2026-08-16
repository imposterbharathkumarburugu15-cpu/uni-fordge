import { forgeStore } from "@/store/forgeStore";
import type { Product } from "@/types/domain";
import { delay } from "./api";

/**
 * FORGE service.
 * Future contract: GET /api/forge · POST /api/forge (batch normalize)
 * Mock adapter reads/writes the in-memory store.
 */

export const forgeService = {
  async listInFlight(): Promise<Product[]> {
    await delay(120);
    return forgeStore
      .getState()
      .products.filter((p) => p.stage === "FORGE" || p.stage === "PROVE");
  },

  /** Commit structured attributes and advance the product to PROVE. */
  async commit(productId: string): Promise<Product | undefined> {
    await delay(420);
    const product = forgeStore.getState().products.find((p) => p.id === productId);
    if (product && product.stage === "FORGE") {
      forgeStore.advanceProduct(productId, "PROVE");
    }
    return forgeStore.getState().products.find((p) => p.id === productId);
  },
};
