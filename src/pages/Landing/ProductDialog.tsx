import { ArrowRight, Box, Move3d } from "lucide-react";
import { lazy, Suspense } from "react";
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
import { useProduct } from "@/hooks/use-forge-store";

/** Lazy chunk — keeps `three` out of the landing bundle until the dialog opens. */
const ProductModel3D = lazy(() =>
  import("@/components/common/ProductModel3D").then((m) => ({
    default: m.ProductModel3D,
  })),
);

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CalloutChip {
  title: string;
  value: string;
  verified: boolean;
  position: "tl" | "tr" | "bl" | "br";
}

/**
 * "3D / AI" landing entry — the live product record rendered as an
 * interactive Three.js model. Callout chips read the product's current
 * canonical attributes and flip to verified state on resolution.
 */
export function ProductDialog({ open, onOpenChange }: ProductDialogProps) {
  const navigate = useNavigate();
  const product = useProduct("PRD-0101");

  const material = product?.attributes.find((a) => a.key === "MATERIAL");
  const size = product?.attributes.find((a) => a.key === "SIZE");
  const type = product?.attributes.find((a) => a.key === "PRODUCT_TYPE");

  const chips: CalloutChip[] = [
    {
      title: "MATERIAL",
      value: material?.value.toUpperCase() ?? "—",
      verified: material?.verification === "VERIFIED",
      position: "tl",
    },
    {
      title: "MPN",
      value: product?.mpn ?? "—",
      verified: true,
      position: "tr",
    },
    {
      title: "SIZE",
      value: size ? `${size.value} ${size.unit ?? ""}`.trim().toUpperCase() : "—",
      verified: size?.verification === "VERIFIED",
      position: "bl",
    },
    {
      title: "PRODUCT TYPE",
      value: type?.value.toUpperCase() ?? "—",
      verified: type?.verification === "VERIFIED",
      position: "br",
    },
  ];

  const positionClass: Record<CalloutChip["position"], string> = {
    tl: "left-3 top-3",
    tr: "right-3 top-3",
    bl: "bottom-3 left-3",
    br: "bottom-3 right-3",
  };

  const vizFallback = (
    <ProductVisualization className="absolute inset-0 m-auto h-auto max-h-full w-full max-w-[540px]" />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] p-0 text-[var(--uf-text-primary)]">
        <DialogHeader className="border-b border-[var(--uf-border-faint)] px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.14em]">
            <Box className="size-4 text-[var(--uf-accent)]" aria-hidden />
            Catalog Intelligence · Live 3D Product Record
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-[var(--uf-text-secondary)]">
            Interactive model of the verified record — every callout traces
            back to source evidence. Drag to inspect.
          </DialogDescription>
        </DialogHeader>

        <div className="uf-grid-bg relative h-[380px] w-full overflow-hidden md:h-[460px]">
          <Suspense fallback={vizFallback}>
            <ProductModel3D
              className="absolute inset-0 h-full w-full"
              fallback={vizFallback}
            />
          </Suspense>

          {/* live attribute callouts */}
          <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
            {chips.map((c) => (
              <div
                key={c.title}
                className={`absolute ${positionClass[c.position]} flex flex-col gap-0.5 rounded-sm border bg-[var(--uf-surface)]/90 px-3 py-2 backdrop-blur-sm ${
                  c.verified
                    ? "border-[var(--uf-success-line)]"
                    : "border-[var(--uf-warning-line)]"
                }`}
              >
                <span className="uf-mono text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                  {c.title}
                </span>
                <span
                  className={`uf-mono text-[13px] font-semibold ${
                    c.verified
                      ? "text-[var(--uf-text-primary)]"
                      : "text-[var(--uf-warning)]"
                  }`}
                >
                  {c.value}
                </span>
              </div>
            ))}
          </div>

          {/* interaction hint */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-sm border border-[var(--uf-border-strong)] bg-[var(--uf-surface)]/90 px-3 py-1.5 backdrop-blur-sm">
            <Move3d className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
            <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
              Drag to rotate
            </span>
          </div>
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
