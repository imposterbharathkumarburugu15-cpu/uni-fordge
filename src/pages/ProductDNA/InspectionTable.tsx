import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  FileText,
  Loader,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductAttribute, ProductDna, VerificationStatus } from "@/types/domain";
import { formatPercent } from "@/utils/format";

/**
 * The inspection record — a technical table, not a card grid.
 * ATTRIBUTE | VALUE | CONFIDENCE | SOURCE TRACEABILITY | VERIFICATION.
 * Full-width rows separated by thin lines. Rows reveal sequentially:
 * value first, confidence bar draws in with a live count, sources surface
 * in order, verification state activates. Hovering a source draws a
 * connector and lights up the matching value. Conflicts wash the row in
 * amber with a left rule and compare evidence line by line.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATE_META: Record<
  VerificationStatus,
  { label: string; color: string; Icon: LucideIcon; spin?: boolean; note: string }
> = {
  VERIFIED: { label: "Verified", color: "var(--uf-success)", Icon: Check, note: "Canonical" },
  CONFLICT: { label: "Conflict", color: "var(--uf-warning)", Icon: AlertTriangle, note: "Requires human review" },
  PROCESSING: { label: "Processing", color: "var(--uf-accent)", Icon: Loader, spin: true, note: "In flight" },
  UNVERIFIED: { label: "Unverified", color: "var(--uf-text-tertiary)", Icon: Minus, note: "Not yet verified" },
};

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

type Sources = ProductDna["attributes"][number]["sources"];

function toneFor(attribute: ProductAttribute, sources: Sources, src: Sources[number]) {
  return sources.length === 1
    ? "var(--uf-accent)"
    : agreesWith(attribute, src.value)
      ? "var(--uf-success)"
      : "var(--uf-warning)";
}

function barColorFor(attribute: ProductAttribute) {
  return attribute.verification === "CONFLICT"
    ? "var(--uf-warning)"
    : attribute.verification === "VERIFIED"
      ? "var(--uf-success)"
      : attribute.verification === "PROCESSING"
        ? "var(--uf-accent)"
        : "var(--uf-text-tertiary)";
}

export function InspectionTable({ attributes }: { attributes: ProductDna["attributes"] }) {
  return (
    <section aria-label="Inspection record" className="relative">
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--uf-border-strong)] py-2">
        <span className="uf-mono text-[9px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
          Inspection record
        </span>
        <span className="uf-mono hidden text-[8.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)] md:block">
          Hover a source to trace
        </span>
        <span className="uf-mono text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)] md:hidden">
          {attributes.length} attributes
        </span>
      </div>

      {/* desktop — technical inspection table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1060px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--uf-border-faint)]">
              {["Attribute", "Value", "Confidence", "Source traceability", "Verification"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)] [font-family:var(--uf-font-condensed)]"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {attributes.map(({ attribute, sources }, i) => (
              <Row key={attribute.key} attribute={attribute} sources={sources} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile — vertical technical inspection flow */}
      <div className="md:hidden">
        {attributes.map(({ attribute, sources }, i) => (
          <MobileRow key={attribute.key} attribute={attribute} sources={sources} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop row                                                         */
/* ------------------------------------------------------------------ */

function Row({
  attribute,
  sources,
  index,
}: {
  attribute: ProductAttribute;
  sources: Sources;
  index: number;
}) {
  const conflict = attribute.verification === "CONFLICT";
  const [hovering, setHovering] = useState(false);
  const [hoverSrc, setHoverSrc] = useState<number | null>(null);
  const base = 0.14 + index * 0.1;

  return (
    <motion.tr
      className={`border-b border-[var(--uf-border-faint)] transition-colors last:border-0 ${
        conflict ? "bg-[rgba(217,161,59,0.06)] hover:bg-[rgba(217,161,59,0.08)]" : "hover:bg-[rgba(255,255,255,0.02)]"
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setHoverSrc(null);
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: base, ease: EASE }}
    >
      {/* ATTRIBUTE */}
      <td className="relative w-[190px] px-5 py-5 align-top">
        {conflict && (
          <motion.span
            aria-hidden
            className="absolute top-0 bottom-0 left-0 w-[3px] bg-[var(--uf-warning)]"
            style={{ transformOrigin: "top" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.34, delay: base + 0.15, ease: EASE }}
          />
        )}
        <p className="text-[13.5px] font-semibold tracking-tight text-[var(--uf-text-primary)] [font-family:var(--uf-font-condensed)]">
          {attribute.label}
        </p>
        <p className="uf-mono mt-1 text-[9px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
          {attribute.key}
        </p>
      </td>

      {/* VALUE */}
      <td className="w-[290px] px-5 py-5 align-top">
        <p
          className={`uf-mono text-[15px] font-medium leading-snug transition-colors ${
            hoverSrc != null ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-primary)]"
          }`}
        >
          {attribute.value}
          {attribute.unit ? (
            <span className="text-[var(--uf-text-tertiary)]"> {attribute.unit}</span>
          ) : null}
        </p>
        {conflict && (
          <div className="mt-3 space-y-1.5">
            {sources.map((src, j) => (
              <CompareLine
                key={`${src.document}-${j}`}
                src={src}
                attribute={attribute}
                sole={sources.length === 1}
                base={base}
                j={j}
              />
            ))}
          </div>
        )}
      </td>

      {/* CONFIDENCE */}
      <td className="w-[150px] px-5 py-5 align-top">
        <Confidence attribute={attribute} base={base} replay={hovering} />
      </td>

      {/* SOURCE TRACEABILITY */}
      <td className="min-w-[300px] px-5 py-5 align-top">
        <Sources
          sources={sources}
          attribute={attribute}
          base={base}
          hoverSrc={hoverSrc}
          setHoverSrc={setHoverSrc}
        />
      </td>

      {/* VERIFICATION */}
      <td className="w-[160px] px-5 py-5 align-top">
        <StateFlag attribute={attribute} base={base} />
      </td>
    </motion.tr>
  );
}

/* ------------------------------------------------------------------ */
/* Shared cells                                                        */
/* ------------------------------------------------------------------ */

function CompareLine({
  src,
  attribute,
  sole,
  base,
  j,
}: {
  src: Sources[number];
  attribute: ProductAttribute;
  sole: boolean;
  base: number;
  j: number;
}) {
  const agrees = agreesWith(attribute, src.value);
  const tone = sole ? "var(--uf-accent)" : agrees ? "var(--uf-success)" : "var(--uf-warning)";
  const tag = sole ? "Sole" : agrees ? "Agrees" : "Disagrees";
  return (
    <motion.div
      className="flex items-baseline gap-2"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: base + 0.4 + j * 0.16, ease: EASE }}
    >
      <span className="size-1.5 self-center" style={{ background: tone }} aria-hidden />
      <span className="uf-mono text-[11px] font-medium text-[var(--uf-text-secondary)]">
        {src.value}
      </span>
      <span className="uf-mono uf-tnum text-[9.5px] text-[var(--uf-text-tertiary)]">
        {formatPercent(src.confidence)}
      </span>
      <span className="uf-mono text-[8px] uppercase tracking-[0.08em]" style={{ color: tone }}>
        {tag}
      </span>
    </motion.div>
  );
}

function Confidence({
  attribute,
  base,
  replay,
}: {
  attribute: ProductAttribute;
  base: number;
  replay: boolean;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, attribute.confidence)) * 100);
  const color = barColorFor(attribute);
  const mv = useMotionValue(0);
  const [label, setLabel] = useState("0%");
  useEffect(() => {
    const controls = animate(mv, pct, {
      duration: 0.9,
      delay: base + 0.25,
      ease: EASE,
      onUpdate: (v) => setLabel(formatPercent(Math.min(1, Math.max(0, v / 100)))),
    });
    return () => controls.stop();
  }, [mv, pct, base]);

  return (
    <div>
      <div
        className="h-[3px] w-24 bg-[var(--uf-border-faint)]"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.span
          key={replay ? "hover" : "load"}
          className="block h-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: replay ? 0.7 : 0.9,
            delay: replay ? 0 : base + 0.25,
            ease: EASE,
          }}
        />
      </div>
      <span className="uf-mono uf-tnum mt-1.5 block text-[10.5px]" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function Sources({
  sources,
  attribute,
  base,
  hoverSrc,
  setHoverSrc,
}: {
  sources: Sources;
  attribute: ProductAttribute;
  base: number;
  hoverSrc: number | null;
  setHoverSrc: (i: number | null) => void;
}) {
  if (sources.length === 0) {
    return (
      <span className="uf-mono text-[9px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
        No sources captured
      </span>
    );
  }
  return (
    <ul className="space-y-2.5">
      {sources.map((src, j) => {
        const hot = hoverSrc === j;
        const tone = toneFor(attribute, sources, src);
        return (
          <li
            key={`${src.document}-${j}`}
            onMouseEnter={() => setHoverSrc(j)}
            onMouseLeave={() => setHoverSrc(null)}
            className="group cursor-default"
          >
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: base + 0.4 + j * 0.09, ease: EASE }}
            >
              <span
                className={`uf-mono inline-flex items-center gap-1.5 text-[10.5px] transition-colors ${
                  hot ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-secondary)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`size-1.5 transition-all ${
                    hot ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                  }`}
                  style={{ background: tone }}
                />
                <FileText
                  className={`size-3 transition-colors ${
                    hot ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-tertiary)]"
                  }`}
                  aria-hidden
                />
                {src.document}
              </span>
              {/* connector line — draws toward the attribute when hovered */}
              <span className="block h-px w-10 overflow-hidden bg-[var(--uf-border-faint)]">
                <motion.span
                  aria-hidden
                  className="block h-full bg-[var(--uf-accent)]"
                  style={{ transformOrigin: "left" }}
                  initial={false}
                  animate={{ scaleX: hot ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
              </span>
              <span
                className={`uf-mono mt-0.5 block text-[8.5px] uppercase tracking-[0.08em] transition-colors ${
                  hot ? "text-[var(--uf-text-secondary)]" : "text-[var(--uf-text-tertiary)]"
                }`}
              >
                {src.pageRef}
              </span>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}

function StateFlag({ attribute, base }: { attribute: ProductAttribute; base: number }) {
  const state = STATE_META[attribute.verification];
  const conflict = attribute.verification === "CONFLICT";
  return (
    <div>
      <motion.span
        className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] [font-family:var(--uf-font-condensed)]"
        style={{ color: state.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: base + 0.5, ease: EASE }}
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
                    scale: { type: "spring", stiffness: 420, damping: 22, delay: base + 0.5 },
                    opacity: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                  }
                : {
                    scale: { type: "spring", stiffness: 420, damping: 22, delay: base + 0.5 },
                    opacity: { duration: 0.25, delay: base + 0.5, ease: EASE },
                  }
            }
          >
            <state.Icon className="size-3" aria-hidden />
          </motion.span>
        )}
        {state.label}
      </motion.span>
      {/* signal pulse — green verified, amber conflict */}
      <motion.span
        aria-hidden
        className="mt-1.5 block h-1 w-8"
        style={{ background: state.color }}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{
          duration: conflict ? 1.8 : 2.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: base + 0.55,
        }}
      />
      <motion.p
        className="uf-mono mt-1 text-[8.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: base + 0.6, ease: EASE }}
      >
        {state.note}
      </motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile — vertical technical inspection flow                         */
