import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Check,
  FileText,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Mono, Timestamp } from "@/components/common/Mono";
import { ProductVisualization } from "@/components/common/ProductVisualization";
import { StatusBadge } from "@/components/status/StatusBadge";
import {
  useConflicts,
  useEvidence,
  useProducts,
  useResolutions,
} from "@/hooks/use-forge-store";
import { resolveService } from "@/services/resolveService";
import type { Conflict, ConflictSource } from "@/types/domain";
import { formatDate, formatPercent } from "@/utils/format";

/**
 * RESOLVE — the human decision workspace.
 * One conflict, one decision: review the competing sources, commit the
 * single product truth, or keep the conflict open for more evidence.
 */
export default function Resolve() {
  const conflicts = useConflicts();
  const products = useProducts();
  const evidence = useEvidence();
  const resolutions = useResolutions();
  const navigate = useNavigate();

  const open = conflicts.filter((c) => c.status === "OPEN");
  const [searchParams, setSearchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);

  // Selected conflict is derived from the ?conflict= query param, falling
  // back to the first open conflict — no state duplication, deep links work.
  const fromQuery = searchParams.get("conflict");
  const active = conflicts.find((c) => c.id === fromQuery) ?? open[0];
  const product = products.find((p) => p.id === active?.productId);
  const resolution = active
    ? resolutions.find((r) => r.conflictId === active.id)
    : undefined;

  const select = (id: string) => {
    setSearchParams({ conflict: id }, { replace: true });
  };

  const handleAccept = async (value: string) => {
    if (!active || busy) return;
    setBusy(true);
    const result = await resolveService.resolve(active.id, {
      selectedValue: value,
      reason: `Source evidence review — accepted ${value} for ${active.attributeLabel}. Recommendation confidence ${formatPercent(
        active.recommendationConfidence,
      )}.`,
      mode: "RECOMMENDATION",
    });
    setBusy(false);
    if (result) {
      toast.success(`${active.attributeLabel} resolved → ${value}`);
    }
  };

  const keepUnresolved = () => {
    toast.info("Conflict remains open — no value committed to the record");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* module strip */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--uf-border-strong)] bg-[var(--uf-surface)] px-3 py-1.5">
          <span className="uf-mono text-[10px] uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
            UniForge <span className="text-[var(--uf-text-tertiary)]">/</span> Resolve
          </span>
        </span>
        <div className="flex items-center gap-2">
          {open.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-3 py-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-[var(--uf-accent)]">
                <AlertTriangle className="size-2.5 text-[var(--uf-primary-foreground)]" aria-hidden />
              </span>
              <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-accent)]">
                {open.length} conflict{open.length > 1 ? "s" : ""} require review
              </span>
            </span>
          )}
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] text-[var(--uf-warning)]"
            aria-label="Open conflicts require review"
          >
            <AlertTriangle className="size-3.5" aria-hidden />
          </button>
        </div>
      </header>

      {/* conflict selector */}
      {conflicts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-y border-[var(--uf-border-faint)] py-2.5 scrollbar-none">
          {conflicts.map((c) => {
            const p = products.find((x) => x.id === c.productId);
            const isActive = c.id === active?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => select(c.id)}
                className={`flex shrink-0 items-center gap-2 rounded-sm border px-3 py-1.5 transition-colors ${
                  isActive
                    ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)]"
                    : c.status === "OPEN"
                      ? "border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)]"
                      : "border-[var(--uf-border)] bg-[var(--uf-surface)]"
                }`}
                aria-pressed={isActive}
              >
                <Mono className="text-[10.5px] text-[var(--uf-text-primary)]">{c.id}</Mono>
                <span className="text-[12px] text-[var(--uf-text-secondary)]">
                  {p?.mpn ?? c.productId} · {c.attributeLabel}
                </span>
                <StatusBadge status={c.status} />
              </button>
            );
          })}
        </div>
      )}

      {active ? (
        <>
          {/* decision hero */}
          <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <p className="uf-eyebrow">
                Data operations · decision queue · {active.id}
              </p>
              <h1 className="mt-4 text-3xl font-bold uppercase leading-[1.06] tracking-tight text-[var(--uf-text-primary)] md:text-[44px]">
                Source conflict
                <br />
                requires your decision
                <span className="text-[var(--uf-accent)]">.</span>
              </h1>
              <p className="mt-4 max-w-[520px] text-[14.5px] leading-relaxed text-[var(--uf-text-secondary)]">
                Data discrepancy identified in the {active.attributeLabel.toLowerCase()} attribute
                of{" "}
                <span className="uf-mono text-[var(--uf-text-primary)]">
                  {product?.mpn ?? active.productId}
                </span>
                . Review the source evidence and determine the single product
                truth.
              </p>
            </motion.div>

            {/* product visual with attribute-under-review marker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="uf-grid-bg relative overflow-hidden rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] px-4 py-2">
                <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                  Record view · {product?.mpn}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-2 py-0.5">
                  <AlertTriangle className="size-3 text-[var(--uf-warning)]" aria-hidden />
                  <span className="uf-mono text-[9px] uppercase tracking-[0.1em] text-[var(--uf-warning)]">
                    Attribute under review · {active.attributeLabel}
                  </span>
                </span>
              </div>
              <ProductVisualization productId={active.productId} className="h-auto w-full max-w-[520px] mx-auto px-3 py-2" />
            </motion.div>
          </section>

          {/* source comparison */}
          <section aria-label="Source evidence comparison">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="uf-section-title">
                <span className="idx">01</span>
                Source Evidence
              </h2>
              <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                {active.sources.length} competing sources
              </span>
            </div>

            <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
              {active.sources.map((src, i) => (
                <SourceCard
                  key={src.evidenceId}
                  source={src}
                  index={i}
                  capturedAt={
                    evidence.find((e) => e.id === src.evidenceId)?.capturedAt
                  }
                />
              ))}

              {/* attribute hub */}
              <div className="flex items-center justify-center py-2">
                <div className="relative">
                  <span
                    className="absolute inset-0 -m-2"
                    aria-hidden
                    style={{
                      background:
                        "radial-gradient(circle, rgba(55,199,234,0.14), transparent 70%)",
                    }}
                  />
                  <span
                    className="relative flex items-center justify-center px-5 py-2.5"
                    style={{
                      clipPath:
                        "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                      background: "var(--uf-accent)",
                    }}
                    aria-hidden
                  />
                  <span
                    className="relative z-10 -mt-[30px] flex items-center justify-center px-4 py-2"
                    style={{
                      clipPath:
                        "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                      background: "var(--uf-bg)",
                      border: "none",
                    }}
                  >
                    <span className="uf-mono text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--uf-accent)]">
                      {active.attributeLabel}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* decision or product truth */}
          {active.status === "OPEN" ? (
            <section className="uf-panel overflow-hidden">
              <div className="px-5 py-6 text-center">
                <p className="uf-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
                  Which value should become product truth?
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {active.sources.map((src) => {
                    const isRecommended =
                      src.value === active.recommendation;
                    return (
                      <button
                        key={src.evidenceId}
                        type="button"
                        onClick={() => handleAccept(src.value)}
                        disabled={busy}
                        className={`uf-mono rounded-sm px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] transition-all ${
                          isRecommended
                            ? "bg-[var(--uf-accent)] text-[var(--uf-primary-foreground)] shadow-[0_0_22px_rgba(55,199,234,0.35)] hover:bg-[var(--uf-accent-bright)]"
                            : "border border-[var(--uf-accent-line)] bg-transparent text-[var(--uf-accent)] hover:bg-[var(--uf-accent-dim)]"
                        } disabled:opacity-50`}
                      >
                        Accept {src.value}
                        {isRecommended ? " · rec" : ""}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={keepUnresolved}
                    disabled={busy}
                    className="uf-mono rounded-sm border border-[var(--uf-border-strong)] px-5 py-2.5 text-[11.5px] uppercase tracking-[0.1em] text-[var(--uf-text-secondary)] transition-colors hover:border-[var(--uf-warning)] hover:text-[var(--uf-warning)] disabled:opacity-50"
                  >
                    Keep unresolved
                  </button>
                </div>
              </div>
            </section>
          ) : (
            resolution && <TruthPanel conflict={active} resolutionId={resolution.id} />
          )}
        </>
      ) : (
        <div className="uf-panel px-5 py-14 text-center">
          <ShieldCheck className="mx-auto size-8 text-[var(--uf-success)]" aria-hidden />
          <p className="uf-mono mt-3 text-[11px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
            No conflicts on record — automated processing is clear
          </p>
          <button
            type="button"
            onClick={() => navigate("/command-center")}
            className="uf-mono mt-4 text-[11.5px] text-[var(--uf-accent)] hover:underline"
          >
            Return to Command Center →
          </button>
        </div>
      )}
    </div>
  );
}

function SourceCard({
  source,
  index,
  capturedAt,
}: {
  source: ConflictSource;
  index: number;
  capturedAt?: string;
}) {
  const name = source.document.toLowerCase();
  const isApi = name.includes("api");
  const isDatasheet = name.includes("datasheet") || name.endsWith(".pdf");
  const isCatalogue =
    name.includes("catalogue") ||
    name.includes("catalog") ||
    name.includes("pricebook") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".csv");

  const typeLabel = isApi
    ? "API FEED"
    : isDatasheet
      ? "PDF DATASHEET"
      : isCatalogue
        ? "SUPPLIER CATALOGUE"
        : "SOURCE DOCUMENT";
  const method = isApi ? "SYSTEM INTEGRATED" : "AI EXTRACTED";
  const Icon = isApi ? Server : isDatasheet ? BookOpen : FileText;

  return (
    <div className="flex flex-col rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-4 py-2.5">
        <Icon className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
        <span className="uf-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--uf-accent)]">
          {typeLabel}
        </span>
        <span className="uf-mono ml-auto text-[9px] text-[var(--uf-text-tertiary)]">
          {String.fromCharCode(65 + index)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="uf-mono text-[26px] font-bold uppercase text-[var(--uf-warning)]">
            {source.value}
          </p>
          <AlertTriangle className="mt-1 size-4 shrink-0 text-[var(--uf-warning)]" aria-hidden />
        </div>
        <dl className="mt-4 space-y-1.5 border-t border-[var(--uf-border-faint)] pt-3">
          <MetaRow label="SOURCE DATE" value={capturedAt ? formatDate(capturedAt) : "—"} />
          <MetaRow label="TYPE" value={typeLabel} />
          <MetaRow label="CONFIDENCE" value={`${formatPercent(source.confidence)} (${method})`} />
        </dl>
        <p className="uf-mono mt-3 truncate text-[10px] text-[var(--uf-text-tertiary)]" title={source.document}>
          {source.document} · {source.supplier}
        </p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="uf-mono text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
        {label}
      </dt>
      <dd className="uf-mono text-[10.5px] text-[var(--uf-text-primary)]">{value}</dd>
    </div>
  );
}

function TruthPanel({ conflict, resolutionId }: { conflict: Conflict; resolutionId: string }) {
  const resolutions = useResolutions();
  const resolution = resolutions.find((r) => r.id === resolutionId);
  if (!resolution) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-md border border-[var(--uf-accent-line)] bg-[var(--uf-surface)]"
    >
      <div className="flex items-center gap-2 border-b border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-4 py-2.5">
        <Check className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
        <span className="uf-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--uf-accent)]">
          Product truth
        </span>
        <span className="uf-mono ml-auto text-[9.5px] text-[var(--uf-text-tertiary)]">
          {resolution.id}
        </span>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
        <div>
          <p className="uf-mono text-[20px] font-semibold text-[var(--uf-text-primary)]">
            {conflict.attributeLabel}:{" "}
            <span className="text-[var(--uf-success)]">{resolution.selectedValue}</span>{" "}
            <Check className="mb-0.5 inline size-4 text-[var(--uf-success)]" aria-hidden />
          </p>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-[var(--uf-text-secondary)]">
            {resolution.reason}
          </p>
        </div>
        <div className="flex min-w-[180px] flex-col gap-2 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-bg)] p-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="uf-mono text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              Status
            </span>
            <span className="uf-mono text-[11px] font-medium text-[var(--uf-success)]">
              Human verified
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="uf-mono text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              Operator
            </span>
            <span className="uf-mono text-[11px] text-[var(--uf-text-primary)]">
              {resolution.resolvedBy}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="uf-mono text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              Committed
            </span>
            <span className="uf-mono text-[11px] text-[var(--uf-text-primary)]">
              <Timestamp iso={resolution.resolvedAt} />
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
