import { ArrowRight, Box } from "lucide-react";
import { useNavigate } from "react-router";
import { ProductVisualization } from "@/components/common/ProductVisualization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * "3D / AI" landing entry — the live product visualization with
 * traceable attribute callouts, drawn straight from product data.
 */
export function ProductDialog({ open, onOpenChange }: ProductDialogProps) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] p-0 text-[var(--uf-text-primary)]">
        <DialogHeader className="border-b border-[var(--uf-border-faint)] px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.14em]">
            <Box className="size-4 text-[var(--uf-accent)]" aria-hidden />
            Catalog Intelligence · Live Product Record
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-[var(--uf-text-secondary)]">
            Attribute callouts are drawn from the verified product record — every
            value traces back to source evidence.
          </DialogDescription>
        </DialogHeader>
        <div className="uf-grid-bg px-4 py-4">
          <ProductVisualization className="h-auto w-full" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--uf-border-faint)] px-6 py-4">
          <span className="uf-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            PRD-0101 · VND-992-B · RESOLVE STAGE
          </span>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate("/auth?returnTo=/command-center");
            }}
            className="rounded-sm bg-[var(--uf-accent)] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
          >
            Open in Platform
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
