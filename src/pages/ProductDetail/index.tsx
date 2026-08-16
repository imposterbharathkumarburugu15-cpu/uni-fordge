import {
  ArrowRight,
  BookOpen,
  Hammer,
  PackageCheck,
  Scale,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Mono, Timestamp } from "@/components/common/Mono";
import { PageHeader } from "@/components/common/PageHeader";
import { PipelineRail } from "@/components/pipeline/PipelineRail";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { StatusBadge } from "@/components/status/StatusBadge";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { forgeStore } from "@/store/forgeStore";
import {
  useActivity,
  useConflicts,
  useProduct,
  useSuppliers,
  useSystemStatus,
} from "@/hooks/use-forge-store";
import { nextStage, stageMeta } from "@/utils/pipeline";

export default function ProductDetail() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const product = useProduct(productId);
  const suppliers = useSuppliers();
  const system = useSystemStatus();
  const conflicts = useConflicts();
  const activity = useActivity();
  const [viewer, setViewer] = useState<{ open: boolean; attributeKey?: string }>({
    open: false,
  });

  if (!product) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <p className="uf-mono text-[12px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            Record {productId} not found
          </p>
          <button
            type="button"
            onClick={() => navigate("/command-center")}
            className="uf-mono mt-3 text-[12px] text-[var(--uf-accent)] hover:underline"
          >
            Return to Command Center →
          </button>
        </div>
      </div>
    );
  }

  const supplier = suppliers.find((s) => s.id === product.supplierId);
  const openConflicts = conflicts.filter(
    (c) => c.productId === product.id && c.status === "OPEN",
  );
  const verified = product.attributes.filter((a) => a.verification === "VERIFIED").length;
  const productActivity = activity.filter((a) => a.productId === product.id).slice(0, 6);
  const next = nextStage(product.stage);

  const advance = (target: typeof next) => {
    if (!target) return;
    forgeStore.advanceProduct(product.id, target);
    toast.success(`${product.mpn} advanced → ${stageMeta(target).label}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={["UniForge", stageMeta(product.stage).label, product.mpn]}
        title={product.name}
        subtitle={product.description}
        actions={
          <>
            <StatusBadge status={product.status} />
            {openConflicts[0] && (
              <button
                type="button"
                onClick={() => navigate(`/resolve?conflict=${openConflicts[0].id}`)}
                className="uf-mono inline-flex items-center gap-1.5 rounded-sm border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--uf-warning)] hover:bg-[var(--uf-warning)] hover:text-[var(--uf-bg)]"
              >
                <Scale className="size-3.5" aria-hidden />
                Review conflict
              </button>
            )}
            {product.status === "READY" && (
              <button
                type="button"
                onClick={() => navigate("/ship")}
                className="uf-mono inline-flex items-center gap-1.5 rounded-sm bg-[var(--uf-accent)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
              >
                <Send className="size-3.5" aria-hidden />
                Ship
              </button>
            )}
          </>
        }
        meta={
          <>
            <Meta label="SUPPLIER" value={supplier?.name ?? product.supplierId} />
            <Meta label="CATEGORY" value={product.category} />
            <Meta label="REVISION" value={`${product.revision}`} />
            <Meta label="UPDATED" value={<Timestamp iso={product.updatedAt} />} />
            {product.shippedAt && <Meta label="SHIPPED" value={<Timestamp iso={product.shippedAt} />} />}
          </>
        }
      />

      {/* pipeline position */}
      <PipelineRail
        counts={system.pipelineCounts}
        activeStage={product.stage}
        variant="compact"
        requireReview={openConflicts.length > 0}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* attributes */}
        <div className="uf-panel overflow-hidden">
          <div className="uf-panel-head">
            <h2 className="uf-section-title">
              <span className="idx">01</span>
              Product Attributes
            </h2>
            <span className="flex items-center gap-2">
              <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                {verified}/{product.attributes.length} verified
              </span>
              <ConfidenceMeter value={product.confidence} size="sm" />
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="uf-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Value</th>
                  <th>Confidence</th>
                  <th>Verification</th>
                  <th className="text-right">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {product.attributes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                        Attributes pending — source still in intake
                      </span>
                    </td>
                  </tr>
                )}
                {product.attributes.map((a) => (
                  <tr key={a.key}>
                    <td>
                      <span className="text-[12.5px] font-medium text-[var(--uf-text-primary)]">
                        {a.label}
                      </span>
                      <span className="uf-mono ml-2 text-[10px] text-[var(--uf-text-tertiary)]">
                        {a.key}
                      </span>
                    </td>
                    <td>
                      <span className="uf-mono text-[13px] text-[var(--uf-text-primary)]">
                        {a.value}
                        {a.unit ? <span className="text-[var(--uf-text-tertiary)]"> {a.unit}</span> : null}
                      </span>
                    </td>
                    <td>
                      <ConfidenceMeter value={a.confidence} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={a.verification} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end">
                        {a.evidenceIds.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewer({ open: true, attributeKey: a.key })}
                            className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-border-strong)] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)]"
                          >
                            <BookOpen className="size-3" aria-hidden />
                            {a.evidenceIds.length} source{a.evidenceIds.length > 1 ? "s" : ""}
                          </button>
                        ) : (
                          <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* progression actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--uf-border-faint)] px-4 py-3">
            {product.stage === "INTAKE" && next && (
              <button
                type="button"
                onClick={() => advance(next)}
                className="uf-mono inline-flex items-center gap-1.5 rounded-sm bg-[var(--uf-accent)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
              >
                <Hammer className="size-3.5" aria-hidden />
                Send to {stageMeta(next).label}
              </button>
            )}
            {product.stage === "FORGE" && next && (
              <button
                type="button"
                onClick={() => advance(next)}
                className="uf-mono inline-flex items-center gap-1.5 rounded-sm bg-[var(--uf-accent)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
              >
                <Hammer className="size-3.5" aria-hidden />
                Commit to {stageMeta(next).label}
              </button>
            )}
            {product.stage === "PRODUCT_DNA" && (
              <button
                type="button"
                onClick={() => navigate("/product-dna")}
                className="uf-mono inline-flex items-center gap-1.5 rounded-sm border border-[var(--uf-border-strong)] px-3.5 py-2 text-[11px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] hover:text-[var(--uf-text-primary)]"
              >
                <PackageCheck className="size-3.5" aria-hidden />
                View DNA records
              </button>
            )}
            <span className="ml-auto text-[11.5px] text-[var(--uf-text-tertiary)]">
              Next stage: <span className="text-[var(--uf-accent)]">{next ? stageMeta(next).label : "—"}</span>
            </span>
          </div>
        </div>

        {/* side rail */}
        <div className="flex flex-col gap-4">
          <div className="uf-panel overflow-hidden">
            <div className="uf-panel-head">
              <h2 className="uf-section-title">
                <span className="idx">02</span>
                Open Conflicts
              </h2>
            </div>
            <div className="p-4">
              {openConflicts.length === 0 ? (
                <p className="flex items-center gap-2 text-[12.5px] text-[var(--uf-success)]">
                  <span className="uf-dot uf-dot-success" aria-hidden />
                  No open conflicts — record is clear to verify.
                </p>
              ) : (
                <ul className="space-y-2">
                  {openConflicts.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/resolve?conflict=${c.id}`)}
                        className="w-full rounded-sm border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] p-3 text-left transition-colors hover:bg-[var(--uf-warning)] hover:text-[var(--uf-bg)]"
                      >
                        <p className="uf-mono text-[11px] font-medium text-[var(--uf-warning)]">
                          {c.attributeLabel} · {c.id}
                        </p>
                        <p className="uf-mono mt-1 text-[10.5px] text-[var(--uf-text-tertiary)]">
                          {c.sources.map((s) => s.value).join(" / ")}
                        </p>
                        <span className="uf-mono mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-[var(--uf-warning)]">
                          Review <ArrowRight className="size-3" aria-hidden />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="uf-panel overflow-hidden">
            <div className="uf-panel-head">
              <h2 className="uf-section-title">
                <span className="idx">03</span>
                Record Activity
              </h2>
            </div>
            <div className="px-4 py-1">
              {productActivity.length > 0 ? (
                <ActivityFeed items={productActivity} limit={6} />
              ) : (
                <p className="uf-mono py-4 text-[10.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                  No recorded events
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <EvidenceViewer
        open={viewer.open}
        onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}
        productId={product.id}
        attributeKey={viewer.attributeKey}
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
        {label}
      </span>
      <span className="uf-mono text-[11.5px] text-[var(--uf-text-secondary)]">{value}</span>
    </span>
  );
}
