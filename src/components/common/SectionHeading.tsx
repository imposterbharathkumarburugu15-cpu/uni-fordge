import type { ReactNode } from "react";

interface SectionHeadingProps {
  index: string;
  title: string;
  meta?: ReactNode;
  className?: string;
}

export function SectionHeading({
  index,
  title,
  meta,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <h2 className="uf-section-title">
        <span className="idx">{index}</span>
        {title}
      </h2>
      {meta ? <div className="flex items-center gap-3">{meta}</div> : null}
    </div>
  );
}
