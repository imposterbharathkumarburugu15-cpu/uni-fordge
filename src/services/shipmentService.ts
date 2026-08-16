import { forgeStore } from "@/store/forgeStore";
import type { Product, Shipment, ShipmentDestination } from "@/types/domain";
import { shipQueueProducts } from "@/utils/pipeline";
import { delay } from "./api";

/**
 * SHIP service.
 * Future contract: GET /api/ship/queue · POST /api/ship/export
 * Mock adapter reads/writes the in-memory store.
 */

export const shipmentService = {
  async queue(): Promise<Product[]> {
    await delay(140);
    return shipQueueProducts(forgeStore.getState());
  },

  async listShipments(): Promise<Shipment[]> {
    await delay(140);
    return forgeStore.getState().shipments;
  },

  /** POST /api/ship/export — simulate delivery completing after a beat. */
  async export(destination: ShipmentDestination, productIds: string[]): Promise<Shipment> {
    await delay(400);
    const shipment = forgeStore.createShipment(destination, productIds);
    setTimeout(() => forgeStore.completeShipment(shipment.id), 2_400);
    return shipment;
  },

  async retry(shipmentId: string): Promise<void> {
    await delay(200);
    forgeStore.retryShipment(shipmentId);
    setTimeout(() => forgeStore.completeShipment(shipmentId), 2_400);
  },
};
