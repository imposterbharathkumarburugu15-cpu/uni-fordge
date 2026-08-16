import { motion } from "framer-motion";
import { ArrowRight, Check, FileQuestion, Gavel, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Mono, Timestamp } from "@/components/common/Mono";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useConflict, useProduct, useResolutions } from "@/hooks/use-forge-store";
import { resolveService } from "@/services/resolveService";
import type { ResolutionMode } from "@/types/domain";
import { formatPercent } from "@/utils/format";

const REASON_SUGGESTIONS = [
  "Manufacturer datasheet is authoritative for this series.",
  "Two independent engineering sources agree on this value.",
  "Catalogue value is the generic column default, not MPN-specific.",
  "Value confirmed against regional distribution standard.",
];

interface DecisionWorkspaceProps {
  conflictId: string;
}

/** The engineering review console — one conflict, one decision. */
export function DecisionWorkspace({ conflictId }: DecisionWorkspaceProps) {
  const navigate = useNavigate();
  const conflict = useConflict(conflictId);
  const product = useProduct(conflict?.productId);
  const resolutions = useResolutions();

  const resolution = useMemo(
    () => resolutions.find((r) => r.conflictId === conflictId),
    [resolutions, conflictId],
  );

  const [mode, setMode] = useState<ResolutionMode>("RECOMMENDATION");
  const [selectedValue, setSelectedValue] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (conflict) setSelectedValue(conflict.recommendation);
  }, [conflict]);

  if (!conflict) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          Select a conflict from the queue
        </span>
      </div>
    );
  }

  const isResolved = conflict.status === "RESOLVED";
  const finalValue = mode === "MANUAL" ? (customValue.trim() || selectedValue) : selectedValue;

  const handleResolve = async () => {
    if (!finalValue.trim()) {
      toast.error("Choose a value before resolving");
      return;
    }
    if (!reason.trim()) {
      toast.error("A decision reason is required for the audit trail");
      return;
    }
    setBusy(true);
    const result = await resolveService.resolve(conflict.id, {
      selectedValue: finalValue.trim(),
      reason: reason.trim(),
      mode,
    });
    setBusy(false);
    if (result) {
      toast.success(`${conflict.attributeLabel} resolved → ${finalValue.trim()}`);
    }
  };

  const handleRequestEvidence = async () => {
    if (!reason.trim()) {
      toast.error("Describe what evidence you need");
      return;
    }
    setBusy(true);
    await resolveService.requestMoreEvidence(conflict.id, reason.trim());
    setBusy(false);
    setReason("");
    toast.info("Additional evidence requested — conflict stays open");
  };

  if (isResolved && resolution) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start gap-5 p-6"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-full border"
            style={{
              color: "var(--uf-success)",
              borderColor: "var(--uf-success-line)",
              background: "var(--uf-success-dim)",
            }}
          >
            <Check className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--uf-text-primary)]">
              Conflict resolved
            </h3>
            <p className="uf-mono text-[11px] text-[var(--uf-text-tertiary)]">
              {resolution.id} · {resolution.resolvedBy} ·{" "}
              <Timestamp iso={resolution.resolvedAt} />
            </p>
          </div>
        </div>

        <dl className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["ATTRIBUTE", conflict.attributeLabel],
            ["SELECTED VALUE", resolution.selectedValue],
            ["MODE", resolution.mode.replace(/_/g, " ")],
            ["PRODUCT", product?.mpn ?? conflict.productId],
          ].map(([k, v]) => (
            <div key={k} className="rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] p-3">
              <dt className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                {k}
              </dt>
              <dd className="uf-mono mt-1 text-[13px] text-[var(--uf-text-primary)]">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="w-full rounded-sm border border-[var(--uf-border)] bg-[var(--uf-bg)] p-4">
          <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            Decision reason
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--uf-text-secondary)]">
            {resolution.reason}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/product/${conflict.productId}`)}
            className="uf-mono inline-flex items-center gap-1.5 rounded-sm bg-[var(--uf-accent)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
          >
            Open product record
            <ArrowRight className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => navigate("/product-dna")}
            className="uf-mono inline-flex items-center gap-1.5 rounded-sm border border-[var(--uf-border-strong)] px-3.5 py-2 text-[11px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] hover:text-[var(--uf-text-primary)]"
          >
            View Product DNA
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-[16px] font-semibold text-[var(--uf-text-primary)]">
              {conflict.attributeLabel} conflict
            </h3>
            <StatusBadge status={conflict.status} />
            {conflict.requestedEvidence > 0 && (
              <span className="uf-mono text-[10.5px] text-[var(--uf-text-tertiary)]">
                +{conflict.requestedEvidence} evidence request{conflict.requestedEvidence > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-[var(--uf-text-secondary)]">
            {product?.name} · <Mono className="text-[var(--uf-text-primary)]">{product?.mpn}</Mono>
          </p>
        </div>
        <span className="uf-mono text-[10.5px] text-[var(--uf-text-tertiary)]">
          opened <Timestamp iso={conflict.openedAt} />
        </span>
      </div>

      {/* source comparison */}
      <div className="mt-5 overflow-x-auto">
        <table className="uf-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Document</th>
              <th>Value</th>
              <th>Confidence</th>
              <th>Supports recommendation</th>
            </tr>
          </thead>
          <tbody>
            {conflict.sources.map((src, i) => {
              const supports = src.value === conflict.recommendation;
              return (
                <tr key={src.evidenceId}>
                  <td>
                    <span className="uf-mono text-[10.5px] text-[var(--uf-text-tertiary)]">
                      {String.fromCharCode(65 + i)} · {src.supplier}
                    </span>
                  </td>
                  <td>
                    <span className="uf-mono text-[11.5px] text-[var(--uf-text-secondary)]">
                      {src.document}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`uf-mono text-[12.5px] font-medium ${
                        supports ? "text-[var(--uf-success)]" : "text-[var(--uf-text-primary)]"
                      }`}
                    >
                      {src.value}
                    </span>
                  </td>
                  <td>
                    <ConfidenceMeter value={src.confidence} size="sm" />
                  </td>
                  <td>
                    <span
                      className={`uf-mono text-[10.5px] uppercase tracking-[0.08em] ${
                        supports ? "text-[var(--uf-success)]" : "text-[var(--uf-warning)]"
                      }`}
                    >
                      {supports ? "✓ Agrees" : "✗ Disagrees"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* system recommendation */}
      <div className="mt-5 rounded-sm border border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--uf-accent)]" aria-hidden />
          <p className="uf-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-accent)]">
            System recommendation
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="uf-mono text-[18px] font-semibold text-[var(--uf-text-primary)]">
            {conflict.recommendation}
          </span>
          <ConfidenceMeter value={conflict.recommendationConfidence} />
        </div>
        <p className="mt-2 max-w-3xl text-[12.5px] leading-relaxed text-[var(--uf-text-secondary)]">
          {conflict.rationale}
        </p>
      </div>

      {/* decision actions */}
      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--uf-border-faint)] pb-3">
          <p className="uf-mono mr-2 text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
            Decision
          </p>
          {(
            [
              ["RECOMMENDATION", "Accept recommendation"],
              ["MANUAL", "Choose value"],
              ["MORE_EVIDENCE", "Request more evidence"],
            ] as Array<[ResolutionMode, string]>
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`uf-mono rounded-sm border px-3 py-1.5 text-[10.5px] uppercase tracking-[0.08em] transition-colors ${
                mode === m
                  ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] text-[var(--uf-accent)]"
                  : "border-[var(--uf-border)] text-[var(--uf-text-tertiary)] hover:text-[var(--uf-text-secondary)]"
              }`}
              aria-pressed={mode === m}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "RECOMMENDATION" && (
          <div className="mt-4 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-bg)] p-4">
            <p className="text-[13px] text-[var(--uf-text-secondary)]">
              Resolve <span className="uf-mono font-medium text-[var(--uf-accent)]">{conflict.recommendation}</span>{" "}
              as the verified value for {conflict.attributeLabel.toLowerCase()}.
            </p>
            <button
              type="button"
              onClick={() => setSelectedValue(conflict.recommendation)}
              className="mt-2 uf-mono text-[11px] text-[var(--uf-accent)] underline-offset-2 hover:underline"
            >
              Set value · {conflict.recommendation}
            </button>
          </div>
        )}

        {mode === "MANUAL" && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Choose attribute value">
              {conflict.sources.map((src, i) => (
                <label
                  key={src.evidenceId}
                  className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 transition-colors ${
                    selectedValue === src.value
                      ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)]"
                      : "border-[var(--uf-border)] bg-[var(--uf-surface)] hover:border-[var(--uf-border-strong)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="manual-value"
                    value={src.value}
                    checked={selectedValue === src.value}
                    onChange={() => setSelectedValue(src.value)}
                    className="accent-[var(--uf-accent)]"
                  />
                  <span className="uf-mono text-[12px] text-[var(--uf-text-primary)]">{src.value}</span>
                  <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                    {String.fromCharCode(65 + i)} · {formatPercent(src.confidence)}
                  </span>
                </label>
              ))}
              <div className="flex items-center gap-2 rounded-sm border border-dashed border-[var(--uf-border-strong)] px-3 py-1.5">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Custom value…"
                  className="w-36 bg-transparent uf-mono text-[12px] text-[var(--uf-text-primary)] outline-none placeholder:text-[var(--uf-text-tertiary)]"
                  aria-label="Custom attribute value"
                />
              </div>
            </div>
          </div>
        )}

        {mode === "MORE_EVIDENCE" && (
          <div className="mt-4 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-bg)] p-4">
            <p className="text-[13px] text-[var(--uf-text-secondary)]">
              Hold the conflict open and request an additional source document from the
              supplier before deciding.
            </p>
          </div>
        )}

        {/* reason */}
        <div className="mt-4">
          <label
            htmlFor="resolve-reason"
            className="uf-mono mb-1.5 block text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]"
          >
            {mode === "MORE_EVIDENCE" ? "Evidence request — what is needed?" : "Decision reason (audit trail)"}
          </label>
          <textarea
            id="resolve-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={
              mode === "MORE_EVIDENCE"
                ? "e.g. Request material test certificate from Vanderhof Industries…"
                : "e.g. Datasheet §3.2 specifies ASTM B62 bronze; catalogue value is a generic default…"
            }
            className="w-full resize-none rounded-sm border border-[var(--uf-border)] bg-[var(--uf-bg)] p-3 text-[13px] text-[var(--uf-text-primary)] outline-none transition-colors focus:border-[var(--uf-accent)]"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REASON_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setReason(s)}
                className="rounded-sm border border-[var(--uf-border-faint)] bg-[var(--uf-surface)] px-2 py-1 text-[11px] text-[var(--uf-text-tertiary)] transition-colors hover:text-[var(--uf-text-secondary)]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--uf-border-faint)] pt-4">
          {mode === "MORE_EVIDENCE" ? (
            <button
              type="button"
              onClick={handleRequestEvidence}
              disabled={busy}
              className="uf-mono inline-flex items-center gap-2 rounded-sm border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-warning)] transition-colors hover:bg-[var(--uf-warning)] hover:text-[var(--uf-bg)] disabled:opacity-50"
            >
              <FileQuestion className="size-4" aria-hidden />
              {busy ? "Requesting…" : "Request more evidence"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResolve}
              disabled={busy}
              className="uf-mono inline-flex items-center gap-2 rounded-sm bg-[var(--uf-accent)] px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] shadow-[0_0_18px_rgba(55,199,234,0.2)] transition-colors hover:bg-[var(--uf-accent-bright)] disabled:opacity-50"
            >
              <Gavel className="size-4" aria-hidden />
              {busy
                ? "Recording…"
                : mode === "MANUAL"
                  ? `Apply value · ${finalValue || "—"}`
                  : `Accept recommendation · ${conflict.recommendation}`}
            </button>
          )}
          <span className="text-[11.5px] text-[var(--uf-text-tertiary)]">
            Decision is written to the audit trail as {conflict.productId} ·{" "}
            {conflict.attributeKey}.
          </span>
        </div>
      </div>
    </div>
  );
}
