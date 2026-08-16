import { ArrowRight, PackageCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { Mono } from "@/components/common/Mono";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { useShipQueue } from "@/hooks/use-forge-store";

/** Verified, conflict-free products ready for downstream delivery. */
export function ReadyShipment() {
  const navigate = useNavigate();
  const queue = useShipQueue();

  return (
    <section
      className="rounded-md border border-[var(--uf-success-line)] bg-[var(--uf-success-dim)]"
      aria-label="Ready for shipment"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--uf-success-line)] px-5 py-3">
        <PackageCheck className="size-4 text-[var(--uf-success)]" aria-hidden />
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] [font-family:var(--uf-font-condensed)] text-[var(--uf-success)]">
          {queue.length} products ready for shipment
        </h2>
        <span className="ml-auto hidden text-[12px] text-[var(--uf-text-secondary)] sm:block">
          Product DNA verified · no open conflicts
        </span>
        <button
          type="button"
          onClick={() => navigate("/ship")}
          className="uf-mono inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.1em] text-[var(--uf-success)] transition-colors hover:text-[var(--uf-text-primary)]"
        >
          Open Ship
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 px-5 py-3">
        {queue.slice(0, 6).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => navigate(`/product/${p.id}`)}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-80"
          >
            <span className="uf-dot uf-dot-success" aria-hidden />
            <Mono className="text-[var(--uf-text-primary)]">{p.mpn}</Mono>
            <span className="text-[12.5px] text-[var(--uf-text-secondary)]">{p.name}</span>
            <ConfidenceMeter value={p.confidence} size="sm" showLabel={false} />
          </button>
        ))}
      </div>
    </section>
  );
}
