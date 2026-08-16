import { motion } from "framer-motion";
import { useProducts, useSystemStatus } from "@/hooks/use-forge-store";
import { formatNumber } from "@/utils/format";
import { productConfidence } from "@/utils/pipeline";

/** Pipeline intelligence — throughput metrics and data-quality bars. */
export function Intelligence() {
  const system = useSystemStatus();
  const products = useProducts();
  const { cohort } = system;

  const verifyRatio = cohort.processed > 0 ? cohort.verified / cohort.processed : 0;
  const blockedRatio = cohort.total > 0 ? cohort.blocked / cohort.total : 0;
  const reviewRatio = cohort.total > 0 ? cohort.review / cohort.total : 0;

  const avgConfidence = avgConfidenceOf(products);

  const metrics = [
    { label: "PRODUCTS", value: formatNumber(cohort.total), tone: "var(--uf-text-primary)" },
    { label: "PROCESSED", value: formatNumber(cohort.processed), tone: "var(--uf-text-primary)" },
    { label: "VERIFIED", value: formatNumber(cohort.verified), tone: "var(--uf-success)" },
    { label: "REVIEW", value: formatNumber(cohort.review), tone: "var(--uf-warning)" },
    { label: "BLOCKED", value: formatNumber(cohort.blocked), tone: "var(--uf-critical)" },
    { label: "THROUGHPUT", value: "32/hr", tone: "var(--uf-accent)" },
    { label: "AVG CONFIDENCE", value: `${(avgConfidence * 100).toFixed(1)}%`, tone: "var(--uf-accent)" },
  ];

  const qualityBars = [
    {
      label: "VERIFICATION RATE",
      value: verifyRatio,
      display: `${(verifyRatio * 100).toFixed(1)}%`,
      tone: "var(--uf-success)",
      note: `${formatNumber(cohort.verified)} of ${formatNumber(cohort.processed)} processed`,
    },
    {
      label: "ATTRIBUTE CONFIDENCE",
      value: avgConfidence,
      display: `${(avgConfidence * 100).toFixed(1)}%`,
      tone: "var(--uf-accent)",
      note: "Mean across active product records",
    },
    {
      label: "AWAITING REVIEW",
      value: reviewRatio,
      display: `${formatNumber(cohort.review)} products`,
      tone: "var(--uf-warning)",
      note: `${(reviewRatio * 100).toFixed(1)}% of catalogue`,
    },
    {
      label: "BLOCKED",
      value: blockedRatio,
      display: `${formatNumber(cohort.blocked)} products`,
      tone: "var(--uf-critical)",
      note: `${(blockedRatio * 100).toFixed(1)}% of catalogue`,
    },
  ];

  return (
    <section aria-label="Pipeline intelligence" className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="uf-panel overflow-hidden">
        <div className="uf-panel-head">
          <h2 className="uf-section-title">
            <span className="idx">04</span>
            Pipeline Intelligence
          </h2>
          <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            {cohort.source}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[var(--uf-border-faint)] sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-[var(--uf-surface)] p-4">
              <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                {m.label}
              </p>
              <p className="uf-mono mt-1.5 text-[22px] font-semibold uf-tnum" style={{ color: m.tone }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="uf-panel overflow-hidden">
        <div className="uf-panel-head">
          <h2 className="uf-section-title">
            <span className="idx">05</span>
            Data Quality
          </h2>
        </div>
        <div className="space-y-4 p-4">
          {qualityBars.map((bar, i) => (
            <div key={bar.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                  {bar.label}
                </span>
                <span className="uf-mono text-[11.5px] font-medium" style={{ color: bar.tone }}>
                  {bar.display}
                </span>
              </div>
              <div className="uf-progress" role="meter" aria-label={bar.label}>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(bar.value * 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: bar.tone }}
                />
              </div>
              <p className="mt-1 text-[10.5px] text-[var(--uf-text-tertiary)]">{bar.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function avgConfidenceOf(products: ReturnType<typeof useProducts>): number {
  const withAttrs = products.filter((p) => p.attributes.length > 0);
  if (withAttrs.length === 0) return 0;
  const sum = withAttrs.reduce((acc, p) => acc + productConfidence(p), 0);
  return sum / withAttrs.length;
}
