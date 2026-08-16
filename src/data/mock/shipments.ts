import type { Shipment } from "@/types/domain";
import { ago } from "./time";

export const SHIPMENTS: Shipment[] = [
  {
    id: "SH-2417",
    destination: "PIM",
    destinationLabel: "PIM · Commerce Cloud",
    productIds: ["PRD-0100", "PRD-0112", "PRD-0113", "PRD-0114", "PRD-0103", "PRD-0109"],
    validation: "PASSED",
    status: "EXPORTED",
    createdAt: ago(26 * 60),
    completedAt: ago(26 * 60 - 14),
  },
  {
    id: "SH-2416",
    destination: "ERP",
    destinationLabel: "ERP · SAP S/4HANA",
    productIds: [
      "PRD-0100", "PRD-0103", "PRD-0109", "PRD-0112", "PRD-0113", "PRD-0114",
      "PRD-0100", "PRD-0103", "PRD-0109", "PRD-0112", "PRD-0113", "PRD-0114",
    ],
    validation: "PASSED",
    status: "EXPORTED",
    createdAt: ago(52 * 60),
    completedAt: ago(52 * 60 - 20),
  },
  {
    id: "SH-2415",
    destination: "API",
    destinationLabel: "Catalog API · v2",
    productIds: [
      "PRD-0100", "PRD-0103", "PRD-0109", "PRD-0112", "PRD-0113", "PRD-0114",
      "PRD-0100", "PRD-0103", "PRD-0109", "PRD-0112", "PRD-0113", "PRD-0114",
    ],
    validation: "FAILED",
    status: "FAILED",
    createdAt: ago(3 * 24 * 60),
    error: "3 records failed schema validation — missing GTIN-14 for MPN VND-556-C, KSF-U48, VND-EL-90.",
  },
];
