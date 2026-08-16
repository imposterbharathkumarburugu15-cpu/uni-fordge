import type { ReactNode } from "react";

interface PageHeaderProps {
  breadcrumb: string[];
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({
  breadcrumb,
  title,
  subtitle,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2">
        {breadcrumb.map((crumb, i) => (
          <span key={`${crumb}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[var(--uf-text-tertiary)]" aria-hidden>
                /
              </span>
            )}
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.16em] [font-family:var(--uf-font-condensed)] ${
                i === breadcrumb.length - 1
                  ? "text-[var(--uf-accent)]"
                  : "text-[var(--uf-text-tertiary)]"
              }`}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[var(--uf-text-primary)] md:text-[28px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-sm text-[var(--uf-text-secondary)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {meta ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-[var(--uf-border-faint)] pb-3">
          {meta}
        </div>
      ) : null}
    </header>
  );
}
