import { useSyncExternalStore } from "react";
import { forgeStore } from "@/store/forgeStore";
import type {
  ActivityEvent,
  Conflict,
  Evidence,
  ForgeState,
  Product,
  ProductDna,
  Resolution,
  Shipment,
  SourceDocument,
  Supplier,
  SystemStatus,
} from "@/types/domain";
import { buildProductDna, shipQueueProducts } from "@/utils/pipeline";

export function useForgeState(): ForgeState {
  return useSyncExternalStore(forgeStore.subscribe, forgeStore.getState);
}

export function useProducts(): Product[] {
  return useForgeState().products;
}

export function useProduct(id?: string): Product | undefined {
  const state = useForgeState();
  return id ? state.products.find((p) => p.id === id) : undefined;
}

export function useSuppliers(): Supplier[] {
  return useForgeState().suppliers;
}

export function useSources(): SourceDocument[] {
  return useForgeState().sources;
}

export function useEvidence(): Evidence[] {
  return useForgeState().evidence;
}

export function useConflicts(): Conflict[] {
  return useForgeState().conflicts;
}

export function useOpenConflicts(): Conflict[] {
  return useForgeState().conflicts.filter((c) => c.status === "OPEN");
}

export function useConflict(id?: string): Conflict | undefined {
  const state = useForgeState();
  return id ? state.conflicts.find((c) => c.id === id) : undefined;
}

export function useResolutions(): Resolution[] {
  return useForgeState().resolutions;
}

export function useShipments(): Shipment[] {
  return useForgeState().shipments;
}

export function useActivity(): ActivityEvent[] {
  return useForgeState().activity;
}

export function useSystemStatus(): SystemStatus {
  return useForgeState().system;
}

export function useShipQueue(): Product[] {
  const state = useForgeState();
  return shipQueueProducts(state);
}

export function useProductDna(productId?: string): ProductDna | undefined {
  const state = useForgeState();
  const product = productId
    ? state.products.find((p) => p.id === productId)
    : undefined;
  return product ? buildProductDna(state, product) : undefined;
}

/** All products that have structured DNA (verified or in-flight). */
export function useAllDna(): ProductDna[] {
  const state = useForgeState();
  return state.products.map((p) => buildProductDna(state, p));
}
