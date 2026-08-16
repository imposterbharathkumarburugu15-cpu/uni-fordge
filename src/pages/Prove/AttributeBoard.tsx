import { BookOpen, Scale, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Mono } from "@/components/common/Mono";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { StatusBadge } from "@/components/status/StatusBadge";
import {
  useConflicts,
  useEvidence,
  useProducts,
} from "@/hooks/use-forge-store";
import type { Product, ProductAttribute } from "@/types/domain";

interface AttributeProof {
  attribute: ProductAttribute;
  evidenceCount: number;
  proofScore: number;
  agreement: number; // fraction of evidence agreeing with canonical value
  openConflict: boolean;
}

interface AttributeBoardProps {
  product: Product;
}

export function AttributeBoard({ product }: AttributeBoardProps) {
  const navigate = useNavigate();
  const evidence = useEvidence();
  const conflicts = useConflicts();
  const [viewer, setViewer] = useState<{ open: boolean; attributeKey?: string }>({
    open: false,
  });

  const proofs: AttributeProof[] = useMemo(() => {
    return product.attributes.map((attribute) => {
      const attrEvidence = evidence.filter(
        (e) => e.productId === product.id && e.attributeKey === attribute.key,
      );
      const agreeing = attrEvidence.filter((e) => e.value === attribute.value).length;
      const score =
        attrEvidence.length > 0
          ? attrEvidence.reduce((sum, e) => sum + e.confidence, 0) / attrEvidence.length
          : 0;
      return {
        attribute,
        evidenceCount: attrEvidence.length,
        proofScore: score,
        agreement: attrEvidence.length > 0 ? agreeing / attrEvidence.length : 0,
        openConflict: conflicts.some(
          (c) =>
            c.productId === product.id &&
            c.attributeKey === attribute.key &&
            c.status === "OPEN",
        ),
      };
    });
  }, [product, evidence, conflicts]);

  const sorted = [...proofs].sort((a, b) => Number(b.openConflict) - Number(a.openConflict));

  return (
    <div className="overflow-x-auto">
      <table className="uf-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Canonical value</th>
            <th>Sources</th>
            <th>Agreement</th>
            <th>Proof score</th>
            <th>Verification</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((proof) => {
            const a = proof.attribute;
            return (
              <tr key={a.key} className={proof.openConflict ? "bg-[var(--uf-warning-dim)]" : undefined}>
                <td>
                  <span className="text-[12.5px] font-medium text-[var(--uf-text-primary)]">
                    {a.label}
                  </span>
                  <span className="uf-mono ml-2 text-[10px] text-[var(--uf-text-tertiary)]">
                    {a.key}
                  </span>
                </td>
                <td>
                  <span className="uf-mono text-[12.5px] text-[var(--uf-text-primary)]">
                    {a.value}
                    {a.unit ? <span className="text-[var(--uf-text-tertiary)]"> {a.unit}</span> : null}
                  </span>
                </td>
                <td>
                  <span className="uf-mono text-[11.5px] text-[var(--uf-text-secondary)]">
                    {proof.evidenceCount} source{proof.evidenceCount === 1 ? "" : "s"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <div className="uf-meter">
                        <span
                          style={{
                            width: `${Math.round(proof.agreement * 100)}%`,
                            background:
                              proof.agreement >= 0.9
                                ? "var(--uf-success)"
                                : proof.agreement >= 0.5
                                  ? "var(--uf-warning)"
                                  : "var(--uf-critical)",
                          }}
                        />
                      </div>
                    </div>
                    <span className="uf-mono text-[10.5px] text-[var(--uf-text-tertiary)]">
                      {Math.round(proof.agreement * 100)}%
                    </span>
                  </div>
                </td>
                <td>
                  <ConfidenceMeter value={proof.proofScore} size="sm" />
                </td>
                <td>
                  <StatusBadge status={proof.openConflict ? "CONFLICT" : a.verification} />
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewer({ open: true, attributeKey: a.key })}
                      className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-border-strong)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)]"
                    >
                      <BookOpen className="size-3" aria-hidden />
                      Open evidence
                    </button>
                    {proof.openConflict && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/resolve?conflict=${conflicts.find((c) => c.productId === product.id && c.attributeKey === a.key)?.id ?? ""}`,
                          )
                        }
                        className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-warning)] transition-colors hover:bg-[var(--uf-warning)] hover:text-[var(--uf-bg)]"
                      >
                        <Scale className="size-3" aria-hidden />
                        Review conflict
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <EvidenceViewer
        open={viewer.open}
        onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}
        productId={product.id}
        attributeKey={viewer.attributeKey}
      />
    </div>
  );
}

export function ProveSummary({ product }: { product: Product }) {
  const verified = product.attributes.filter((a) => a.verification === "VERIFIED").length;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-2 text-[12px] text-[var(--uf-text-secondary)]">
        <ShieldCheck className="size-4 text-[var(--uf-success)]" aria-hidden />
        <Mono className="text-[var(--uf-text-primary)]">{product.mpn}</Mono>
        {product.name}
      </span>
      <span className="uf-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
        {verified}/{product.attributes.length} verified
      </span>
    </div>
  );
}
