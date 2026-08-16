import { formatPercent } from "@/utils/format";

interface ConfidenceMeterProps {
  value: number; // 0-1
  showLabel?: boolean;
  size?: "sm" | "md";
}

function toneFor(value: number): string {
  if (value >= 0.9) return "var(--uf-success)";
  if (value >= 0.75) return "var(--uf-accent)";
  if (value >= 0.6) return "var(--uf-warning)";
  return "var(--uf-critical)";
}

export function ConfidenceMeter({
  value,
  showLabel = true,
  size = "md",
}: ConfidenceMeterProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Confidence ${formatPercent(value)}`}>
      <span
        className="uf-meter"
        style={{ width: size === "sm" ? 44 : 64 }}
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${pct}%`, background: toneFor(value) }} />
      </span>
      {showLabel && (
        <span
          className="uf-mono text-[11px] uf-tnum"
          style={{ color: toneFor(value) }}
        >
          {formatPercent(value)}
        </span>
      )}
    </span>
  );
}
