import { PipelineRail } from "@/components/pipeline/PipelineRail";
import { useOpenConflicts, useSystemStatus } from "@/hooks/use-forge-store";

export function PipelineOverview() {
  const system = useSystemStatus();
  const openConflicts = useOpenConflicts();

  return (
    <section aria-label="Pipeline overview">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="uf-section-title">
          <span className="idx">01</span>
          Pipeline Overview
        </h2>
        <span className="uf-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          Live · sync {new Date(system.lastSync).toISOString().slice(11, 19)}Z
        </span>
      </div>
      <PipelineRail
        counts={system.pipelineCounts}
        requireReview={openConflicts.length > 0}
        variant="hero"
      />
    </section>
  );
}
