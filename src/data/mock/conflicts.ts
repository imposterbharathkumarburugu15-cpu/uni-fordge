import type { Conflict, Resolution } from "@/types/domain";
import { ago } from "./time";

export const CONFLICTS: Conflict[] = [
  {
    id: "CFL-0001",
    productId: "PRD-0101",
    attributeKey: "MATERIAL",
    attributeLabel: "Material",
    sources: [
      {
        evidenceId: "EVD-0101-M1",
        supplier: "Vanderhof Industries",
        document: "supplier_catalogue.xlsx",
        value: "BRASS",
        confidence: 0.72,
      },
      {
        evidenceId: "EVD-0101-M2",
        supplier: "Vanderhof Industries",
        document: "manufacturer_datasheet.pdf",
        value: "BRONZE",
        confidence: 0.96,
      },
      {
        evidenceId: "EVD-0101-M3",
        supplier: "Northstar Metalworks",
        document: "engineering_spec_10492.pdf",
        value: "BRONZE",
        confidence: 0.94,
      },
    ],
    recommendation: "BRONZE",
    recommendationConfidence: 0.91,
    rationale:
      "Manufacturer datasheet (§3.2) and engineering spec (§4.1) independently state ASTM B62 bronze. The catalogue row uses a loose taxonomy term. Two higher-confidence engineering sources agree.",
    status: "OPEN",
    openedAt: ago(18 * 60),
    requestedEvidence: 0,
  },
  {
    id: "CFL-0002",
    productId: "PRD-0102",
    attributeKey: "PRESSURE",
    attributeLabel: "Pressure",
    sources: [
      {
        evidenceId: "EVD-0102-P1",
        supplier: "Vanderhof Industries",
        document: "manufacturer_datasheet.pdf",
        value: "400 PSI",
        confidence: 0.93,
      },
      {
        evidenceId: "EVD-0102-P2",
        supplier: "Vanderhof Industries",
        document: "supplier_catalogue.xlsx",
        value: "350 PSI",
        confidence: 0.68,
      },
    ],
    recommendation: "400 PSI",
    recommendationConfidence: 0.88,
    rationale:
      "Datasheet pressure table is authoritative for this series; catalogue figure is the generic column default for 1/2 in valves.",
    status: "OPEN",
    openedAt: ago(9 * 60),
    requestedEvidence: 0,
  },
  {
    id: "CFL-0003",
    productId: "PRD-0107",
    attributeKey: "PRESSURE",
    attributeLabel: "Pressure",
    sources: [
      {
        evidenceId: "EVD-0107-P1",
        supplier: "Northstar Metalworks",
        document: "engineering_spec_10492.pdf",
        value: "250 PSI",
        confidence: 0.9,
      },
      {
        evidenceId: "EVD-0107-P2",
        supplier: "Pacific Valve & Flange",
        document: "pvf_valve_series_700.pdf",
        value: "300 PSI",
        confidence: 0.77,
      },
    ],
    recommendation: "250 PSI",
    recommendationConfidence: 0.85,
    rationale:
      "Engineering spec binds the installed application. Datasheet figure appears to be the series maximum including 1.5 in and 2 in bodies.",
    status: "OPEN",
    openedAt: ago(5 * 60),
    requestedEvidence: 1,
  },
  {
    id: "CFL-0004",
    productId: "PRD-0108",
    attributeKey: "BODY_MATERIAL",
    attributeLabel: "Body Material",
    sources: [
      {
        evidenceId: "EVD-0108-B1",
        supplier: "Atlas Fluid Systems",
        document: "manufacturer_datasheet.pdf",
        value: "CF8M",
        confidence: 0.92,
      },
      {
        evidenceId: "EVD-0108-B2",
        supplier: "Atlas Fluid Systems",
        document: "supplier_catalogue.xlsx",
        value: "CF8",
        confidence: 0.6,
      },
      {
        evidenceId: "EVD-0108-B3",
        supplier: "Northstar Metalworks",
        document: "engineering_spec_10492.pdf",
        value: "WCB",
        confidence: 0.55,
      },
    ],
    recommendation: "CF8M",
    recommendationConfidence: 0.86,
    rationale:
      "Datasheet specifies ASTM A351 CF8M for this 150# flanged series. Catalogue CF8 and spec WCB are generic defaults not tied to this MPN.",
    status: "OPEN",
    openedAt: ago(2 * 60),
    requestedEvidence: 0,
  },
  {
    id: "CFL-0000",
    productId: "PRD-0100",
    attributeKey: "THREAD",
    attributeLabel: "Thread",
    sources: [
      {
        evidenceId: "EVD-0100-T1",
        supplier: "Vanderhof Industries",
        document: "manufacturer_datasheet.pdf",
        value: "NPT",
        confidence: 0.95,
      },
      {
        evidenceId: "EVD-0100-T2",
        supplier: "Vanderhof Industries",
        document: "supplier_catalogue.xlsx",
        value: "BSP",
        confidence: 0.6,
      },
    ],
    recommendation: "NPT",
    recommendationConfidence: 0.9,
    rationale:
      "Datasheet §2.1 states ANSI/ASME B1.20.1 NPT; legacy pricebook BSP value rejected.",
    status: "RESOLVED",
    openedAt: ago(44 * 60),
    requestedEvidence: 0,
    resolvedResolutionId: "RSL-0001",
  },
];

export const RESOLUTIONS: Resolution[] = [
  {
    id: "RSL-0001",
    conflictId: "CFL-0000",
    productId: "PRD-0100",
    attributeKey: "THREAD",
    selectedValue: "NPT",
    mode: "RECOMMENDATION",
    reason:
      "North American distribution footprint. Manufacturer datasheet §2.1 specifies ANSI/ASME B1.20.1 NPT; pricebook BSP value rejected as legacy artefact.",
    resolvedBy: "R. Okafor",
    resolvedAt: ago(40 * 60),
  },
];
