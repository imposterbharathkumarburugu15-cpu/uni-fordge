import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import {
  useConflicts,
  useProductDna,
  useProducts,
  useSuppliers,
} from "@/hooks/use-forge-store";
import { STAGES } from "@/utils/pipeline";
import { statusTone, type StatusTone } from "@/utils/status";
import { CommandBar } from "./CommandBar";
import { InspectionTable } from "./InspectionTable";
import { VerificationPipeline } from "./VerificationPipeline";

/**
 * PRODUCT DNA — mission control for product truth.
 * A single continuous workspace: command strip, editorial identity header,
 * live pipeline, technical record rail, the inspection table, and a slim
 * sticky command bar. No cards, no panels — typography, hairlines, data
 * and motion carry the hierarchy.
 */

const TONE_COLOR: Record<StatusTone, string> = {
  accent: "var(--uf-accent)",
  success: "var(--uf-success)",
  warning: "var(--uf-warning)",
  critical: "var(--uf-critical)",
  neutral: "var(--uf-text-tertiary)",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ProductDNA() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const conflicts = useConflicts();
  const withStructure = products.filter((p) => p.attributes.length > 0);
  const [selectedId, setSelectedId] = useState("PRD-0101");
  const selected = withStructure.find((p) => p.id === selectedId) ?? withStructure[0];
  const dna = useProductDna(selected?.id);
  const supplier = suppliers.find((s) => s.id === selected?.supplierId);
  const openConflicts = selected
    ? conflicts.filter((c) => c.productId === selected.id && c.status === "OPEN")
    : [];

  const activeIdx = selected ? STAGES.findIndex((s) => s.stage === selected.stage) : 0;
  const review = selected?.stage === "RESOLVE" && openConflicts.length > 0;

  let caption = "Flow — idle";
  let captionTone: "warning" | "success" | "accent" | "neutral" = "neutral";
  if (selected) {
    if (review) {
      caption = `Flow interrupted at resolve — ${openConflicts.length} conflict${
        openConflicts.length > 1 ? "s" : ""
      } require human review`;
      captionTone = "warning";
    } else if (selected.stage === "SHIP") {
      caption = "Flow complete — record ready for shipment";
      captionTone = "success";
    } else if (selected.stage === "PRODUCT_DNA") {
      caption = "Flow — product dna · canonical record";
      captionTone = "success";
    } else {
      caption = `Flow — ${STAGES[activeIdx].label.toLowerCase()} in progress`;
      captionTone = "accent";
    }
  }

  const evidenceCount = dna
    ? dna.attributes.reduce((acc, a) => acc + a.sources.length, 0)
    : 0;
  const verifiedRatio =
    dna && dna.totalCount > 0 ? dna.verifiedCount / dna.totalCount : 0;

  const stateLabel = openConflicts.length > 0
    ? "Requires review"
    : dna && dna.verifiedCount === dna.totalCount
      ? "Verified"
      : "In progress";
  const stateTone = openConflicts.length > 0
    ? "var(--uf-warning)"
    : dna && dna.verifiedCount === dna.totalCount
      ? "var(--uf-success)"
      : "var(--uf-accent)";

  return (
    <div className="relative -mx-4 -my-6 flex flex-col bg-[var(--uf-bg)] px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      {/* extremely subtle warm ambient wash — engineering glow, not decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{
          background:
            "radial-gradient(55% 90% at 50% 0%, rgba(196,147,66,0.05), transparent 70%)",
        }}
      />

      {/* command strip */}
      <div className="relative flex items-center justify-between gap-4 border-b border-[var(--uf-border-faint)] py-2">
        <span className="uf-mono text-[9px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
          Operations console <span className="text-[var(--uf-border-strong)]">/</span>{" "}
          <span className="text-[var(--uf-accent)]">Product DNA</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <motion.span
            aria-hidden
            className="size-1.5 bg-[var(--uf-accent)]"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="uf-mono text-[9px] uppercase tracking-[0.16em] text-[var(--uf-text-secondary)]">
            Live
          </span>
        </span>
      </div>

      {/* editorial identity header — no card */}
      {dna && selected && (
        <header
          key={`head-${selected.id}`}
          aria-label="Product identity"
          className="relative border-b border-[var(--uf-border-faint)]"
        >
          <div className="pt-8 pb-7">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <motion.h1
                className="uf-mono text-[34px] font-semibold leading-none tracking-tight text-[var(--uf-text-primary)] md:text-[42px]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: EASE }}
              >
                {dna.mpn}
              </motion.h1>
              <motion.p
                className="text-[22px] font-bold uppercase leading-none tracking-[0.1em] text-[var(--uf-text-secondary)] [font-family:var(--uf-font-condensed)] md:text-[28px]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.07, ease: EASE }}
              >
                {dna.name}
              </motion.p>
            </div>

            <motion.p
              className="uf-mono mt-3 text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.14, ease: EASE }}
            >
              {dna.category} <span className="text-[var(--uf-border-strong)]">·</span>{" "}
              {supplier?.name ?? "—"} <span className="text-[var(--uf-border-strong)]">·</span>{" "}
              rev {String(dna.revision).padStart(2, "0")}
            </motion.p>

            {/* independent information blocks, separated by vertical rules */}
            <motion.div
              className="mt-6 flex flex-wrap items-stretch gap-x-8 gap-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.24, ease: EASE }}
            >
              <Metric
                value={
                  <>
                    <CountUp to={dna.verifiedCount} delay={0.5} />/{dna.totalCount}
                  </>
                }
                label="Verified"
                tone={stateTone}
              />
              <Rule />
              <Metric
                value={<CountUp to={Math.round(dna.confidence * 1000) / 10} decimals={1} suffix="%" delay={0.55} />}
                label="Confidence"
                tone="var(--uf-accent)"
              />
              <Rule />
              <Metric
                value={<CountUp to={evidenceCount} delay={0.6} />}
                label="Evidence checks"
              />
              <Rule />
              <Metric value={stateLabel} label="Record state" tone={stateTone} />
            </motion.div>
          </div>

          {/* animated verification line — green span tracks verified ratio */}
          <div className="relative h-px bg-[var(--uf-border-faint)]">
            <motion.span
              aria-hidden
              className="absolute left-0 -top-px h-[2px] bg-[var(--uf-success)]"
              style={{ width: `${verifiedRatio * 100}%`, transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
            />
          </div>
        </header>
      )}

      {/* live pipeline */}
      {selected && (
        <div key={`pipe-${selected.id}`}>
          <VerificationPipeline
            activeIdx={activeIdx}
            review={review}
            caption={caption}
            captionTone={captionTone}
          />
        </div>
      )}

      {/* record rail — horizontal technical strip, no tabs */}
      <section
        aria-label="Canonical records"
        className="relative flex items-center overflow-x-auto border-b border-[var(--uf-border-faint)] py-2 scrollbar-none"
      >
        <span className="uf-mono shrink-0 pr-5 text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
          Records
        </span>
        {withStructure.map((p, idx) => {
          const active = p.id === selected?.id;
          const verified = p.attributes.filter((a) => a.verification === "VERIFIED").length;
          const total = p.attributes.length;
          const dot = TONE_COLOR[statusTone(p.status)];
          return (
            <span key={p.id} className="flex shrink-0 items-center">
              {idx > 0 && (
                <span aria-hidden className="h-4 w-px bg-[var(--uf-border-faint)]" />
              )}
              <button
                type="button"
                onClick={() => setSelectedId(p.id)}
                aria-pressed={active}
                className={`relative flex items-center gap-2.5 px-5 py-1.5 transition-opacity ${
                  active ? "" : "opacity-60 hover:opacity-100"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0" style={{ background: dot }} aria-hidden />
                <span
                  className={`uf-mono text-[11px] font-medium ${
                    active ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-secondary)]"
                  }`}
                >
                  {p.mpn}
                </span>
                <span className="hidden text-[12px] text-[var(--uf-text-secondary)] lg:inline">
                  {p.name}
                </span>
                <span
                  className={`uf-mono text-[9px] ${
                    active ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-tertiary)]"
                  }`}
                >
                  {verified}/{total}
                </span>
                {active && (
                  <motion.span
                    layoutId="record-active-line"
                    aria-hidden
                    className="absolute inset-x-4 bottom-0 h-[2px] bg-[var(--uf-accent)]"
                    transition={{ duration: 0.32, ease: EASE }}
                  />
                )}
              </button>
            </span>
          );
        })}
      </section>

      {/* inspection record */}
      {dna && <InspectionTable attributes={dna.attributes} />}

      {/* slim engineering command bar */}
      {dna && <CommandBar dna={dna} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CountUp({
  to,
  decimals = 0,
  suffix = "",
  delay = 0.5,
  duration = 0.9,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
  duration?: number;
}) {
  const mv = useMotionValue(0);
  const [val, setVal] = useState(decimals > 0 ? "0.0" : "0");
  useEffect(() => {
    const controls = animate(mv, to, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => setVal(decimals > 0 ? v.toFixed(decimals) : String(Math.round(v))),
    });
    return () => controls.stop();
  }, [mv, to, decimals, duration, delay]);
  return (
    <>
      {val}
      {suffix}
    </>
  );
}

function Metric({ value, label, tone }: { value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="uf-mono text-[15px] font-medium leading-none"
        style={tone ? { color: tone } : { color: "var(--uf-text-primary)" }}
      >
        {value}
      </span>
      <span className="uf-mono text-[8px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
        {label}
      </span>
    </div>
  );
}

function Rule() {
  return <span aria-hidden className="w-px self-stretch bg-[var(--uf-border-faint)]" />;
}
