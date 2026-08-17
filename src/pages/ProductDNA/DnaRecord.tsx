import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Download,
  Loader,
  Minus,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useConflicts, useProductDna } from "@/hooks/use-forge-store";
import type { ProductAttribute, ProductDna, VerificationStatus } from "@/types/domain";
import { formatPercent } from "@/utils/format";

interface DnaRecordProps {
  productId: string;
}

/**
 * The living engineering record.
 * Not a table — each attribute is a full-width band on the workspace that
 * comes alive on load: the value appears first, the confidence bar draws in
 * with a live count, sources reveal sequentially, and the verification state
 * activates. Clicking a band expands its evidence inline with a smooth
 * vertical transition. Conflicts converge three evidence signals onto the
 * attribute and interrupt with a restrained amber/brown treatment.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

const STATE_NOTE: Record<VerificationStatus, string> = {
  VERIFIED: "Canonical",
  CONFLICT: "Requires human review",
  PROCESSING: "In flight",
  UNVERIFIED: "Not yet verified",
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

export function DnaRecord({ productId }: DnaRecordProps) {
  const navigate = useNavigate();
  const dna = useProductDna(productId);
  const conflicts = useConflicts();
  const [exported, setExported] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

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

  const handleExport = () => {
    if (leaving) return;
    exportDna(dna);
    setExported(true);
    timers.current.push(window.setTimeout(() => setExported(false), 2000));
  };

  const handleReview = () => {
    if (!openConflicts[0] || leaving) return;
    setLeaving(true);
    timers.current.push(
      window.setTimeout(
        () => navigate(`/resolve?conflict=${openConflicts[0].id}`),
        380,
      ),
    );
  };

  return (
    <div>
      {/* record stream label */}
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--uf-border-strong)] py-2">
        <span className="uf-mono text-[9px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
          Engineering record
        </span>
        <span className="uf-mono text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          rev {String(dna.revision).padStart(2, "0")} · {dna.verifiedCount}/{dna.totalCount} verified ·{" "}
          {dna.totalCount} attributes
        </span>
      </div>

      {/* the living record — one band per attribute */}
      {dna.attributes.map(({ attribute, sources }, i) => (
        <Band key={attribute.key} attribute={attribute} sources={sources} index={i} />
      ))}

      {/* footer — record state + flat actions with transition sweeps */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.32, delay: 0.18 + dna.attributes.length * 0.09, ease: EASE }}
        className="relative border-t border-[var(--uf-border-faint)] py-4"
      >
        <AnimatePresence>
          {leaving && (
            <motion.span
              key="sweep-leave"
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] bg-[var(--uf-warning)]"
              style={{ transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.36, ease: EASE }}
            />
          )}
          {exported && !leaving && (
            <motion.span
              key="sweep-export"
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] bg-[var(--uf-success)]"
              style={{ transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            {openConflicts.length > 0 ? (
              <span className="flex items-center gap-2 text-[11.5px] font-medium text-[var(--uf-warning)]">
                <AlertTriangle className="size-3.5" aria-hidden />
                {openConflicts.length} open conflict{openConflicts.length > 1 ? "s" : ""} — record
                not canonical
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[11.5px] font-medium text-[var(--uf-success)]">
                <span
                  className="h-1.5 w-1.5"
                  style={{ background: "var(--uf-success)" }}
                  aria-hidden
                />
                Fully verified — no open conflicts
              </span>
            )}
            <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              confidence {formatPercent(dna.confidence)}
            </span>
          </div>
          <div className="flex items-center gap-x-5">
            {openConflicts[0] && (
              <button
                type="button"
                onClick={handleReview}
                disabled={leaving}
                className="uf-mono inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-[var(--uf-warning)] underline-offset-4 transition-colors hover:text-[var(--uf-accent-bright)] hover:underline disabled:opacity-70"
              >
                {leaving ? (
                  <>
                    <Loader className="size-3.5 animate-spin" aria-hidden />
                    Opening review…
                  </>
                ) : (
                  <>
                    <Scale className="size-3.5" aria-hidden />
                    Review conflict
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={leaving}
              className={`uf-mono inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] underline-offset-4 transition-colors hover:underline disabled:opacity-70 ${
                exported ? "text-[var(--uf-success)]" : "text-[var(--uf-accent)] hover:text-[var(--uf-accent-bright)]"
              }`}
            >
              {exported ? (
                <motion.span
                  className="inline-flex items-center gap-1.5"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                >
                  <Check className="size-3.5" aria-hidden />
                  DNA exported
                </motion.span>
              ) : (
                <>
                  <Download className="size-3.5" aria-hidden />
                  Export DNA
                </>
              )}
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function Band({
  attribute,
  sources,
  index,
}: {
  attribute: ProductAttribute;
  sources: ProductDna["attributes"][number]["sources"];
  index: number;
}) {
  const state = STATE_META[attribute.verification];
  const conflict = attribute.verification === "CONFLICT";
  const [open, setOpen] = useState(conflict);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const pct = Math.round(Math.min(1, Math.max(0, attribute.confidence)) * 100);
  const barColor = conflict
    ? "var(--uf-warning)"
    : attribute.verification === "VERIFIED"
      ? "var(--uf-success)"
      : attribute.verification === "PROCESSING"
        ? "var(--uf-accent)"
        : "var(--uf-text-tertiary)";

  const base = 0.08 + index * 0.09;

  /* live confidence count-up — draws in as the bar fills */
  const count = useMotionValue(0);
  const [label, setLabel] = useState("0%");
  useEffect(() => {
    const controls = animate(count, pct, {
      duration: 0.55,
      delay: base + 0.18,
      ease: "easeOut",
      onUpdate: (v) => setLabel(formatPercent(Math.min(1, Math.max(0, v / 100)))),
    });
    return () => controls.stop();
  }, [count, pct, base]);

  const toneFor = (src: ProductDna["attributes"][number]["sources"][number]) =>
    sources.length === 1
      ? "var(--uf-accent)"
      : agreesWith(attribute, src.value)
        ? "var(--uf-success)"
        : "var(--uf-warning)";

  const agreeCount = sources.filter(
    (s) => sources.length === 1 || agreesWith(attribute, s.value),
  ).length;
  const disagreeCount = sources.length - agreeCount;

  return (
    <motion.div
      className={`border-b border-[var(--uf-border-faint)] last:border-0 ${
        conflict ? "bg-[rgba(217,161,59,0.05)]" : ""
      }`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: base, ease: EASE }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="block w-full text-left"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-1 py-5">
          {/* state rail — vertical signal line */}
          <motion.span
            aria-hidden
            className="hidden h-14 w-[3px] shrink-0 md:block"
            style={{ background: barColor, transformOrigin: "top" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: base + 0.1, ease: EASE }}
          />

          {/* attribute */}
          <div className="w-52 shrink-0 md:w-56">
            <p className="text-[15px] font-semibold tracking-tight text-[var(--uf-text-primary)] [font-family:var(--uf-font-condensed)]">
              {attribute.label}
            </p>
            <p className="uf-mono mt-0.5 text-[9px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
              {attribute.key}
            </p>
          </div>

          {/* value — appears first, then converging conflict signals */}
          <div className="min-w-[240px] flex-1">
            <div className="flex items-center gap-3">
              <motion.p
                className="uf-mono text-[19px] font-medium leading-none tracking-tight text-[var(--uf-text-primary)]"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: base + 0.05, ease: EASE }}
              >
                {attribute.value}
                {attribute.unit ? (
                  <span className="text-[12px] text-[var(--uf-text-tertiary)]">
                    {" "}
                    {attribute.unit}
                  </span>
                ) : null}
              </motion.p>
              {conflict &&
                sources.map((s, i) => (
                  <motion.span
                    key={`sig-${i}`}
                    aria-hidden
                    className="size-1.5"
                    style={{ background: toneFor(s) }}
                    initial={{ x: 120, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.45, delay: base + 0.4 + i * 0.12, ease: EASE }}
                  />
                ))}
            </div>
            <motion.p
              className="uf-mono mt-2 flex flex-wrap items-center gap-x-2 text-[9.5px] uppercase tracking-[0.1em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: base + 0.28, ease: EASE }}
            >
              {conflict ? (
                <>
                  <span className="text-[var(--uf-text-tertiary)]">
                    {sources.length} SOURCES
                  </span>
                  <ChevronRight className="size-3 text-[var(--uf-border-strong)]" aria-hidden />
                  <motion.span
                    className="text-[var(--uf-warning)]"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: base + 0.8,
                    }}
                  >
                    CONFLICT DETECTED
                  </motion.span>
                  <ChevronRight className="size-3 text-[var(--uf-border-strong)]" aria-hidden />
                  <span className="text-[var(--uf-warning)]">HUMAN REVIEW</span>
                </>
              ) : (
                <span className="text-[var(--uf-text-tertiary)]">
                  {sources.length} SOURCE{sources.length !== 1 ? "S" : ""}
                  {sources.length > 1 && (
                    <span className="text-[var(--uf-text-secondary)]">
                      {" "}
                      · {agreeCount} AGREE
                    </span>
                  )}
                  {disagreeCount > 0 && (
                    <span className="text-[var(--uf-warning)]">
                      {" "}
                      · {disagreeCount} DISAGREE
                    </span>
                  )}
                </span>
              )}
            </motion.p>
          </div>

          {/* confidence — thin technical bar that draws in live */}
          <div className="w-36 shrink-0">
            <div
              className="h-[3px] w-24 bg-[var(--uf-border-faint)]"
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
                transition={{ duration: 0.55, delay: base + 0.18, ease: EASE }}
              />
            </div>
            <motion.span
              className="uf-mono uf-tnum mt-1.5 block text-[10.5px]"
              style={{ color: barColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: base + 0.24, ease: EASE }}
            >
              {label}
            </motion.span>
          </div>

          {/* state — activates last */}
          <div className="w-36 shrink-0">
            <motion.span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] [font-family:var(--uf-font-condensed)]"
              style={{ color: state.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: base + 0.38, ease: EASE }}
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
                          scale: { type: "spring", stiffness: 420, damping: 22, delay: base + 0.38 },
                          opacity: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                        }
                      : {
                          scale: { type: "spring", stiffness: 420, damping: 22, delay: base + 0.38 },
                          opacity: { duration: 0.25, delay: base + 0.38, ease: EASE },
                        }
                  }
                >
                  <state.Icon className="size-3" aria-hidden />
                </motion.span>
              )}
              {state.label}
            </motion.span>
            <motion.p
              className="uf-mono mt-1 text-[8.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: base + 0.46, ease: EASE }}
            >
              {STATE_NOTE[attribute.verification]}
            </motion.p>
          </div>

          {/* expand affordance */}
          <motion.span
            className="ml-auto shrink-0 text-[var(--uf-text-tertiary)]"
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <ChevronRight className="size-4" aria-hidden />
          </motion.span>
        </div>
      </button>

      {/* inline evidence — expands with a smooth vertical transition */}
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
            <motion.div
              className="border-t border-[var(--uf-border-faint)] py-4 pl-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06, ease: EASE }}
            >
              <p className="uf-mono text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                Evidence trace — {sources.length} source{sources.length !== 1 ? "s" : ""}
              </p>
              {sources.length > 0 ? (
                <ul className="mt-2">
                  {sources.map((src, i) => {
                    const tone = toneFor(src);
                    const dissent = sources.length > 1 && !agreesWith(attribute, src.value);
                    const hot = hovered === i || pinned === i;
                    return (
                      <li
                        key={`${src.document}-${i}`}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setPinned(pinned === i ? null : i)}
                        className="grid cursor-default grid-cols-[14px_1fr_auto] items-baseline gap-x-3 border-b border-[var(--uf-border-faint)] py-2.5 last:border-0 md:grid-cols-[14px_minmax(220px,1.4fr)_minmax(160px,1fr)_auto]"
                      >
                        <span className="flex items-center justify-start">
                          {dissent ? (
                            <motion.span
                              className="size-1.5"
                              style={{ background: tone }}
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                              aria-hidden
                            />
                          ) : (
                            <span className="size-1.5" style={{ background: tone }} aria-hidden />
                          )}
                        </span>
                        <span
                          className={`uf-mono min-w-0 text-[10.5px] leading-relaxed transition-colors ${
                            hot ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-secondary)]"
                          }`}
                        >
                          {src.document}
                          <span className="text-[var(--uf-text-tertiary)]"> · {src.pageRef}</span>
                        </span>
                        <span
                          className={`uf-mono hidden text-[11px] font-medium transition-colors md:inline ${
                            hot ? "text-[var(--uf-text-primary)]" : "text-[var(--uf-text-secondary)]"
                          }`}
                        >
                          {src.value}
                        </span>
                        <span className="flex items-baseline gap-3">
                          <span className="uf-mono uf-tnum hidden text-[9.5px] text-[var(--uf-text-tertiary)] md:inline">
                            {formatPercent(src.confidence)}
                          </span>
                          <span
                            className="uf-mono text-[8px] uppercase tracking-[0.08em]"
                            style={{ color: tone }}
                          >
                            {sources.length === 1
                              ? "Sole source"
                              : agreesWith(attribute, src.value)
                                ? "Agrees"
                                : "Disagrees"}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="uf-mono mt-2 text-[9.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
                  No sources captured
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
