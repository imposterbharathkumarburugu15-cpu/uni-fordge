import { createInitialState } from "@/data/mock";
import type {
  ActivityEvent,
  ForgeState,
  Product,
  ProductStatus,
  Resolution,
  ResolutionMode,
  Shipment,
  ShipmentDestination,
  SourceDocument,
  SourceType,
} from "@/types/domain";
import { productConfidence, recomputeStatus } from "@/utils/pipeline";

type Listener = () => void;
type Recipe = (s: ForgeState) => ForgeState;

function isoNow(): string {
  return new Date().toISOString();
}

/**
 * UNIFORGE application store.
 *
 * A tiny external store (no provider tree). Components subscribe with
 * useSyncExternalStore through the hooks in @/hooks. Service adapters
 * (src/services) are the only writers — the UI never mutates state
 * directly, mirroring the future FastAPI architecture.
 */
class ForgeStore {
  private state: ForgeState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = createInitialState();
  }

  getState = (): ForgeState => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private commit(recipe: Recipe): void {
    this.state = recipe(this.state);
    this.listeners.forEach((l) => l());
  }

  // ------------------------------------------------------------
  // System activity
  // ------------------------------------------------------------

  private recordActivity(
    event: Omit<ActivityEvent, "id" | "timestamp">,
  ): void {
    const id = `ACT-${String(Date.now()).slice(-6)}`;
    this.commit((s) => ({
      ...s,
      activity: [{ ...event, id, timestamp: isoNow() }, ...s.activity],
    }));
  }

  // ------------------------------------------------------------
  // Intake
  // ------------------------------------------------------------

  setSourceProgress(
    sourceId: string,
    status: SourceDocument["status"],
    progress: number,
  ): void {
    const completed = status === "INGESTED";
    const source = this.state.sources.find((d) => d.id === sourceId);
    this.commit((s) => {
      const target = s.sources.find((d) => d.id === sourceId);
      if (!target) return s;
      const next: SourceDocument = {
        ...target,
        status,
        progress,
        processedAt: completed ? isoNow() : target.processedAt,
      };
      return {
        ...s,
        sources: s.sources.map((d) => (d.id === sourceId ? next : d)),
        system: {
          ...s.system,
          intakeQueue: Math.max(
            0,
            s.system.intakeQueue + (target.status === "QUEUED" ? -1 : 0),
          ),
        },
      };
    });
    if (completed && source) {
      this.recordActivity({
        type: "intake",
        severity: "success",
        title: `Ingested ${source.filename}`,
        detail: `${source.type} · ${
          source.rowCount ? `${source.rowCount.toLocaleString()} rows` : `${source.pages} pages`
        } extracted`,
      });
    }
  }

  addSources(
    items: Array<{ filename: string; type: SourceType; supplierId: string; sizeBytes: number }>,
  ): string[] {
    const now = isoNow();
    const ids = items.map((_, i) => `SRC-${String(10_000 + Date.now()).slice(0, 4)}-${i + 1}`);
    this.commit((s) => {
      const docs: SourceDocument[] = items.map((item, i) => ({
        id: ids[i],
        filename: item.filename,
        type: item.type,
        supplierId: item.supplierId,
        status: "QUEUED",
        progress: 0,
        sizeBytes: item.sizeBytes,
        receivedAt: now,
        errors: [],
      }));
      return {
        ...s,
        sources: [...docs, ...s.sources],
        system: { ...s.system, intakeQueue: s.system.intakeQueue + items.length },
      };
    });
    items.forEach((item) => {
      this.recordActivity({
        type: "intake",
        severity: "info",
        title: `Queued ${item.filename}`,
        detail: `Awaiting processing · ${item.type}`,
      });
    });
    return ids;
  }

  acknowledgeSource(sourceId: string): void {
    this.commit((s) => ({
      ...s,
      sources: s.sources.map((d) =>
        d.id === sourceId
          ? { ...d, status: "INGESTED" as const, progress: 100, processedAt: isoNow() }
          : d,
      ),
    }));
    const source = this.state.sources.find((d) => d.id === sourceId);
    if (source) {
      this.recordActivity({
        type: "intake",
        severity: "success",
        title: `Acknowledged ${source.filename}`,
        detail: "Review findings accepted · document marked ingested",
      });
    }
  }

  // ------------------------------------------------------------
  // Forge / pipeline advancement
  // ------------------------------------------------------------

  /** Advance a product to a later pipeline stage (FORGE → PROVE, ...). */
  advanceProduct(productId: string, stage: Product["stage"]): void {
    this.commit((s) => {
      const open = s.conflicts.filter((c) => c.productId === productId && c.status === "OPEN");
      const products = s.products.map((p) => {
        if (p.id !== productId) return p;
        const updated: Product = {
          ...p,
          stage,
          revision: p.revision + 1,
          updatedAt: isoNow(),
        };
        return { ...updated, status: recomputeStatus(updated, open) };
      });
      return { ...s, products };
    });
    this.recordActivity({
      type: "forge",
      severity: "info",
      title: `Advanced ${productId} → ${stage}`,
      detail: "Structured attributes committed to next stage",
      productId,
    });
  }

  // ------------------------------------------------------------
  // Resolve
  // ------------------------------------------------------------

  requestMoreEvidence(conflictId: string, reason: string): void {
    this.commit((s) => ({
      ...s,
      conflicts: s.conflicts.map((c) =>
        c.id === conflictId ? { ...c, requestedEvidence: c.requestedEvidence + 1 } : c,
      ),
    }));
    const conflict = this.state.conflicts.find((c) => c.id === conflictId);
    if (conflict) {
      this.recordActivity({
        type: "resolve",
        severity: "warning",
        title: `More evidence requested — ${conflict.id}`,
        detail: `${conflict.productId} · ${conflict.attributeLabel} · ${reason}`,
        productId: conflict.productId,
      });
    }
  }

  resolveConflict(
    conflictId: string,
    opts: { selectedValue: string; reason: string; mode: ResolutionMode },
  ): Resolution | null {
    const conflict = this.state.conflicts.find((c) => c.id === conflictId);
    if (!conflict || conflict.status === "RESOLVED") return null;
    const now = isoNow();
    const resolution: Resolution = {
      id: `RSL-${String(1000 + this.state.resolutions.length + 1)}`,
      conflictId,
      productId: conflict.productId,
      attributeKey: conflict.attributeKey,
      selectedValue: opts.selectedValue,
      mode: opts.mode,
      reason: opts.reason,
      resolvedBy: this.state.system.operator,
      resolvedAt: now,
    };

    // Confidence: recommendation value uses the recommendation score;
    // otherwise take the strongest source that stated the chosen value.
    const sourceConf = conflict.sources
      .filter((src) => src.value === opts.selectedValue)
      .reduce((max, src) => Math.max(max, src.confidence), 0);
    const confidence =
      opts.mode === "RECOMMENDATION" || opts.selectedValue === conflict.recommendation
        ? Math.max(conflict.recommendationConfidence, sourceConf)
        : Math.max(0.85, sourceConf);

    this.commit((s) => {
      const conflicts = s.conflicts.map((c) =>
        c.id === conflictId
          ? { ...c, status: "RESOLVED" as const, resolvedResolutionId: resolution.id }
          : c,
      );
      const openConflicts = conflicts.filter(
        (c) => c.productId === conflict.productId && c.status === "OPEN",
      );
      const products = s.products.map((p) => {
        if (p.id !== conflict.productId) return p;
        const attributes = p.attributes.map((a) =>
          a.key === conflict.attributeKey
            ? {
                ...a,
                value: opts.selectedValue,
                confidence,
                verification: "VERIFIED" as const,
                rawValues: Array.from(new Set([...a.rawValues, opts.selectedValue])),
              }
            : a,
        );
        const updated: Product = {
          ...p,
          attributes,
          confidence: productConfidence({ ...p, attributes }),
          revision: p.revision + 1,
          updatedAt: now,
        };
        // A product whose last conflict is resolved and whose attributes are
        // all verified advances into PRODUCT DNA, ready for shipment.
        const allVerified =
          updated.attributes.length > 0 &&
          updated.attributes.every((a) => a.verification === "VERIFIED");
        const staged: Product =
          allVerified && openConflicts.length === 0 && updated.stage !== "SHIP"
            ? { ...updated, stage: "PRODUCT_DNA" }
            : updated;
        return { ...staged, status: recomputeStatus(staged, openConflicts) };
      });
      const shipDelta =
        products.find((p) => p.id === conflict.productId)?.status === "READY" ? 1 : 0;
      return {
        ...s,
        conflicts,
        products,
        resolutions: [resolution, ...s.resolutions],
        system: {
          ...s.system,
          resolveQueue: Math.max(0, s.system.resolveQueue - 1),
          shipReady: s.system.shipReady + shipDelta,
        },
      };
    });

    this.recordActivity({
      type: "resolve",
      severity: "success",
      title: `Conflict ${conflictId} resolved`,
      detail: `${conflict.productId} · ${conflict.attributeLabel} → ${opts.selectedValue} · ${opts.mode}`,
      productId: conflict.productId,
    });
    return resolution;
  }

  // ------------------------------------------------------------
  // Ship
  // ------------------------------------------------------------

  createShipment(destination: ShipmentDestination, productIds: string[]): Shipment {
    const now = isoNow();
    const maxN = this.state.shipments.reduce((max, sh) => {
      const n = parseInt(sh.id.replace("SH-", ""), 10);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    const id = `SH-${maxN + 1}`;
    const shipment: Shipment = {
      id,
      destination,
      destinationLabel: destinationLabel(destination),
      productIds,
      validation: "PASSED",
      status: "EXPORTING",
      createdAt: now,
    };
    this.commit((s) => ({
      ...s,
      shipments: [shipment, ...s.shipments],
      system: {
        ...s.system,
        shipReady: Math.max(0, s.system.shipReady - productIds.length),
      },
    }));
    this.recordActivity({
      type: "ship",
      severity: "info",
      title: `Export ${id} started`,
      detail: `${destinationLabel(destination)} · ${productIds.length} products`,
    });
    return shipment;
  }

  completeShipment(shipmentId: string): void {
    const shipment = this.state.shipments.find((sh) => sh.id === shipmentId);
    if (!shipment) return;
    this.commit((s) => ({
      ...s,
      shipments: s.shipments.map((sh) =>
        sh.id === shipmentId
          ? { ...sh, status: "EXPORTED" as const, completedAt: isoNow() }
          : sh,
      ),
      products: s.products.map((p) =>
        shipment.productIds.includes(p.id) ? { ...p, shippedAt: isoNow() } : p,
      ),
    }));
    this.recordActivity({
      type: "ship",
      severity: "success",
      title: `Export ${shipmentId} delivered`,
      detail: `${shipment.destinationLabel} · ${shipment.productIds.length} products`,
    });
  }

  retryShipment(shipmentId: string): void {
    this.commit((s) => ({
      ...s,
      shipments: s.shipments.map((sh) =>
        sh.id === shipmentId
          ? { ...sh, status: "EXPORTING" as const, error: undefined, createdAt: isoNow() }
          : sh,
      ),
    }));
  }
}

function destinationLabel(destination: ShipmentDestination): string {
  switch (destination) {
    case "COMMERCE":
      return "Commerce · Shopify";
    case "ERP":
      return "ERP · SAP S/4HANA";
    case "PIM":
      return "PIM · Commerce Cloud";
    case "CATALOG":
      return "Catalog · Master Data";
    case "API":
      return "Catalog API · v2";
    case "EXPORT":
      return "Export · CSV bundle";
  }
}

export const forgeStore = new ForgeStore();
export type { ResolutionMode };
export type { ProductStatus };
