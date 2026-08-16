import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnter: () => void;
}

export function DemoDialog({ open, onOpenChange, onEnter }: DemoDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(() => setSubmitted(false), 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
        {submitted ? (
          <div className="flex flex-col items-center px-2 py-8 text-center">
            <span
              className="flex size-12 items-center justify-center rounded-full border"
              style={{
                color: "var(--uf-success)",
                borderColor: "var(--uf-success-line)",
                background: "var(--uf-success-dim)",
              }}
            >
              <Check className="size-6" aria-hidden />
            </span>
            <DialogTitle className="mt-4 text-[17px] text-[var(--uf-text-primary)]">
              Request received
            </DialogTitle>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--uf-text-secondary)]">
              A UniForge engineer will reach out within one business day with a
              walkthrough tailored to your catalog.
            </p>
            <Button
              type="button"
              onClick={onEnter}
              className="mt-6 w-full rounded-sm bg-[var(--uf-accent)] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
            >
              Explore the Platform
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="uf-mono text-[12px] uppercase tracking-[0.14em] text-[var(--uf-accent)]">
                Request a Demo
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[var(--uf-text-secondary)]">
                See your supplier catalog turned into verified product truth.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="demo-name" className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                  Full name
                </Label>
                <Input id="demo-name" required placeholder="Name" className="border-[var(--uf-border)] bg-[var(--uf-surface)]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-email" className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                  Work email
                </Label>
                <Input id="demo-email" type="email" required placeholder="name@company.com" className="border-[var(--uf-border)] bg-[var(--uf-surface)]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-company" className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                  Company
                </Label>
                <Input id="demo-company" required placeholder="Company" className="border-[var(--uf-border)] bg-[var(--uf-surface)]" />
              </div>
              <Button
                type="submit"
                className="w-full rounded-sm bg-[var(--uf-accent)] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
              >
                Submit Request
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
