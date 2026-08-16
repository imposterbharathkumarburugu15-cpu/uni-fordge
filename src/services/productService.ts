import { forgeStore } from "@/store/forgeStore";
import type { Product, ProductDna } from "@/types/domain";
import { buildProductDna } from "@/utils/pipeline";
import { delay } from "./api";

/**
 * PRODUCT service.
 * Future contract: GET /api/products · GET /api/products/:id · GET /api/products/:id/product-dna
 * Mock adapter reads/writes the in-memory store.
 */

export const productService = {
  async list(): Promise<Product[]> {
    await delay(140);
    return forgeStore.getState().products;
  },

  async get(productId: string): Promise<Product | undefined> {
    await delay(120);
    return forgeStore.getState().products.find((p) => p.id === productId);
  },

  async dna(productId: string): Promise<ProductDna | undefined> {
    await delay(160);
    const state = forgeStore.getState();
    const product = state.products.find((p) => p.id === productId);
    return product ? buildProductDna(state, product) : undefined;
  },
};
