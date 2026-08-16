interface LogoProps {
  className?: string;
  markClassName?: string;
}

/** UNIFORGE wordmark — the O is a geometric forge mark (two ingots + beam). */
export function Logo({ className = "", markClassName = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline gap-1 font-bold tracking-[0.08em] ${className}`}
      style={{ fontFamily: "var(--uf-font-condensed)" }}
    >
      UNIF
      <svg
        viewBox="0 0 22 18"
        className={`inline-block h-[0.82em] w-[1.05em] self-center ${markClassName}`}
        aria-hidden
      >
        <rect x="1" y="1" width="5.5" height="16" rx="1" fill="currentColor" />
        <rect x="15.5" y="1" width="5.5" height="16" rx="1" fill="currentColor" />
        <rect x="1" y="13" width="20" height="4" rx="1" fill="var(--uf-accent)" />
      </svg>
      RGE
    </span>
  );
}
