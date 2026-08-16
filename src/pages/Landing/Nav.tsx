import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Platform", target: "#engines" },
  { label: "Features", target: "#engines" },
  { label: "How It Works", target: "#process" },
  { label: "Catalog Intelligence", target: "#catalog-intelligence" },
] as const;

interface NavProps {
  onRequestDemo: () => void;
  onOpenProduct: () => void;
}

export function Nav({ onRequestDemo, onOpenProduct }: NavProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (target: string) => {
    setMobileOpen(false);
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-6 px-5">
        <button type="button" onClick={() => scrollTo("#catalog-intelligence")} aria-label="UNIFORGE home">
          <Logo className="text-[17px] text-[var(--uf-text-primary)]" markClassName="text-[var(--uf-accent)]" />
        </button>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Landing navigation">
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollTo(link.target)}
              className="text-[13px] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)]"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenProduct}
            className="text-[13px] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)]"
          >
            3D / AI
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/auth?returnTo=/command-center")}
            className="hidden text-[13px] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)] sm:block"
          >
            Log In
          </button>
          <Button
            type="button"
            onClick={onRequestDemo}
            className="h-9 rounded-sm bg-[var(--uf-accent)] px-4 text-[13px] font-semibold text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
          >
            Request a Demo
          </Button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-sm border border-[var(--uf-border)] text-[var(--uf-text-secondary)] md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)] px-5 py-3 md:hidden" aria-label="Mobile navigation">
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollTo(link.target)}
              className="block w-full py-2 text-left text-[13px] text-[var(--uf-text-secondary)]"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenProduct();
            }}
            className="block w-full py-2 text-left text-[13px] text-[var(--uf-text-secondary)]"
          >
            3D / AI
          </button>
          <button
            type="button"
            onClick={() => navigate("/auth?returnTo=/command-center")}
            className="block w-full py-2 text-left text-[13px] text-[var(--uf-text-secondary)]"
          >
            Log In
          </button>
        </nav>
      )}
    </header>
  );
}
