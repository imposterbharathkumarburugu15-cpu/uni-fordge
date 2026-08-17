import { motion } from "framer-motion";

/**
 * The live verification pipeline — the record's analysis flow.
 * INGEST → NORMALIZE → VERIFY → CONFLICT → CANONICALIZE → SHIP.
 *
 * A cyan signal travels the completed span continuously; completed stages
 * fill green progressively on load; a conflict interrupts the flow with an
 * amber warning segment and a pulsing amber node. Purely informational —
 * no cards, no boxes, just a technical process rail.
 */

export const VERIFY_STAGES = [
  "INGEST",
  "NORMALIZE",
  "VERIFY",
  "CONFLICT",
  "CANONICALIZE",
  "SHIP",
] as const;

export interface PipelineState {
  /** Number of fully completed stages (green). */
  passed: number;
  /** Stage index where the flow is interrupted by a conflict. */
  interruptAt: number | null;
  /** Stage index currently live (cyan), when no conflict. */
  activeAt: number | null;
  caption: string;
  captionTone: "warning" | "success" | "accent" | "neutral";
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TONE: Record<PipelineState["captionTone"], string> = {
  warning: "var(--uf-warning)",
  success: "var(--uf-success)",
  accent: "var(--uf-accent)",
  neutral: "var(--uf-text-tertiary)",
};

export function VerificationPipeline({ state }: { state: PipelineState }) {
  const { passed, interruptAt, activeAt, caption, captionTone } = state;
  const n = VERIFY_STAGES.length;
  const signalEnd =
    interruptAt != null ? (interruptAt + 0.5) / n : activeAt != null ? (activeAt + 0.5) / n : 1;
  const passedEnd = passed / n;
  const flowEnd = interruptAt != null ? signalEnd : null;
  const captionColor = TONE[captionTone];

  return (
    <section
      aria-label="Verification pipeline"
      className="border-b border-[var(--uf-border-faint)] py-4"
    >
      <div className="relative grid min-w-[680px] grid-cols-6 overflow-x-auto">
        {/* base track */}
        <span aria-hidden className="absolute left-0 right-0 top-[21px] h-px bg-[var(--uf-border-faint)]" />

        {/* completed flow — fills green progressively */}
        {passedEnd > 0 && (
          <motion.span
            aria-hidden
            className="absolute left-0 top-[20px] h-[3px] bg-[var(--uf-success)]"
            style={{ width: `${passedEnd * 100}%`, transformOrigin: "left" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          />
        )}

        {/* amber warning segment leading into the conflict node */}
        {flowEnd != null && (
          <motion.span
            aria-hidden
            className="absolute top-[20px] h-[3px] bg-[var(--uf-warning)]"
            style={{
              width: `${(flowEnd - passedEnd) * 100}%`,
              left: `${passedEnd * 100}%`,
              transformOrigin: "left",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
          />
        )}

        {/* cyan live segment toward the active stage */}
        {!interruptAt && activeAt != null && passedEnd < 1 && (
          <motion.span
            aria-hidden
            className="absolute top-[20px] h-[3px] bg-[var(--uf-accent)]"
            style={{
              width: `${(signalEnd - passedEnd) * 100}%`,
              left: `${passedEnd * 100}%`,
              transformOrigin: "left",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, delay: 0.5, ease: EASE }}
          />
        )}

        {/* traveling cyan signal — loops along the live span */}
        <motion.span
          aria-hidden
          className="absolute top-[17px] z-10 h-[9px] w-[3px] bg-[var(--uf-accent)]"
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: [`0%`, `${signalEnd * 100}%`], opacity: [0, 0.9, 0] }}
          transition={{
            duration: 2.6,
            times: [0, 0.55, 1],
            repeat: Infinity,
            repeatDelay: 0.45,
            ease: "easeInOut",
          }}
        />

        {VERIFY_STAGES.map((label, i) => {
          const isPassed = i < passed;
          const isInterrupt = interruptAt === i;
          const isActive = !interruptAt && activeAt === i;
          const pending = !isPassed && !isInterrupt && !isActive;
          const color = isInterrupt
            ? "var(--uf-warning)"
            : isActive
              ? "var(--uf-accent)"
              : isPassed
                ? "var(--uf-success)"
                : "var(--uf-text-tertiary)";
          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <span
                className="whitespace-nowrap text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] [font-family:var(--uf-font-condensed)]"
                style={{ color }}
              >
                {label}
              </span>
              <span className="relative flex size-2 items-center justify-center">
                {isInterrupt && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 border border-[var(--uf-warning)]"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: [1, 2.1], opacity: [0.7, 0] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                {isActive && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 border border-[var(--uf-accent)]"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span
                  aria-hidden
                  className={`size-2 ${pending ? "border border-[var(--uf-border-strong)]" : ""}`}
                  style={pending ? undefined : { background: color }}
                />
              </span>
              {isInterrupt && (
                <span className="uf-mono text-[8px] uppercase leading-none tracking-[0.1em] text-[var(--uf-warning)]">
                  Review
                </span>
              )}
              {isActive && (
                <span className="uf-mono text-[8px] uppercase leading-none tracking-[0.1em] text-[var(--uf-accent)]">
                  Live
                </span>
              )}
              {isPassed && <span className="h-[10px]" aria-hidden />}
              {pending && <span className="h-[10px]" aria-hidden />}
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
