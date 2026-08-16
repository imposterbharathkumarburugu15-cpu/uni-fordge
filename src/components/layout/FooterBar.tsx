import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSystemStatus } from "@/hooks/use-forge-store";

function useUtcClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toISOString().slice(11, 19);
}

/**
 * Persistent operational footer: the active cohort's throughput figures
 * (Stitch reference: supplier_catalogue.xlsx · 1,000 PRODUCTS · … · 45 BLOCKED).
 */
export function FooterBar() {
  const system = useSystemStatus();
  const navigate = useNavigate();
  const clock = useUtcClock();
  const { cohort } = system;

  const items: Array<{ label: string; value: string | number; path?: string; tone?: string }> = [
    { label: "SOURCE", value: cohort.source, tone: "var(--uf-text-secondary)" },
    { label: "PRODUCTS", value: cohort.total.toLocaleString() },
    { label: "PROCESSED", value: cohort.processed.toLocaleString() },
    { label: "VERIFIED", value: cohort.verified.toLocaleString(), tone: "var(--uf-success)" },
    { label: "REVIEW", value: cohort.review.toLocaleString(), path: "/resolve", tone: "var(--uf-warning)" },
    { label: "BLOCKED", value: cohort.blocked.toLocaleString(), path: "/intake", tone: "var(--uf-critical)" },
  ];

  return (
    <footer className="mt-8 border-t border-[var(--uf-border)] bg-[var(--uf-bg-deep)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 md:px-6 lg:px-8">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={!item.path}
            onClick={() => item.path && navigate(item.path)}
            className={`flex items-baseline gap-2 ${item.path ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
          >
            <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
              {item.label}
            </span>
            <span
              className="uf-mono text-[12px] font-medium text-[var(--uf-text-primary)]"
              style={item.tone ? { color: item.tone } : undefined}
            >
              {item.value}
            </span>
          </button>
        ))}
        <span className="ml-auto hidden items-center gap-2 md:inline-flex">
          <span className="uf-dot uf-dot-success uf-anim-pulse" aria-hidden />
          <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            UTC {clock} · {system.apiStatus}
          </span>
        </span>
      </div>
    </footer>
  );
}
