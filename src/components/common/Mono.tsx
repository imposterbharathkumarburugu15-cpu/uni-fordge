import type { ReactNode } from "react";
import { formatTimestamp } from "@/utils/format";

/** Monospace token for technical identifiers. */
export function Mono({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`uf-mono text-[12px] tracking-tight ${className}`}>
      {children}
    </span>
  );
}

/** MPN badge — monospace, small caps feel. */
export function Mpn({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span className={`uf-mono text-[12px] font-medium text-[var(--uf-text-primary)] ${className}`}>
      {value}
    </span>
  );
}

/** Full timestamp: 14:32:07Z · 2026-08-16 */
export function Timestamp({
  iso,
  className = "",
}: {
  iso: string;
  className?: string;
}) {
  return (
    <span className={`uf-mono text-[11px] text-[var(--uf-text-tertiary)] ${className}`}>
      {formatTimestamp(iso)}
    </span>
  );
}

/** Filename token. */
export function Filename({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={`uf-mono text-[12px] text-[var(--uf-text-secondary)] ${className}`}>
      {value}
    </span>
  );
}
