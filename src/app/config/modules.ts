import type { PipelineStage } from "@/types/domain";

export interface AppModule {
  id: string;
  index: string;
  label: string;
  short: string;
  path: string;
  stage: PipelineStage | null;
  description: string;
}

/** Top-level application modules. Order defines navigation order. */
export const MODULES: AppModule[] = [
  {
    id: "command-center",
    index: "01",
    label: "COMMAND CENTER",
    short: "COMMAND",
    path: "/command-center",
    stage: null,
    description: "Operational master screen",
  },
  {
    id: "intake",
    index: "02",
    label: "INTAKE",
    short: "INTAKE",
    path: "/intake",
    stage: "INTAKE",
    description: "Supplier-data ingestion",
  },
  {
    id: "forge",
    index: "03",
    label: "FORGE",
    short: "FORGE",
    path: "/forge",
    stage: "FORGE",
    description: "Raw data → structured attributes",
  },
  {
    id: "prove",
    index: "04",
    label: "PROVE",
    short: "PROVE",
    path: "/prove",
    stage: "PROVE",
    description: "Attribute verification against evidence",
  },
  {
    id: "resolve",
    index: "05",
    label: "RESOLVE",
    short: "RESOLVE",
    path: "/resolve",
    stage: "RESOLVE",
    description: "Human decision workspace",
  },
  {
    id: "product-dna",
    index: "06",
    label: "PRODUCT DNA",
    short: "DNA",
    path: "/product-dna",
    stage: "PRODUCT_DNA",
    description: "Canonical verified product record",
  },
  {
    id: "ship",
    index: "07",
    label: "SHIP",
    short: "SHIP",
    path: "/ship",
    stage: "SHIP",
    description: "Delivery to downstream systems",
  },
];

export const SITE = {
  name: "UNIFORGE",
  tagline: "PRODUCT INTELLIGENCE",
  operator: "DATA OPERATIONS",
};
