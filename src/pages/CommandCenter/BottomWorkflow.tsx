import { StageFlow } from "@/components/pipeline/StageFlow";

/**
 * The transformation narrative, straight from the Stitch reference:
 * 3/8 CPLG BRS → BRASS COUPLING → 3/8 IN → PRODUCT READY ✓
 */
export function BottomWorkflow() {
  return (
    <section className="uf-panel overflow-hidden" aria-label="Transformation workflow">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">08</span>
          Bottom Workflow · Transformation in Action
        </h2>
        <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          VND-992-B · live record
        </span>
      </div>
      <div className="px-5 py-5">
        <StageFlow
          steps={["3/8 CPLG BRS", "BRASS COUPLING", "3/8 IN", "PRODUCT READY"]}
          verified
        />
        <div className="mt-4 flex flex-wrap gap-x-10 gap-y-2 border-t border-[var(--uf-border-faint)] pt-4">
          {[
            ["RAW INPUT", "Row 421 · supplier_catalogue.xlsx"],
            ["NORMALIZED", "Coupling · 3/8 in · NPT"],
            ["PROOF", "3 sources · 2 agree"],
            ["STATE", "Awaiting resolution on material"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                {k}
              </p>
              <p className="uf-mono mt-0.5 text-[11.5px] text-[var(--uf-text-secondary)]">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
