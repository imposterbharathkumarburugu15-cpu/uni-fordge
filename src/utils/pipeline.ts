import { MODULES } from "@/app/config/modules";
import type {
  Conflict,
  ForgeState,
  PipelineStage,
  Product,
  ProductDna,
  ProductStatus,
} from "@/types/domain";

export interface StageMeta {
  stage: PipelineStage;
  label: string;
  short: string;
  path: string;
  index: string;
  description: string;
}

export const STAGES: StageMeta[] = [
  {
    stage: "INTAKE",
    label: "INTAKE",
    short: "INTAKE",
    path: "/intake",
    index: "01",
    description: "Supplier-data ingestion",
  },
  {
    stage: "FORGE",
    label: "FORGE",
    short: "FORGE",
    path: "/forge",
    index: "02",
    description: "Attribute structuring",
  },
  {
    stage: "PROVE",
    label: "PROVE",
    short: "PROVE",
    path: "/prove",
    index: "03",
    description: "Evidence verification",
  },
  {
    stage: "RESOLVE",
    label: "RESOLVE",
    short: "RESOLVE",
    path: "/resolve",
    index: "04",
    description: "Human review required",
  },
  {
    stage: "PRODUCT_DNA",
    label: "PRODUCT DNA",
    short: "DNA",
    path: "/product-dna",
    index: "05",
    description: "Canonical product truth",
  },
  {
    stage: "SHIP",
    label: "SHIP",
    short: "SHIP",
    path: "/ship",
    index: "06",
    description: "Verified data delivery",
  },
];

export function stageMeta(stage: PipelineStage): StageMeta {
  return STAGES.find((s) => s.stage === stage) ?? STAGES[0];
}

/** Stage of the module at a given path (null for command center). */
export function stageForPath(pathname: string): PipelineStage | null {
  return (
    MODULES.find((m) => m.path === pathname)?.stage ??
    STAGES.find((s) => s.path === pathname)?.stage ??
    null
  );
}

/** True when stage A sits before stage B in the pipeline. */
export function isBefore(a: PipelineStage, b: PipelineStage): boolean {
  return STAGES.findIndex((s) => s.stage === a) < STAGES.findIndex((s) => s.stage === b);
}

export function nextStage(stage: PipelineStage): PipelineStage | null {
  const i = STAGES.findIndex((s) => s.stage === stage);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1].stage : null;
}

const STATUS_BY_STAGE: Record<PipelineStage, ProductStatus> = {
  INTAKE: "INTAKE",
  FORGE: "FORGING",
  PROVE: "PROVING",
  RESOLVE: "REQUIRES_REVIEW",
  PRODUCT_DNA: "VERIFIED",
  SHIP: "READY",
};

export function defaultStatusForStage(stage: PipelineStage): ProductStatus {
  return STATUS_BY_STAGE[stage];
}

/**
 * Recompute a product's operational status from its stage, attributes
 * and the open conflicts that reference it. Used after every mutation so
 * RESOLVE → PRODUCT DNA → READY progression stays consistent.
 */
export function recomputeStatus(
  product: Product,
  openConflicts: Conflict[],
): ProductStatus {
  const open = openConflicts.filter((c) => c.productId === product.id);
  if (open.length > 0) return "REQUIRES_REVIEW";
  const unverified = product.attributes.filter(
    (a) => a.verification !== "VERIFIED",
  ).length;
  if (unverified > 0) return defaultStatusForStage(product.stage);
  if (product.stage === "PRODUCT_DNA") return "VERIFIED";
  return "READY";
}

/** Weighted product confidence = mean attribute confidence. */
export function productConfidence(product: Product): number {
  if (product.attributes.length === 0) return 0;
  const sum = product.attributes.reduce((acc, a) => acc + a.confidence, 0);
  return sum / product.attributes.length;
}

/**
 * Build the canonical Product DNA record for a product, joining attribute
 * evidence back to source documents and suppliers. Fully derived so DNA
 * always reflects resolved values.
 */
export function buildProductDna(state: ForgeState, product: Product): ProductDna {
  const attributes = product.attributes.map((attr) => {
    const ev = attr.evidenceIds
      .map((id) => state.evidence.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
    const sources = ev.map((e) => {
      const doc = state.sources.find((s) => s.id === e.sourceDocumentId);
      const supplier = state.suppliers.find((s) => s.id === doc?.supplierId);
      return {
        document: doc?.filename ?? e.sourceDocumentId,
        supplier: supplier?.name ?? "UNKNOWN SUPPLIER",
        value: e.value,
        pageRef: e.pageRef,
        confidence: e.confidence,
        agreement:
          e.value === attr.value
            ? ("AGREES" as const)
            : ev.length > 1
              ? ("DISAGREES" as const)
              : ("SOLE_SOURCE" as const),
      };
    });
    return { attribute: attr, sources };
  });

  const verifiedCount = attributes.filter(
    (a) => a.attribute.verification === "VERIFIED",
  ).length;

  return {
    productId: product.id,
    mpn: product.mpn,
    name: product.name,
    category: product.category,
    verifiedCount,
    totalCount: attributes.length,
    confidence: productConfidence(product),
    attributes,
    revision: product.revision,
    lastVerifiedAt: product.updatedAt,
  };
}

/**
 * Products currently ready for shipment:
 * READY/VERIFIED, no open conflicts, not yet shipped.
 */
export function shipQueueProducts(state: ForgeState): Product[] {
  const openConflictProducts = new Set(
    state.conflicts
      .filter((c) => c.status === "OPEN")
      .map((c) => c.productId),
  );
  return state.products.filter(
    (p) =>
      !p.shippedAt &&
      p.attributes.length > 0 &&
      !openConflictProducts.has(p.id) &&
      p.attributes.every((a) => a.verification === "VERIFIED"),
  );
}
