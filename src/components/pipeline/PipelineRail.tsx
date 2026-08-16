import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import type { PipelineStage } from "@/types/domain";
import { STAGES } from "@/utils/pipeline";

interface PipelineRailProps {
  counts: Record<PipelineStage, number>;
  activeStage?: PipelineStage | null;
  variant?: "hero" | "compact";
  requireReview?: boolean;
}

/**
 * The UNIFORGE pipeline: INTAKE → FORGE → PROVE → RESOLVE → PRODUCT DNA → SHIP.
 * Processing segments render cyan; the verified path (RESOLVE → SHIP) renders green.
 */
export function PipelineRail({
  counts,
  activeStage,
  variant = "hero",
  requireReview = false,
}: PipelineRailProps) {
  const navigate = useNavigate();
  const compact = variant === "compact";

  return (
    <div
      className={compact ? "" : "uf-panel overflow-hidden"}
      aria-label="Product pipeline stages"
    >
      {!compact && (
        <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] px-4 py-2">
          <span className="uf-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
            SYSTEM / PIPELINE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="uf-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--uf-accent)]">
              ● PROCESSING
            </span>
            <span className="text-[var(--uf-text-tertiary)]">·</span>
            <span className="uf-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--uf-success)]">
              ● VERIFIED PATH
            </span>
          </span>
        </div>
      )}

      <div
        className={`flex items-stretch ${
          compact ? "gap-0" : "px-3 py-3"
        } overflow-x-auto`}
      >
        {STAGES.map((stage, i) => {
          const isLast = i === STAGES.length - 1;
          const verifiedPath = i >= 3; // RESOLVE → SHIP
          const active = activeStage === stage.stage;
          const count = counts[stage.stage] ?? 0;
          const isResolve = stage.stage === "RESOLVE";

          return (
            <div key={stage.stage} className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                onClick={() => navigate(stage.path)}
                className={`group relative flex flex-1 flex-col items-center gap-1 rounded-sm px-2 py-2 text-center transition-colors hover:bg-[var(--uf-accent-dim)] focus-visible:outline-2 focus-visible:outline-[var(--uf-accent)] ${
                  compact ? "min-w-[104px]" : "min-w-[120px]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`uf-mono text-lg font-semibold uf-tnum transition-colors ${
                    compact ? "text-base" : ""
                  } ${active ? "text-[var(--uf-accent-bright)]" : "text-[var(--uf-text-primary)]"}`}
                >
                  {String(count).padStart(2, "0")}
                </span>
                <span
                  className={`flex items-center gap-1.5 font-semibold uppercase tracking-[0.08em] ${
                    compact ? "text-[9.5px]" : "text-[10.5px]"
                  } ${active ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-secondary)]"}`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isResolve && requireReview && !active
                        ? "uf-anim-pulse bg-[var(--uf-warning)]"
                        : verifiedPath
                          ? "bg-[var(--uf-success)]"
                          : "bg-[var(--uf-accent)]"
                    }`}
                    aria-hidden
                  />
                  {stage.label}
                </span>
                {isResolve && requireReview && (
                  <span
                    className="uf-mono mt-0.5 text-[9px] uppercase tracking-[0.1em] text-[var(--uf-warning)]"
                  >
                    Human review
                  </span>
                )}
                {!compact && (
                  <span className="mt-0.5 text-[10px] text-[var(--uf-text-tertiary)]">
                    {stage.description}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="pipeline-active"
                    className="absolute inset-x-2 -bottom-0.5 h-px bg-[var(--uf-accent)]"
                  />
                )}
              </button>

              {!isLast && (
                <div className="flex w-4 shrink-0 items-center md:w-6">
                  <span
                    className={`h-0.5 w-full rounded-full ${
                      verifiedPath
                        ? "bg-[var(--uf-success-line)]"
                        : "bg-[var(--uf-accent-line)]"
                    }`}
                    aria-hidden
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Small read-only stage marker used in page headers. */
export function StageBreadcrumb({ stage }: { stage: PipelineStage }) {
  const meta = STAGES.find((s) => s.stage === stage);
  if (!meta) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[var(--uf-text-tertiary)]">
      <ArrowRight className="size-3" aria-hidden />
      <span className="uf-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
        {meta.label}
      </span>
    </span>
  );
}
