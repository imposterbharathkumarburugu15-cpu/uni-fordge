import { useState } from "react";
import { Logo } from "@/components/common/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const LEGAL: Record<string, { title: string; body: string }> = {
  Documentation: {
    title: "Documentation",
    body: "Integration guides, the product-data model, and the API reference are available inside the platform. The API contract covers intake, forge, evidence, conflicts, product DNA and ship exports.",
  },
  Security: {
    title: "Security",
    body: "UNIFORGE runs on enterprise-grade infrastructure with encrypted storage, role-based access control, and full audit trails on every resolution and export.",
  },
  "API Status": {
    title: "API Status",
    body: "All UNIFORGE services are operational. Live queue depth, sync state, and source health are displayed in the Command Center system panel.",
  },
  "Privacy Policy": {
    title: "Privacy Policy",
    body: "UNIFORGE processes supplier and product data only for the purpose of product intelligence. Source documents and extracted evidence remain traceable and under customer control.",
  },
  "Terms of Service": {
    title: "Terms of Service",
    body: "Use of the UNIFORGE platform is governed by the enterprise agreement in place with your organization.",
  },
};

export function Footer({ onRequestDemo }: { onRequestDemo: () => void }) {
  const [doc, setDoc] = useState<string | null>(null);
  const navigate = useNavigate();
  const links = ["Documentation", "Security", "API Status", "Privacy Policy"];

  return (
    <footer className="border-t border-[var(--uf-border)] bg-[var(--uf-bg-deep)]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-4 px-5 py-8">
        {links.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setDoc(label)}
            className="text-[12.5px] text-[var(--uf-text-tertiary)] transition-colors hover:text-[var(--uf-text-secondary)]"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigate("/auth?returnTo=/command-center")}
          className="ml-auto text-[12.5px] text-[var(--uf-text-tertiary)] transition-colors hover:text-[var(--uf-text-secondary)]"
        >
          Terms of Service
        </button>
      </div>
      <div className="border-t border-[var(--uf-border-faint)]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-4 px-5 py-5">
          <Logo className="text-[14px] text-[var(--uf-text-secondary)]" markClassName="text-[var(--uf-accent)]" />
          <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            © 2024 UniForge AI, Inc. All rights reserved.
          </span>
          <span className="ml-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onRequestDemo}
              className="text-[12px] text-[var(--uf-accent)] hover:bg-[var(--uf-accent-dim)] hover:text-[var(--uf-accent-bright)]"
            >
              Request a Demo →
            </Button>
          </span>
        </div>
      </div>

      <Dialog open={doc !== null} onOpenChange={(o) => !o && setDoc(null)}>
        <DialogContent className="max-w-md border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
          <DialogHeader>
            <DialogTitle className="uf-mono text-[12px] uppercase tracking-[0.14em] text-[var(--uf-accent)]">
              {doc}
            </DialogTitle>
            <DialogDescription className="pt-2 text-[13.5px] leading-relaxed text-[var(--uf-text-secondary)]">
              {doc ? LEGAL[doc]?.body : ""}
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            onClick={() => navigate("/auth?returnTo=/command-center")}
            className="mt-2 w-full rounded-sm bg-[var(--uf-accent)] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
          >
            Enter the Platform
          </Button>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
