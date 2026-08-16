import { PageHeader } from "@/components/common/PageHeader";
import { useShipQueue, useShipments, useSystemStatus } from "@/hooks/use-forge-store";
import { ExportQueue } from "./ExportQueue";
import { ReadyQueue } from "./ReadyQueue";

/**
 * SHIP — downstream delivery of verified Product Truth.
 * PRODUCT DNA + VERIFIED + NO OPEN CONFLICTS → ready to ship.
 */
export default function Ship() {
  const queue = useShipQueue();
  const shipments = useShipments();
  const system = useSystemStatus();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={["UniForge", "Ship"]}
        title="Ship"
        subtitle="Move verified product data into downstream systems — commerce, ERP, PIM, catalog, API or export."
        meta={
          <>
            <MetaItem label="READY" value={`${queue.length} products`} tone="var(--uf-success)" />
            <MetaItem label="QUEUE" value={`${system.shipReady} total`} tone="var(--uf-text-secondary)" />
            <MetaItem label="EXPORTS" value={`${shipments.length} on record`} tone="var(--uf-accent)" />
          </>
        }
      />
      <ReadyQueue />
      <ExportQueue />
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
