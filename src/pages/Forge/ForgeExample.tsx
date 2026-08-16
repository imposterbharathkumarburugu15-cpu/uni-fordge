import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const EXAMPLE = [
  { key: "MATERIAL", value: "BRASS", raw: ["BRASS", "BRS"] },
  { key: "SIZE", value: "3/8 IN", raw: ["3/8"] },
  { key: "THREAD", value: "NPT", raw: ["NPT"] },
  { key: "PRESSURE", value: "125 PSI", raw: ["125 PSI"] },
];

/**
 * The forge narrative — one raw supplier string, decomposed into
 * structured, normalized product attributes.
 */
export function ForgeExample() {
  return (
    <div className="uf-panel overflow-hidden">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">01</span>
          Raw Data → Structured Product Data
        </h2>
        <span className="uf-mono hidden text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)] sm:inline">
          VND-992-B · supplier_catalogue.xlsx
        </span>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-md border border-[var(--uf-border)] bg-[var(--uf-bg)] p-4">
          <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            Raw supplier data
          </p>
          <p className="uf-mono mt-3 text-[15px] leading-7 text-[var(--uf-text-secondary)]">
            “3/8 brass coupling NPT rated 125 PSI”
          </p>
        </div>

        <div className="flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <span className="uf-mono text-[10px] uppercase tracking-[0.14em] text-[var(--uf-accent)]">
              Forge
            </span>
            <ArrowDown className="size-4 text-[var(--uf-accent)]" aria-hidden />
          </motion.span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {EXAMPLE.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] p-3"
            >
              <p className="uf-mono text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                {item.key}
              </p>
              <p className="uf-mono mt-1 text-[15px] font-semibold text-[var(--uf-text-primary)]">
                {item.value}
              </p>
              <p className="uf-mono mt-0.5 text-[9.5px] text-[var(--uf-text-tertiary)]">
                from {item.raw.join(" / ")}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
