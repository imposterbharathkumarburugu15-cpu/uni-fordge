import { PackageCheck, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Mono } from "@/components/common/Mono";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShipQueue } from "@/hooks/use-forge-store";
import { shipmentService } from "@/services/shipmentService";
import type { ShipmentDestination } from "@/types/domain";

const DESTINATIONS: Array<{ id: ShipmentDestination; label: string }> = [
  { id: "COMMERCE", label: "Commerce · Shopify" },
  { id: "ERP", label: "ERP · SAP S/4HANA" },
  { id: "PIM", label: "PIM · Commerce Cloud" },
  { id: "CATALOG", label: "Catalog · Master Data" },
  { id: "API", label: "Catalog API · v2" },
  { id: "EXPORT", label: "Export · CSV bundle" },
];

/** Verified, conflict-free products — select and ship downstream. */
export function ReadyQueue() {
  const queue = useShipQueue();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [destination, setDestination] = useState<ShipmentDestination>("PIM");
  const [exporting, setExporting] = useState(false);

  const selectedProducts = useMemo(
    () => queue.filter((p) => selected.has(p.id)),
    [queue, selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === queue.length ? new Set() : new Set(queue.map((p) => p.id)),
    );
  };

  const handleExport = async () => {
    if (selectedProducts.length === 0) return;
    setExporting(true);
    const shipment = await shipmentService.export(
      destination,
      selectedProducts.map((p) => p.id),
    );
    setExporting(false);
    setSelected(new Set());
    toast.info(`Export ${shipment.id} started — ${selectedProducts.length} products`);
  };

  const allSelected = queue.length > 0 && selected.size === queue.length;

  return (
    <div className="uf-panel overflow-hidden">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">01</span>
          Ready for Shipment
        </h2>
        <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          {queue.length} products · DNA verified · no open conflicts
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="uf-table">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all ready products"
                  className="accent-[var(--uf-accent)]"
                />
              </th>
              <th>MPN</th>
              <th>Product</th>
              <th>Category</th>
              <th>Confidence</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((p) => (
              <tr key={p.id} className={selected.has(p.id) ? "bg-[var(--uf-accent-dim)]" : undefined}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    aria-label={`Select ${p.mpn}`}
                    className="accent-[var(--uf-accent)]"
                  />
                </td>
                <td>
                  <Mono className="text-[var(--uf-text-primary)]">{p.mpn}</Mono>
                </td>
                <td>
                  <span className="text-[13px] text-[var(--uf-text-primary)]">{p.name}</span>
                </td>
                <td>
                  <span className="text-[12px] text-[var(--uf-text-secondary)]">{p.category}</span>
                </td>
                <td>
                  <ConfidenceMeter value={p.confidence} size="sm" />
                </td>
                <td>
                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--uf-success)]">
                    <PackageCheck className="size-3.5" aria-hidden />
                    {p.attributes.filter((a) => a.verification === "VERIFIED").length}/
                    {p.attributes.length} verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--uf-border-faint)] px-4 py-3">
        <label
          htmlFor="ship-destination"
          className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]"
        >
          Destination
        </label>
        <Select value={destination} onValueChange={(v) => setDestination(v as ShipmentDestination)}>
          <SelectTrigger
            id="ship-destination"
            className="w-[240px] border-[var(--uf-border)] bg-[var(--uf-surface)] text-[var(--uf-text-primary)]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
            {DESTINATIONS.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={handleExport}
          disabled={selectedProducts.length === 0 || exporting}
          className="uf-mono inline-flex items-center gap-2 rounded-sm bg-[var(--uf-accent)] px-4 py-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] transition-colors hover:bg-[var(--uf-accent-bright)] disabled:opacity-40"
        >
          <Send className="size-3.5" aria-hidden />
          {exporting ? "Exporting…" : `Export selected (${selectedProducts.length})`}
        </button>
        <span className="ml-auto text-[11.5px] text-[var(--uf-text-tertiary)]">
          {selectedProducts.length} of {queue.length} selected
        </span>
      </div>
    </div>
  );
}
