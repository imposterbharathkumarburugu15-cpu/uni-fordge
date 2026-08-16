import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Check } from "lucide-react";

interface StageFlowProps {
  steps: string[];
  verified?: boolean;
  className?: string;
}

/**
 * The transformation narrative strip:
 *   RAW DATA → STRUCTURED → NORMALIZED → PRODUCT READY ✓
 * Mirrors the Stitch reference bottom workflow on the Command Center.
 */
export function StageFlow({ steps, verified = true, className = "" }: StageFlowProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={`${step}-${i}`} className="flex items-center gap-3">
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.3 }}
              className={`uf-mono text-[12px] ${
                isLast && verified
                  ? "font-semibold text-[var(--uf-success)]"
                  : "text-[var(--uf-text-secondary)]"
              }`}
            >
              {step}
            </motion.span>
            {!isLast ? (
              <span className="flex flex-col items-center">
                <ArrowRight
                  className="size-3.5 text-[var(--uf-accent-line)]"
                  aria-hidden
                />
                <ArrowDown
                  className="mt-0.5 size-2.5 text-[var(--uf-text-tertiary)]"
                  aria-hidden
                />
              </span>
            ) : (
              verified && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + steps.length * 0.12 }}
                  className="flex size-5 items-center justify-center rounded-full border"
                  style={{
                    color: "var(--uf-success)",
                    borderColor: "var(--uf-success-line)",
                    background: "var(--uf-success-dim)",
                  }}
                  aria-label="Verified"
                >
                  <Check className="size-3" />
                </motion.span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
