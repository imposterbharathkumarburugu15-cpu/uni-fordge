import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteProps {
  onRequestDemo: () => void;
}

export function Quote({ onRequestDemo }: QuoteProps) {
  return (
    <section className="uf-grid-bg border-b border-[var(--uf-border-faint)]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-5 py-24 text-center">
        <span className="uf-mono text-[11px] uppercase tracking-[0.18em] text-[var(--uf-text-tertiary)]">
          03 — THE PRINCIPLE
        </span>
        <h2 className="mt-6 text-3xl font-bold uppercase leading-tight tracking-tight text-[var(--uf-text-primary)] md:text-[44px]">
          Industrial catalogs should
          <br />
          not just contain information.
        </h2>
        <p className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight text-[var(--uf-text-tertiary)] md:text-[44px]">
          They should understand it.
        </p>
        <Button
          type="button"
          onClick={onRequestDemo}
          className="mt-10 h-11 rounded-sm bg-[var(--uf-accent)] px-7 text-[14px] font-semibold text-[var(--uf-primary-foreground)] shadow-[0_0_24px_rgba(55,199,234,0.25)] hover:bg-[var(--uf-accent-bright)]"
        >
          Request a Demo
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
