import { PageHeader } from "@/components/common/PageHeader";
import { useSources, useSuppliers, useSystemStatus } from "@/hooks/use-forge-store";
import { SourceTable } from "./SourceTable";
import { UploadZone } from "./UploadZone";

/**
 * INTAKE — the supplier-data ingestion workspace.
 * Bring messy supplier sources into UniForge: upload, validate, ingest.
 */
export default function Intake() {
  const sources = useSources();
  const suppliers = useSuppliers();
  const system = useSystemStatus();

  const ingested = sources.filter((s) => s.status === "INGESTED");
  const active = sources.filter((s) => s.status === "QUEUED" || s.status === "PROCESSING");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={["UniForge", "Intake"]}
        title="Intake"
        subtitle="Bring fragmented supplier sources into UniForge. Documents are queued, validated and ingested into the forge pipeline."
        meta={
          <>
            <MetaItem label="QUEUE" value={`${active.length} active`} tone="var(--uf-accent)" />
            <MetaItem label="INGESTED" value={`${ingested.length} documents`} tone="var(--uf-success)" />
            <MetaItem label="INTAKE QUEUE" value={`${system.intakeQueue} total`} tone="var(--uf-text-secondary)" />
          </>
        }
      />
      <UploadZone suppliers={suppliers} onQueued={() => undefined} />
      <SourceTable sources={sources} suppliers={suppliers} />
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
