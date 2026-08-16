import type { Evidence } from "@/types/domain";
import { ago } from "./time";

type EvTuple = [
  id: string,
  productId: string,
  attributeKey: string,
  sourceDocumentId: string,
  value: string,
  pageRef: string,
  excerpt: string,
  confidence: number,
];

function ev(
  tuple: EvTuple,
  capturedMinutesAgo: number,
): Evidence {
  const [id, productId, attributeKey, sourceDocumentId, value, pageRef, excerpt, confidence] =
    tuple;
  return {
    id,
    productId,
    attributeKey,
    sourceDocumentId,
    value,
    raw: value,
    pageRef,
    excerpt,
    confidence,
    capturedAt: ago(capturedMinutesAgo),
  };
}

const T = {
  catalogue: "SRC-0001",
  datasheet: "SRC-0002",
  spec: "SRC-0003",
  materialGuide: "SRC-0004",
  pricebook: "SRC-0008",
} as const;

export const EVIDENCE: Evidence[] = [
  // ---- PRD-0101 Brass Coupling VND-992-B ----
  ev(["EVD-0101-M1", "PRD-0101", "MATERIAL", T.catalogue, "BRASS", "Row 421 · col C",
      "3/8 CPLG BRASS NPT 125 PSI. Material column C reads BRASS for MPN VND-992-B.", 0.72], 24 * 60),
  ev(["EVD-0101-M2", "PRD-0101", "MATERIAL", T.datasheet, "BRONZE", "p.14 §3.2 Material",
      "Body: ASTM B62 bronze casting (C83600). Coupling VND-992-B manufactured in bronze per §3.2.", 0.96], 24 * 60),
  ev(["EVD-0101-M3", "PRD-0101", "MATERIAL", T.spec, "BRONZE", "p.9 §4.1 Materials",
      "4.1.2 Couplings shall be bronze per ASTM B62; brass substitutions are not permitted.", 0.94], 29 * 60),
  ev(["EVD-0101-S1", "PRD-0101", "SIZE", T.catalogue, "3/8 in", "Row 421 · col D",
      "NOMINAL SIZE column D = 3/8 IN.", 0.98], 24 * 60),
  ev(["EVD-0101-S2", "PRD-0101", "SIZE", T.datasheet, "3/8 in", "p.4 §1.2 Dimensions",
      "Nominal size 3/8 in; measured across thread root 9.53 mm.", 0.97], 24 * 60),
  ev(["EVD-0101-T1", "PRD-0101", "THREAD", T.catalogue, "NPT", "Row 421 · col E",
      "THREAD column E = NPT.", 0.96], 24 * 60),
  ev(["EVD-0101-T2", "PRD-0101", "THREAD", T.datasheet, "NPT", "p.7 §2.1 Threads",
      "ANSI/ASME B1.20.1 NPT thread form; taper 1:16.", 0.98], 24 * 60),
  ev(["EVD-0101-P1", "PRD-0101", "PRESSURE", T.catalogue, "125 PSI", "Row 421 · col F",
      "WORKING PRESSURE column F = 125 PSI.", 0.93], 24 * 60),
  ev(["EVD-0101-P2", "PRD-0101", "PRESSURE", T.spec, "125 PSI", "p.12 §5.2 Pressure",
      "Maximum working pressure 125 PSI at 200°F for 3/8 in bronze couplings.", 0.96], 29 * 60),
  ev(["EVD-0101-W1", "PRD-0101", "WEIGHT", T.datasheet, "0.25 lb", "p.15 §3.5 Weights",
      "Unit weight 0.25 lb per coupling, packaging excluded.", 0.9], 24 * 60),
  ev(["EVD-0101-TP1", "PRD-0101", "PRODUCT_TYPE", T.catalogue, "Coupling", "Row 421 · col B",
      "PRODUCT TYPE column B = COUPLING.", 0.99], 24 * 60),

  // ---- PRD-0100 Threaded Cap VND-556-C ----
  ev(["EVD-0100-T1", "PRD-0100", "THREAD", T.datasheet, "NPT", "p.21 §2.1 Threads",
      "Thread form NPT per ANSI/ASME B1.20.1.", 0.95], 40 * 60),
  ev(["EVD-0100-T2", "PRD-0100", "THREAD", T.catalogue, "BSP", "Row 118 · col E",
      "Legacy pricebook row lists BSP. Overruled by datasheet and regional fit.", 0.6], 40 * 60),
  ev(["EVD-0100-M1", "PRD-0100", "MATERIAL", T.catalogue, "Brass", "Row 118 · col C",
      "MATERIAL column C = BRASS.", 0.97], 40 * 60),
  ev(["EVD-0100-S1", "PRD-0100", "SIZE", T.catalogue, "3/4 in", "Row 118 · col D",
      "NOMINAL SIZE column D = 3/4 IN.", 0.98], 40 * 60),
  ev(["EVD-0100-P1", "PRD-0100", "PRESSURE", T.datasheet, "150 PSI", "p.22 §5.2 Pressure",
      "Working pressure 150 PSI for 3/4 in caps.", 0.94], 40 * 60),

  // ---- PRD-0102 Bronze Ball Valve VND-1185 ----
  ev(["EVD-0102-P1", "PRD-0102", "PRESSURE", T.datasheet, "400 PSI", "p.31 §5.2 Pressure",
      "WOG rating 400 PSI for 1/2 in two-piece ball valve.", 0.93], 24 * 60),
  ev(["EVD-0102-P2", "PRD-0102", "PRESSURE", T.catalogue, "350 PSI", "Row 512 · col F",
      "WORKING PRESSURE column F = 350 PSI.", 0.68], 24 * 60),
  ev(["EVD-0102-M1", "PRD-0102", "MATERIAL", T.datasheet, "Bronze", "p.29 §3.2 Material",
      "Body and ball: ASTM B62 bronze.", 0.95], 24 * 60),
  ev(["EVD-0102-S1", "PRD-0102", "SIZE", T.datasheet, "1/2 in", "p.30 §1.2 Dimensions",
      "Nominal size 1/2 in.", 0.98], 24 * 60),
  ev(["EVD-0102-N1", "PRD-0102", "END_CONNECTION", T.datasheet, "Threaded", "p.30 §1.4 Ends",
      "Threaded end connections, NPT.", 0.97], 24 * 60),

  // ---- PRD-0103 Flange Adapter PVF-900-F ----
  ev(["EVD-0103-M1", "PRD-0103", "MATERIAL", T.datasheet, "Ductile Iron", "p.8 §3.2 Material",
      "Body: ductile iron per ASTM A536 grade 65-45-12.", 0.98], 30 * 60),
  ev(["EVD-0103-S1", "PRD-0103", "SIZE", T.datasheet, "2 in", "p.8 §1.2 Dimensions",
      "Nominal pipe size 2 in.", 0.99], 30 * 60),
  ev(["EVD-0103-F1", "PRD-0103", "FLANGE_CLASS", T.spec, "150# ANSI", "p.5 §3.0 Flanges",
      "Flange class 150 ANSI B16.5; drilling per Table 2.", 0.97], 30 * 60),
  ev(["EVD-0103-B1", "PRD-0103", "BOLT_CIRCLE", T.spec, "4.75 in", "p.5 Table 2",
      "Bolt circle diameter 4.75 in, 4 × 5/8 in bolts.", 0.96], 30 * 60),
  ev(["EVD-0103-G1", "PRD-0103", "GASKET", T.datasheet, "Flat ring", "p.9 §3.4 Gaskets",
      "Flat ring gasket, 2.62 in ID.", 0.94], 30 * 60),

  // ---- PRD-0104 Stainless Tee NSM-440-T ----
  ev(["EVD-0104-M1", "PRD-0104", "MATERIAL", T.catalogue, "316 SS", "Row 87 · col C",
      "SS TEE 1\" FNPT 316 — material shorthand 316 SS.", 0.84], 6),
  ev(["EVD-0104-S1", "PRD-0104", "SIZE", T.catalogue, "1 in", "Row 87 · col D",
      "NOMINAL SIZE column D = 1\" (raw: 1\").", 0.82], 6),
  ev(["EVD-0104-T1", "PRD-0104", "THREAD", T.catalogue, "FNPT", "Row 87 · col E",
      "THREAD column E = FNPT.", 0.88], 6),

  // ---- PRD-0105 Hex Reducer VND-HR-150 ----
  ev(["EVD-0105-M1", "PRD-0105", "MATERIAL", T.catalogue, "Brass", "Row 233 · col C",
      "1/2X3/8 HEX RED BRASS — material BRASS.", 0.86], 24 * 60),
  ev(["EVD-0105-S1", "PRD-0105", "SIZE_IN", T.catalogue, "1/2 in", "Row 233 · col D",
      "Reducer entry size 1/2 in (first segment).", 0.9], 24 * 60),
  ev(["EVD-0105-S2", "PRD-0105", "SIZE_OUT", T.catalogue, "3/8 in", "Row 233 · col E",
      "Reducer outlet size 3/8 in (second segment).", 0.9], 24 * 60),

  // ---- PRD-0106 Strainer AFS-ST-200 ----
  ev(["EVD-0106-M1", "PRD-0106", "MATERIAL", T.catalogue, "Bronze", "Row 441 · col C",
      "BRONZE STRAINER 3/4 60 MESH — material BRONZE (C83600).", 0.8], 3 * 60),
  ev(["EVD-0106-S1", "PRD-0106", "SIZE", T.catalogue, "3/4 in", "Row 441 · col D",
      "NOMINAL SIZE column D = 3/4\".", 0.81], 3 * 60),
  ev(["EVD-0106-MH1", "PRD-0106", "MESH", T.catalogue, "60", "Row 441 · col F",
      "MESH column F = 60.", 0.87], 3 * 60),

  // ---- PRD-0107 Check Valve PVF-CV-250 ----
  ev(["EVD-0107-P1", "PRD-0107", "PRESSURE", T.spec, "250 PSI", "p.14 §5.2 Pressure",
      "Cracking pressure ≤ 1 PSI; working pressure 250 PSI.", 0.9], 30 * 60),
  ev(["EVD-0107-P2", "PRD-0107", "PRESSURE", T.datasheet, "300 PSI", "p.17 §5.2 Pressure",
      "Pressure rating table lists 300 PSI for 1 in swing check.", 0.77], 30 * 60),
  ev(["EVD-0107-M1", "PRD-0107", "MATERIAL", T.datasheet, "Bronze", "p.16 §3.2 Material",
      "Body: bronze per ASTM B62.", 0.96], 30 * 60),
  ev(["EVD-0107-S1", "PRD-0107", "SIZE", T.datasheet, "1 in", "p.16 §1.2 Dimensions",
      "Nominal size 1 in.", 0.98], 30 * 60),

  // ---- PRD-0108 Gate Valve AFS-GV-300 ----
  ev(["EVD-0108-B1", "PRD-0108", "BODY_MATERIAL", T.datasheet, "CF8M", "p.23 §3.2 Material",
      "Body and bonnet: CF8M stainless per ASTM A351.", 0.92], 3 * 60),
  ev(["EVD-0108-B2", "PRD-0108", "BODY_MATERIAL", T.catalogue, "CF8", "Row 780 · col C",
      "MATERIAL column C = CF8.", 0.6], 3 * 60),
  ev(["EVD-0108-B3", "PRD-0108", "BODY_MATERIAL", T.spec, "WCB", "p.18 §4.1 Materials",
      "4.1.1 Carbon steel WCB permitted for 150# class.", 0.55], 3 * 60),
  ev(["EVD-0108-S1", "PRD-0108", "SIZE", T.datasheet, "2 in", "p.22 §1.2 Dimensions",
      "Nominal size 2 in.", 0.98], 3 * 60),
  ev(["EVD-0108-E1", "PRD-0108", "END_CONNECTION", T.datasheet, "Flanged", "p.22 §1.4 Ends",
      "Flanged end connections, ANSI B16.5.", 0.97], 3 * 60),

  // ---- PRD-0109 Pipe Wrench NSM-WR7 ----
  ev(["EVD-0109-M1", "PRD-0109", "MATERIAL", T.materialGuide, "Chrome Vanadium Steel", "p.6 §2.1 Tool steels",
      "Forged chrome vanadium steel, heat treated to HRC 42-47.", 0.97], 28 * 60),
  ev(["EVD-0109-L1", "PRD-0109", "LENGTH", T.catalogue, "14 in", "Row 902 · col D",
      "LENGTH column D = 14 IN.", 0.98], 28 * 60),
  ev(["EVD-0109-J1", "PRD-0109", "JAW_CAPACITY", T.catalogue, "2.75 in", "Row 902 · col F",
      "JAW CAPACITY column F = 2.75 IN.", 0.96], 28 * 60),
  ev(["EVD-0109-W1", "PRD-0109", "WEIGHT", T.catalogue, "2.4 lb", "Row 902 · col G",
      "WEIGHT column G = 2.4 LB.", 0.93], 28 * 60),

  // ---- PRD-0112 Hex Nipple VND-224-H ----
  ev(["EVD-0112-M1", "PRD-0112", "MATERIAL", T.catalogue, "Brass", "Row 1502 · col C",
      "HEX NIPPLE 1/2 NPT BRASS — material BRASS.", 0.97], 24 * 60),
  ev(["EVD-0112-S1", "PRD-0112", "SIZE", T.catalogue, "1/2 in", "Row 1502 · col D",
      "NOMINAL SIZE column D = 1/2 IN.", 0.98], 24 * 60),
  ev(["EVD-0112-P1", "PRD-0112", "PRESSURE", T.datasheet, "200 PSI", "p.38 §5.2 Pressure",
      "Working pressure 200 PSI for 1/2 in nipples.", 0.94], 24 * 60),

  // ---- PRD-0113 Union Coupling KSF-U48 ----
  ev(["EVD-0113-M1", "PRD-0113", "MATERIAL", T.catalogue, "Brass", "Row 88 · col C",
      "UNION 1/2 BRASS NPT — material BRASS.", 0.96], 40),
  ev(["EVD-0113-S1", "PRD-0113", "SIZE", T.catalogue, "1/2 in", "Row 88 · col D",
      "NOMINAL SIZE column D = 1/2 IN.", 0.97], 40),
  ev(["EVD-0113-P1", "PRD-0113", "PRESSURE", T.datasheet, "250 PSI", "p.42 §5.2 Pressure",
      "Working pressure 250 PSI for 1/2 in unions.", 0.92], 40),

  // ---- PRD-0114 Elbow 90° VND-EL-90 ----
  ev(["EVD-0114-M1", "PRD-0114", "MATERIAL", T.catalogue, "Brass", "Row 620 · col C",
      "90 ELBOW 3/4 BRASS NPT — material BRASS.", 0.97], 24 * 60),
  ev(["EVD-0114-S1", "PRD-0114", "SIZE", T.catalogue, "3/4 in", "Row 620 · col D",
      "NOMINAL SIZE column D = 3/4 IN.", 0.98], 24 * 60),
  ev(["EVD-0114-P1", "PRD-0114", "PRESSURE", T.datasheet, "150 PSI", "p.46 §5.2 Pressure",
      "Working pressure 150 PSI for 3/4 in elbows.", 0.93], 24 * 60),
];
