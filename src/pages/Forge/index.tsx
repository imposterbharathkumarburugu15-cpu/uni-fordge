import { PageHeader } from "@/components/common/PageHeader";
import { useProducts, useSystemStatus } from "@/hooks/use-forge-store";
import { ForgeExample } from "./ForgeExample";
import { MappingWorkspace } from "./MappingWorkspace";

/**
 * FORGE — transforms raw supplier information into structured product
 * attributes. RAW DATA → STRUCTURED PRODUCT DATA.
 */
export default function Forge() {
  const system = useSystemStatus();
  const products = useProducts();
  const inForge = products.filter((p) => p.stage === "FORGE").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={["UniForge", "Forge"]}
        title="Forge"
        subtitle="Transform raw supplier strings into structured, normalized product attributes with measurable confidence."
        meta={
          <>
            <MetaItem label="IN FORGE" value={`${inForge} products`} tone="var(--uf-accent)" />
            <MetaItem label="QUEUE" value={`${system.forgeQueue} total`} tone="var(--uf-text-secondary)" />
            <MetaItem label="NEXT STAGE" value="Prove" tone="var(--uf-success)" />
          </>
        }
      />
      <ForgeExample />
      <MappingWorkspace />
    </div>
  );
}

function MetaItem({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
        {label}
      </span>
      <span className="uf-mono text-[11.5px] font-medium" style={{ color: tone }}>
        {value}
      </span>
    </span>
  );
}
