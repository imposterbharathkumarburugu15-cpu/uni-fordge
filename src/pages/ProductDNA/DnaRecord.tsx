import { animate, motion, useMotionValue } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Download,
  Loader,
  Minus,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { useConflicts, useProductDna } from "@/hooks/use-forge-store";
import type { ProductAttribute, ProductDna, VerificationStatus } from "@/types/domain";
import { formatPercent } from "@/utils/format";

interface DnaRecordProps {
  productId: string;
}

/**
 * The attribute matrix — the workspace itself.
 * ATTRIBUTE | VALUE | CONFIDENCE | EVIDENCE | STATE.
 * One continuous technical table printed directly on the workspace:
 * no cards, no panels, no containers. Motion is fast and purposeful —
 * staggered row reveals, confidence bars that draw in with a live count,
 * evidence claims that surface in order, spring-in verification marks.
 * Conflicts carry a growing amber rule on the row's left edge with a
 * faint tint and a slow, deliberate pulse — never a box.
 */

const HEADERS = ["Attribute", "Value", "Confidence", "Evidence", "State"];

/** Flat verification flags — icon + label, no chips, no boxes. */
const STATE_META: Record<
  VerificationStatus,
  { label: string; color: string; Icon: LucideIcon; spin?: boolean }
> = {
  VERIFIED: { label: "Verified", color: "var(--uf-success)", Icon: Check },
  CONFLICT: { label: "Conflict", color: "var(--uf-warning)", Icon: AlertTriangle },
  PROCESSING: { label: "Processing", color: "var(--uf-accent)", Icon: Loader, spin: true },
  UNVERIFIED: { label: "Unverified", color: "var(--uf-text-tertiary)", Icon: Minus },
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Normalized agreement test — evidence values carry unit/case variants. */
function agreesWith(attribute: ProductAttribute, sourceValue: string): boolean {
  const norm = (v: string) => v.trim().toUpperCase().replace(/\s+/g, " ");
  const canonical = norm(attribute.value);
  let v = norm(sourceValue);
  if (attribute.unit) {
    const u = norm(attribute.unit);
    if (v.endsWith(u)) v = v.slice(0, v.length - u.length).trim();
  }
  return v === canonical;
}

export function DnaRecord({ productId }: DnaRecordProps) {
  const navigate = useNavigate();
  const dna = useProductDna(productId);
  const conflicts = useConflicts();
  const [viewer, setViewer] = useState<{ open: boolean; attributeKey?: string }>({
    open: false,
  });

  if (!dna) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          Product has no structured DNA yet
        </span>
      </div>
    );
  }

  const openConflicts = conflicts.filter(
    (c) => c.productId === productId && c.status === "OPEN",
  );

  const exportDna = (record: ProductDna) => {
    const payload = {
      schema: "uniforge.product-dna.v1",
      exportedAt: new Date().toISOString(),
      productId: record.productId,
      mpn: record.mpn,
      name: record.name,
      category: record.category,
      verified: `${record.verifiedCount}/${record.totalCount}`,
      confidence: record.confidence,
      revision: record.revision,
      attributes: record.attributes.map((a) => ({
        attribute: a.attribute.key,
        label: a.attribute.label,
        value: a.attribute.value,
        unit: a.attribute.unit,
        confidence: a.attribute.confidence,
        verification: a.attribute.verification,
        sources: a.sources.map((s) => ({
          document: s.document,
          supplier: s.supplier,
          value: s.value,
          pageRef: s.pageRef,
          agreement: s.agreement,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dna_${record.mpn.replace(/[^A-Za-z0-9-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`DNA export downloaded — ${record.mpn}`);
  };

  return (
    <div>
      {/* attribute matrix — the workspace itself, no container */}
      <section className="overflow-x-auto" aria-label="Attribute matrix">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--uf-border-strong)]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)] [font-family:var(--uf-font-condensed)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dna.attributes.map(({ attribute, sources }, i) => (
              <Row
                key={attribute.key}
                attribute={attribute}
                sources={sources}
                index={i}
                onTrace={(key) => setViewer({ open: true, attributeKey: key })}
              />
            ))}
          </tbody>
        </table>
      </section>

      {/* footer strip — record state + flat text actions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.32, delay: 0.22 + dna.attributes.length * 0.05, ease: EASE }}
        className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-[var(--uf-border-faint)] py-4"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
          {openConflicts.length > 0 ? (
            <span className="flex items-center gap-2 text-[11.5px] font-medium text-[var(--uf-warning)]">
              <AlertTriangle className="size-3.5" aria-hidden />
              {openConflicts.length} open conflict{openConflicts.length > 1 ? "s" : ""} — record
              not canonical
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[11.5px] font-medium text-[var(--uf-success)]">
              <span className="h-1.5 w-1.5" style={{ background: "var(--uf-success)" }} aria-hidden />
              Fully verified — no open conflicts
            </span>
          )}
          <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            confidence {formatPercent(dna.confidence)} · revision{" "}
            {String(dna.revision).padStart(2, "0")} · {dna.totalCount} attributes
          </span>
        </div>
        <div className="flex items-center gap-x-5">
          {openConflicts[0] && (
            <button
              type="button"
              onClick={() => navigate(`/resolve?conflict=${openConflicts[0].id}`)}
              className="uf-mono inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-[var(--uf-warning)] underline-offset-4 transition-colors hover:text-[var(--uf-accent-bright)] hover:underline"
            >
              <Scale className="size-3.5" aria-hidden />
              Review conflict
            </button>
          )}
          <button
            type="button"
            onClick={() => exportDna(dna)}
            className="uf-mono inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--uf-accent)] underline-offset-4 transition-colors hover:text-[var(--uf-accent-bright)] hover:underline"
          >
            <Download className="size-3.5" aria-hidden />
            Export DNA
          </button>
        </div>
      </motion.section>

      <EvidenceViewer
        open={viewer.open}
        onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}
        productId={productId}
        attributeKey={viewer.attributeKey}
      />
    </div>
  );
}

function Row({
  attribute,
  sources,
  index,
  onTrace,
}: {
  attribute: ProductAttribute;
  sources: ProductDna["attributes"][number]["sources"];
  index: number;
  onTrace: (key: string) => void;
}) {
  const state = STATE_META[attribute.verification];
  const conflict = attribute.verification === "CONFLICT";
  const pct = Math.round(Math.min(1, Math.max(0, attribute.confidence)) * 100);
  const barColor = conflict
    ? "var(--uf-warning)"
    : attribute.verification === "VERIFIED"
      ? "var(--uf-success)"
      : attribute.verification === "PROCESSING"
        ? "var(--uf-accent)"
        : "var(--uf-text-tertiary)";

  /* live confidence count-up — draws in as the bar fills */
  const count = useMotionValue(0);
  const [label, setLabel] = useState("0%");
  useEffect(() => {
    const controls = animate(count, pct, {
      duration: 0.55,
      delay: 0.16 + index * 0.05,
      ease: "easeOut",
      onUpdate: (v) => setLabel(formatPercent(Math.min(1, Math.max(0, v / 100)))),
    });
    return () => controls.stop();
  }, [count, pct, index]);

  const reveal = {
    duration: 0.3,
    delay: 0.05 + index * 0.05,
    ease: EASE,
  } as const;

  return (
    <motion.tr
      className={`border-b border-[var(--uf-border-faint)] last:border-0 ${
        conflict
          ? "bg-[rgba(217,161,59,0.055)]"
          : "hover:bg-[rgba(255,255,255,0.015)]"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reveal}
    >
      {/* ATTRIBUTE — carries the growing amber rule for conflicts */}
      <td className="relative w-[200px] px-5 py-6 align-top">
        {conflict && (
          <motion.span
            aria-hidden
            className="absolute top-0 bottom-0 left-0 w-[3px] bg-[var(--uf-warning)]"
            style={{ transformOrigin: "top" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.32, delay: 0.12 + index * 0.05, ease: EASE }}
          />
        )}
        <p className="text-[13.5px] font-semibold tracking-tight text-[var(--uf-text-primary)]">
          {attribute.label}
        </p>
        <p className="uf-mono mt-1 text-[9.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
          {attribute.key}
        </p>
      </td>

      {/* VALUE — canonical value with source trace directly beneath */}
      <td className="w-[360px] px-5 py-6 align-top">
        <p className="uf-mono text-[14.5px] font-medium leading-snug text-[var(--uf-text-primary)]">
          {attribute.value}
          {attribute.unit ? (
            <span className="text-[var(--uf-text-tertiary)]"> {attribute.unit}</span>
          ) : null}
        </p>
        {sources.length > 0 && (
          <ul className="mt-2.5 space-y-1">
            {sources.map((src, i) => (
              <motion.li
                key={`${src.document}-${i}`}
                className="uf-mono text-[10px] leading-relaxed text-[var(--uf-text-tertiary)]"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.24, delay: 0.1 + index * 0.05 + i * 0.06, ease: EASE }}
              >
                {src.document}
                <span className="text-[var(--uf-text-secondary)]"> · {src.pageRef}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </td>

      {/* CONFIDENCE — thin technical bar that draws in live */}
      <td className="w-[150px] px-5 py-6 align-top">
        <div className="flex flex-col gap-2">
          <div
            className="h-[3px] w-[76px] bg-[var(--uf-border-faint)]"
            role="meter"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.span
              className="block h-full"
              style={{ background: barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.55, delay: 0.14 + index * 0.05, ease: EASE }}
            />
          </div>
          <motion.span
            className="uf-mono uf-tnum text-[10.5px]"
            style={{ color: barColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.2 + index * 0.05, ease: EASE }}
          >
            {label}
          </motion.span>
        </div>
      </td>

      {/* EVIDENCE — what each source claimed, surfaced in order */}
      <td className="min-w-[300px] px-5 py-6 align-top">
        {sources.length > 0 ? (
          <ul className="space-y-2">
            {sources.map((src, i) => {
              const sole = sources.length === 1;
              const agrees = agreesWith(attribute, src.value);
              const tone = sole
                ? "var(--uf-accent)"
                : agrees
                  ? "var(--uf-success)"
                  : "var(--uf-warning)";
              const tag = sole ? "Sole source" : agrees ? "Agrees" : "Disagrees";
              const dissent = !sole && !agrees;
              return (
                <motion.li
                  key={`${src.document}-${i}`}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-2.5"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.12 + index * 0.06 + i * 0.07, ease: EASE }}
                >
                  {dissent ? (
                    /* disagreeing source — slow amber pulse, deliberate not alarming */
                    <motion.span
                      className="h-1.5 w-1.5 self-center"
                      style={{ background: tone }}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      aria-hidden
                    />
                  ) : (
                    <span className="h-1.5 w-1.5 self-center" style={{ background: tone }} aria-hidden />
                  )}
                  <span className="uf-mono min-w-0 text-[10.5px] text-[var(--uf-text-secondary)]">
                    {src.value}
                  </span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="uf-mono uf-tnum text-[9.5px] text-[var(--uf-text-tertiary)]">
                      {formatPercent(src.confidence)}
                    </span>
                    <span
                      className="uf-mono text-[8px] uppercase tracking-[0.08em]"
                      style={{ color: tone }}
                    >
                      {tag}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <span className="uf-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
            No sources captured
          </span>
        )}
        <button
          type="button"
          onClick={() => onTrace(attribute.key)}
          className="uf-mono mt-3 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)] underline-offset-4 transition-colors hover:text-[var(--uf-accent)] hover:underline"
        >
          <BookOpen className="size-3" aria-hidden />
          Trace
        </button>
      </td>

      {/* STATE — compact verification flag, springs in */}
      <td className="w-[140px] px-5 py-6 align-top">
        <motion.span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] [font-family:var(--uf-font-condensed)]"
          style={{ color: state.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.16 + index * 0.05, ease: EASE }}
        >
          {state.spin ? (
            <Loader className="size-3 animate-spin" aria-hidden />
          ) : (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={
                conflict
                  ? { scale: 1, opacity: [0.55, 1, 0.55] }
                  : { scale: 1, opacity: 1 }
              }
              transition={
                conflict
                  ? {
                      scale: { type: "spring", stiffness: 420, damping: 22, delay: 0.16 + index * 0.05 },
                      opacity: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                    }
                  : {
                      scale: { type: "spring", stiffness: 420, damping: 22, delay: 0.16 + index * 0.05 },
                      opacity: { duration: 0.25, delay: 0.16 + index * 0.05, ease: EASE },
                    }
              }
            >
              <state.Icon className="size-3" aria-hidden />
            </motion.span>
          )}
          {state.label}
        </motion.span>
      </td>
    </motion.tr>
  );
}
