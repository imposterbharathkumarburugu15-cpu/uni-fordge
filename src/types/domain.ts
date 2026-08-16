/* ============================================================
   UNIFORGE — DOMAIN TYPES
   Single source of truth for the product-intelligence data model.
   These shapes mirror the future FastAPI contract
   (GET /api/products/:id, GET /api/conflicts, ...).
   ============================================================ */

export const PIPELINE_STAGES = [
  "INTAKE",
  "FORGE",
  "PROVE",
  "RESOLVE",
  "PRODUCT_DNA",
  "SHIP",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/** Operational state of a product as it moves through the pipeline. */
export type ProductStatus =
  | "INTAKE"
  | "FORGING"
  | "PROVING"
  | "REQUIRES_REVIEW"
  | "VERIFIED"
  | "READY"
  | "BLOCKED";

export type VerificationStatus =
  | "PROCESSING"
  | "UNVERIFIED"
  | "VERIFIED"
  | "CONFLICT";

export type DocumentStatus =
  | "QUEUED"
  | "PROCESSING"
  | "INGESTED"
  | "FAILED"
  | "REQUIRES_REVIEW";

export type SourceType =
  | "CATALOGUE"
  | "DATASHEET"
  | "SPECIFICATION"
  | "MATERIAL_GUIDE"
  | "PRICEBOOK"
  | "SAFETY_SHEET"
  | "BOM";

export type ConflictStatus = "OPEN" | "RESOLVED";

export type ResolutionMode = "RECOMMENDATION" | "MANUAL" | "MORE_EVIDENCE";

export type ShipmentStatus = "QUEUED" | "EXPORTING" | "EXPORTED" | "FAILED";

export type ShipmentDestination =
  | "COMMERCE"
  | "ERP"
  | "PIM"
  | "CATALOG"
  | "API"
  | "EXPORT";

export type ActivityType =
  | "intake"
  | "forge"
  | "prove"
  | "resolve"
  | "ship"
  | "system";

export type ActivitySeverity = "info" | "success" | "warning" | "critical";

export type SupplierHealth = "HEALTHY" | "DEGRADED" | "CRITICAL";

export interface Supplier {
  id: string;
  name: string;
  code: string;
  region: string;
  sourceCount: number;
  health: SupplierHealth;
  lastSync: string; // ISO
  formats: string[];
}

export interface ValidationError {
  id: string;
  level: "error" | "warning";
  code: string;
  message: string;
  location: string;
}

export interface SourceDocument {
  id: string;
  filename: string;
  type: SourceType;
  supplierId: string;
  status: DocumentStatus;
  progress: number; // 0-100
  sizeBytes: number;
  pages?: number;
  rowCount?: number;
  receivedAt: string; // ISO
  processedAt?: string; // ISO
  errors: ValidationError[];
}

export interface ProductAttribute {
  key: string; // e.g. "MATERIAL"
  label: string; // e.g. "Material"
  value: string; // normalized canonical value
  unit?: string;
  rawValues: string[]; // values as extracted from sources
  confidence: number; // 0-1
  verification: VerificationStatus;
  evidenceIds: string[];
}

export interface Product {
  id: string; // PRD-0101
  mpn: string; // VND-992-B
  name: string;
  category: string;
  description: string;
  supplierId: string;
  stage: PipelineStage;
  status: ProductStatus;
  confidence: number; // 0-1
  attributes: ProductAttribute[];
  revision: number;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
}

export interface Evidence {
  id: string; // EVD-xxxx
  productId: string;
  attributeKey: string;
  sourceDocumentId: string;
  value: string; // extracted value
  raw: string; // verbatim raw fragment
  pageRef: string; // "p.14 §3.2" | "Row 421" | ...
  excerpt: string;
  confidence: number; // 0-1
  capturedAt: string;
}

export interface ConflictSource {
  evidenceId: string;
  supplier: string;
  document: string;
  value: string;
  confidence: number;
}

export interface Conflict {
  id: string; // CFL-0001
  productId: string;
  attributeKey: string;
  attributeLabel: string;
  sources: ConflictSource[];
  recommendation: string;
  recommendationConfidence: number; // 0-1
  rationale: string;
  status: ConflictStatus;
  openedAt: string;
  requestedEvidence: number;
  resolvedResolutionId?: string;
}

export interface Resolution {
  id: string; // RSL-0001
  conflictId: string;
  productId: string;
  attributeKey: string;
  selectedValue: string;
  mode: ResolutionMode;
  reason: string;
  resolvedBy: string;
  resolvedAt: string; // ISO
}

export interface ProductDnaAttribute {
  attribute: ProductAttribute;
  sources: Array<{
    document: string;
    supplier: string;
    value: string;
    pageRef: string;
    confidence: number;
    agreement: "AGREES" | "DISAGREES" | "SOLE_SOURCE";
  }>;
}

export interface ProductDna {
  productId: string;
  mpn: string;
  name: string;
  category: string;
  verifiedCount: number;
  totalCount: number;
  confidence: number; // 0-1
  attributes: ProductDnaAttribute[];
  revision: number;
  lastVerifiedAt: string;
}

export interface Shipment {
  id: string; // SH-2417
  destination: ShipmentDestination;
  destinationLabel: string;
  productIds: string[];
  validation: "PASSED" | "WARNINGS" | "FAILED";
  status: ShipmentStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string; // ISO
  type: ActivityType;
  severity: ActivitySeverity;
  title: string;
  detail?: string;
  productId?: string;
}

export interface CohortStats {
  source: string;
  total: number;
  processed: number;
  verified: number;
  review: number;
  blocked: number;
}

export interface SystemStatus {
  pipelineCounts: Record<PipelineStage, number>;
  cohort: CohortStats;
  apiStatus: "OPERATIONAL" | "DEGRADED";
  lastSync: string;
  intakeQueue: number;
  forgeQueue: number;
  proveQueue: number;
  resolveQueue: number;
  shipReady: number;
  sourceHealth: { healthy: number; degraded: number; critical: number };
  operator: string;
  operatorRole: string;
}

export interface ForgeState {
  suppliers: Supplier[];
  sources: SourceDocument[];
  products: Product[];
  evidence: Evidence[];
  conflicts: Conflict[];
  resolutions: Resolution[];
  shipments: Shipment[];
  activity: ActivityEvent[];
  system: SystemStatus;
}
