import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Download,
  Loader,
  Scale,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useConflicts } from "@/hooks/use-forge-store";
import type { ProductDna } from "@/types/domain";

/**
 * The slim sticky command bar — an engineering console strip, not a card.
 * Left: record state. Right: REVIEW CONFLICT (amber) and EXPORT DNA.
 * Actions animate with a horizontal sweep before handing off.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CommandBarProps {
  dna: ProductDna;
}

export function CommandBar({ dna }: CommandBarProps) {
  const navigate = useNavigate();
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

  const openConflicts = conflicts.filter(
    (c) => c.productId === dna.productId && c.status === "OPEN",
  );

  const exportDna = () => {
    const payload = {
      schema: "uniforge.product-dna.v1",
      exportedAt: new Date().toISOString(),
      productId: dna.productId,
      mpn: dna.mpn,
      name: dna.name,
      category: dna.category,
      verified: `${dna.verifiedCount}/${dna.totalCount}`,
      confidence: dna.confidence,
      revision: dna.revision,
      attributes: dna.attributes.map((a) => ({
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
    a.download = `dna_${dna.mpn.replace(/[^A-Za-z0-9-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`DNA export downloaded — ${dna.mpn}`);
  };

  const handleExport = () => {
    if (leaving) return;
    exportDna();
    setExported(true);
    timers.current.push(window.setTimeout(() => setExported(false), 2000));
  };

  const handleReview = () => {
    if (!openConflicts[0] || leaving) return;
    setLeaving(true);
    timers.current.push(
      window.setTimeout(() => navigate(`/resolve?conflict=${openConflicts[0].id}`), 380),
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.22 + dna.attributes.length * 0.1, ease: EASE }}
      className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-[var(--uf-border)] bg-[var(--uf-bg)] px-4 py-3 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
      aria-label="Record commands"
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

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
        <div className="flex items-center gap-3">
          {openConflicts.length > 0 ? (
            <>
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0.45, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex"
              >
                <AlertTriangle className="size-4 text-[var(--uf-warning)]" />
              </motion.span>
              <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-warning)]">
                {openConflicts.length} open conflict{openConflicts.length > 1 ? "s" : ""} — record
                not canonical
              </span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5" style={{ background: "var(--uf-success)" }} aria-hidden />
              <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-success)]">
                Fully verified — no open conflicts
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-x-6">
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
              exported
                ? "text-[var(--uf-success)]"
                : "text-[var(--uf-accent)] hover:text-[var(--uf-accent-bright)]"
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
  );
}
