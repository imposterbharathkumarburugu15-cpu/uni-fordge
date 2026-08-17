import { motion } from "framer-motion";
import { STAGES } from "@/utils/pipeline";

/**
 * The pipeline — INTAKE ─ FORGE ─ PROVE ─ RESOLVE ─ PRODUCT DNA ─ SHIP.
 * A luminous cyan signal travels the completed span continuously; completed
 * stages fill green progressively; the active stage carries a cyan underline,
 * a soft glow, a moving scan and a pulsing marker. RESOLVE gains an amber
 * review signal when the record has open conflicts.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TONE: Record<"warning" | "success" | "accent" | "neutral", string> = {
  warning: "var(--uf-warning)",
  success: "var(--uf-success)",
  accent: "var(--uf-accent)",
  neutral: "var(--uf-text-tertiary)",
};

interface PipelineProps {
  /** Index of the record's current stage within STAGES. */
  activeIdx: number;
  /** RESOLVE stage carries an open conflict. */
  review: boolean;
  caption: string;
  captionTone: "warning" | "success" | "accent" | "neutral";
}

export function VerificationPipeline({ activeIdx, review, caption, captionTone }: PipelineProps) {
  const n = STAGES.length;
  const endFrac = (activeIdx + 0.5) / n;
  const passedFrac = activeIdx / n;
  const captionColor = TONE[captionTone];

  return (
    <section
      aria-label="Pipeline"
      className="overflow-x-auto border-b border-[var(--uf-border-faint)] py-5 scrollbar-none"
    >
      <div className="relative grid min-w-[620px] grid-cols-6">
        {/* base track */}
        <span aria-hidden className="absolute left-0 right-0 top-[21px] h-px bg-[var(--uf-border-faint)]" />

        {/* completed flow — fills green progressively */}
        {passedFrac > 0 && (
          <motion.span
            aria-hidden
            className="absolute left-0 top-[20px] h-[3px] bg-[var(--uf-success)]"
            style={{ width: `${passedFrac * 100}%`, transformOrigin: "left" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          />
        )}

        {/* luminous traveling signal — loops up to the active stage */}
        <motion.span
          aria-hidden
          className="absolute top-[17px] z-10 h-[9px] w-[3px] bg-[var(--uf-accent)]"
          style={{ boxShadow: "0 0 8px rgba(55,199,234,0.65)" }}
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: [`0%`, `${endFrac * 100}%`], opacity: [0, 1, 0] }}
          transition={{
            duration: 2.4,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut",
          }}
        />

        {STAGES.map((s, i) => {
          const passed = i < activeIdx;
          const active = i === activeIdx;
          const isReview = active && review;
          const pending = !passed && !active;
          const color = active
            ? "var(--uf-accent)"
            : passed
              ? "var(--uf-success)"
              : "var(--uf-text-tertiary)";
          return (
            <div key={s.stage} className="relative flex flex-col items-center gap-2">
              {/* label with active underline */}
              <span
                className="relative whitespace-nowrap text-[10px] font-semibold uppercase leading-none tracking-[0.14em] [font-family:var(--uf-font-condensed)]"
                style={{ color }}
              >
                {s.label}
                {active && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1.5 h-[2px] bg-[var(--uf-accent)]"
                    style={{ transformOrigin: "left", boxShadow: "0 0 8px rgba(55,199,234,0.5)" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1, opacity: [0.7, 1, 0.7] }}
                    transition={{
                      scaleX: { duration: 0.4, ease: EASE },
                      opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                )}
              </span>

              {/* marker */}
              <span className="relative mt-1 flex size-2 items-center justify-center">
                {active && (
                  <>
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 border border-[var(--uf-accent)]"
                      style={{ boxShadow: "0 0 12px rgba(55,199,234,0.4)" }}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                    <span
                      aria-hidden
                      className="size-2 bg-[var(--uf-accent)]"
                      style={{ boxShadow: "0 0 10px rgba(55,199,234,0.55)" }}
                    />
                  </>
                )}
                {passed && <span aria-hidden className="size-2 bg-[var(--uf-success)]" />}
                {pending && (
                  <span aria-hidden className="size-2 border border-[var(--uf-border-strong)]" />
                )}
                {isReview && (
                  <motion.span
                    aria-hidden
                    className="absolute -right-3 -top-1 size-1.5 bg-[var(--uf-warning)]"
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </span>

              {/* moving scan across the active stage */}
              {active && (
                <motion.span
                  aria-hidden
                  className="absolute top-[2px] h-px w-7 bg-[var(--uf-accent)]"
                  style={{ opacity: 0.5 }}
                  initial={{ left: "-12%" }}
                  animate={{ left: ["-12%", "100%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {isReview && (
                <span className="uf-mono text-[8px] uppercase leading-none tracking-[0.1em] text-[var(--uf-warning)]">
                  Review
                </span>
              )}
              {active && !isReview && (
                <span className="uf-mono text-[8px] uppercase leading-none tracking-[0.1em] text-[var(--uf-accent)]">
                  Live
                </span>
              )}
              {!active && <span aria-hidden className="h-[10px]" />}
            </div>
          );
        })}
      </div>

      <p
        className="mt-3 flex items-center gap-2 text-[9.5px] uppercase tracking-[0.12em]"
        style={{ color: captionColor }}
      >
        <span className="size-1" style={{ background: captionColor }} aria-hidden />
        <span className="uf-mono">{caption}</span>
      </p>
    </section>
  );
}