/* ------------------------------------------------------------------ */

function MobileRow({
  attribute,
  sources,
  index,
}: {
  attribute: ProductAttribute;
  sources: Sources;
  index: number;
}) {
  const conflict = attribute.verification === "CONFLICT";
  const [open, setOpen] = useState(conflict);
  const base = 0.12 + index * 0.1;
  const pct = Math.round(Math.min(1, Math.max(0, attribute.confidence)) * 100);
  const color = barColorFor(attribute);
  const mv = useMotionValue(0);
  const [label, setLabel] = useState("0%");
  useEffect(() => {
    const controls = animate(mv, pct, {
      duration: 0.9,
      delay: base + 0.25,
      ease: EASE,
      onUpdate: (v) => setLabel(formatPercent(Math.min(1, Math.max(0, v / 100)))),
    });
    return () => controls.stop();
  }, [mv, pct, base]);

  return (
    <motion.div
      className={`relative border-b border-[var(--uf-border-faint)] last:border-0 ${
        conflict ? "bg-[rgba(217,161,59,0.06)]" : ""
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: base, ease: EASE }}
    >
      {conflict && (
        <motion.span
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-[3px] bg-[var(--uf-warning)]"
          style={{ transformOrigin: "top" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.34, delay: base + 0.15, ease: EASE }}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="block w-full py-4 pl-5 pr-3 text-left"
      >
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-tight text-[var(--uf-text-primary)] [font-family:var(--uf-font-condensed)]">
              {attribute.label}
            </p>
            <p className="uf-mono mt-0.5 text-[8.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
              {attribute.key}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.1em] [font-family:var(--uf-font-condensed)]"
              style={{ color: STATE_META[attribute.verification].color }}
            >
              {STATE_META[attribute.verification].label}
            </span>
            <motion.span
              className="text-[var(--uf-text-tertiary)]"
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <ChevronRight className="size-4" aria-hidden />
            </motion.span>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="uf-mono text-[17px] font-medium leading-none text-[var(--uf-text-primary)]">
            {attribute.value}
            {attribute.unit ? (
              <span className="text-[11px] text-[var(--uf-text-tertiary)]"> {attribute.unit}</span>
            ) : null}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-[3px] w-20 bg-[var(--uf-border-faint)]" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <motion.span
                className="block h-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: base + 0.25, ease: EASE }}
              />
            </div>
            <span className="uf-mono uf-tnum text-[10px]" style={{ color }}>
              {label}
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="evidence"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: EASE }}
          >
            <div className="border-t border-[var(--uf-border-faint)] px-5 py-4">
              {conflict && (
                <div className="mb-3 space-y-1.5">
                  {sources.map((src, j) => (
                    <CompareLine
                      key={`${src.document}-${j}`}
                      src={src}
                      attribute={attribute}
                      sole={sources.length === 1}
                      base={0}
                      j={j}
                    />
                  ))}
                </div>
              )}
              <p className="uf-mono text-[8.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                Source traceability
              </p>
              <ul className="mt-2 space-y-2.5">
                {sources.map((src, j) => (
                  <li key={`${src.document}-${j}`} className="flex items-baseline gap-2.5">
                    <span
                      className="size-1.5 self-center"
                      style={{ background: toneFor(attribute, sources, src) }}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="uf-mono block text-[10.5px] leading-relaxed text-[var(--uf-text-secondary)]">
                        {src.document}
                      </span>
                      <span className="uf-mono block text-[8.5px] uppercase tracking-[0.08em] text-[var(--uf-text-tertiary)]">
                        {src.pageRef}
                      </span>
                    </span>
                    <span className="uf-mono ml-auto shrink-0 text-[11px] font-medium text-[var(--uf-text-secondary)]">
                      {src.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
