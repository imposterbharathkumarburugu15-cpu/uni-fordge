import { ArrowRight } from "lucide-react";

const STEPS = ["SUPPLIER DATA", "NORMALIZATION", "ENRICHMENT", "VERIFIED", "PRODUCT TRUTH"];
const BADGES = ["STRUCTURE", "TRACKABLE", "VERIFIED"];

export function Ticker() {
  return (
    <section
      id="process"
      className="border-b border-[var(--uf-border)] bg-[var(--uf-bg)]"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-2 gap-y-2 px-5 py-4">
        {STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span
              className={`uf-mono text-[11px] uppercase tracking-[0.16em] ${
                i === STEPS.length - 1
                  ? "text-[var(--uf-success)]"
                  : "text-[var(--uf-text-secondary)]"
              }`}
            >
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <ArrowRight className="size-3.5 text-[var(--uf-accent-line)]" aria-hidden />
            )}
          </span>
        ))}
        <span className="ml-auto hidden items-center gap-4 sm:flex">
          {BADGES.map((b) => (
            <span
              key={b}
              className="uf-mono rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]"
            >
              {b}
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}
