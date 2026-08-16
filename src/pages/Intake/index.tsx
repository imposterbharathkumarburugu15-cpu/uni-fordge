import { motion } from "framer-motion";
import { Link } from "react-router";
import { useSources, useSuppliers } from "@/hooks/use-forge-store";
import { InspectionPanel } from "./InspectionPanel";
import { SourceTable } from "./SourceTable";
import { UploadZone } from "./UploadZone";

/** Pipeline steps shown in the intake progress bar (Stitch reference). */
const STEPS = [
  { label: "Intake", path: "/intake" },
  { label: "Forge", path: "/forge" },
  { label: "Prove", path: "/prove" },
  { label: "Resolve", path: "/resolve" },
  { label: "Ship", path: "/ship" },
];

/**
 * INTAKE — the supplier-data ingestion workspace (Stitch reference).
 * Bring messy supplier sources into UniForge: drop the catalogue,
 * inspect what will be recovered, then queue the document stream.
 */
export default function Intake() {
  const sources = useSources();
  const suppliers = useSuppliers();

  const ingested = sources.filter((s) => s.status === "INGESTED");
  const active = sources.filter(
    (s) => s.status === "QUEUED" || s.status === "PROCESSING",
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        {/* left: hero + intake port */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="uf-eyebrow">Supplier data operations · stage 01 / 06</p>
            <h1 className="mt-4 text-[34px] font-bold uppercase leading-[0.98] tracking-tight text-[var(--uf-text-primary)] md:text-[48px] lg:text-[54px]">
              Bring supplier data
              <br />
              into the{" "}
              <span className="text-[var(--uf-text-primary)]">
                Forge
                <span className="text-[var(--uf-accent)]">.</span>
              </span>
            </h1>
            <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-[var(--uf-text-secondary)]">
              Streamline supplier catalogues for precision inspection and
              transformation into standardized product intelligence.
            </p>
          </motion.div>

          <div className="mt-9">
            <UploadZone
              suppliers={suppliers}
              onQueued={() => undefined}
            />
          </div>

          {/* live intake counters */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-[var(--uf-border-faint)] border border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)]">
            <Counter label="In queue" value={`${active.length} active`} tone="var(--uf-accent)" />
            <Counter label="Ingested" value={`${ingested.length} documents`} tone="var(--uf-success)" />
            <Counter label="Formats" value="CSV · XLSX · PDF · JSON" tone="var(--uf-text-secondary)" />
          </div>
        </div>

        {/* right: what will be inspected + live preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="lg:pt-16"
        >
          <InspectionPanel />
        </motion.div>
      </section>

      {/* pipeline progress bar */}
      <section
        className="rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)] px-4 py-3.5 md:px-6"
        aria-label="Pipeline progress"
      >
        <div className="flex items-center justify-between">
          <span className="uf-mono text-[9px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
            Pipeline status
          </span>
          <span className="uf-mono text-[9px] uppercase tracking-[0.14em] text-[var(--uf-accent)]">
            Intake · active
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none md:gap-5">
          {STEPS.map((step, i) => {
            const isActive = i === 0;
            return (
              <div key={step.label} className="flex shrink-0 items-center gap-3 md:gap-5">
                <Link
                  to={step.path}
                  className="group flex items-center gap-2.5"
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={`size-2.5 rounded-full transition-shadow ${
                      isActive
                        ? "bg-[var(--uf-accent)] shadow-[0_0_12px_rgba(55,199,234,0.9)]"
                        : "border border-[var(--uf-border-strong)] bg-[var(--uf-bg)] group-hover:border-[var(--uf-accent-line)]"
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`uf-mono text-[10px] font-medium uppercase tracking-[0.14em] ${
                      isActive
                        ? "text-[var(--uf-accent)]"
                        : "text-[var(--uf-text-tertiary)] transition-colors group-hover:text-[var(--uf-text-secondary)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </Link>
                {i < STEPS.length - 1 && (
                  <span
                    className={`h-px w-10 md:w-16 ${
                      isActive
                        ? "bg-[var(--uf-accent)] shadow-[0_0_6px_rgba(55,199,234,0.8)]"
                        : "bg-[var(--uf-border)]"
                    }`}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* document queue */}
      <SourceTable sources={sources} suppliers={suppliers} />
    </div>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="px-4 py-3">
      <p className="uf-mono text-[8.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
        {label}
      </p>
      <p className="uf-mono mt-1 text-[10.5px] font-medium" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}
