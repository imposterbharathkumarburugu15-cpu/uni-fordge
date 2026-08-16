import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Scale, Radar } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

interface Engine {
  index: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  detail: string[];
  metric: [string, string];
}

const ENGINES: Engine[] = [
  {
    index: "01",
    icon: BrainCircuit,
    title: "Supplier Learning",
    description:
      "Learns each supplier's unique language, abbreviations, and patterns. Data gets smarter with every batch.",
    accent: "var(--uf-accent)",
    detail: [
      "Per-supplier taxonomy models built from every ingested document",
      "Abbreviation and unit normalization across catalogues, datasheets and specs",
      "Pattern confidence grows with each processed batch — no manual rulesets",
    ],
    metric: ["BATCHES LEARNED", "1,240"],
  },
  {
    index: "02",
    icon: Scale,
    title: "Product Truth",
    description:
      "Evaluates multiple sources, applies strict rules, and decides the most trustworthy data.",
    accent: "var(--uf-accent-bright)",
    detail: [
      "Every attribute is weighed against source authority and agreement",
      "Conflicts surface to human review with a system recommendation",
      "Verified values carry full source traceability back to evidence",
    ],
    metric: ["VERIFICATION RATE", "96.8%"],
  },
  {
    index: "03",
    icon: Radar,
    title: "Change Radar",
    description:
      "Detects changes from manufacturers, identifies impacted products, and recommends updates.",
    accent: "var(--uf-success)",
    detail: [
      "Monitors manufacturer publications and revised specifications",
      "Maps changes to impacted MPNs and downstream catalog records",
      "Recommends attribute updates before customers see stale data",
    ],
    metric: ["IMPACTED PRODUCTS TRACKED", "8,400"],
  },
];

export function Engines() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section id="engines" className="border-b border-[var(--uf-border-faint)] bg-[var(--uf-bg)]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:py-20">
        <div className="flex items-baseline gap-4">
          <span className="uf-mono text-[11px] text-[var(--uf-accent)]">02</span>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[var(--uf-text-primary)] md:text-3xl">
            Core Engines
          </h2>
          <span className="ml-auto hidden text-[12px] text-[var(--uf-text-tertiary)] md:block">
            Three systems. One verified catalog.
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ENGINES.map((engine, i) => {
            const Icon = engine.icon;
            const isOpen = expanded === i;
            return (
              <motion.article
                key={engine.index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="flex flex-col rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)] transition-colors hover:border-[var(--uf-border-strong)]"
              >
                <div className="flex flex-1 flex-col p-5">
                  <span
                    className="flex size-10 items-center justify-center rounded-sm border"
                    style={{
                      color: engine.accent,
                      borderColor: "var(--uf-border-strong)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-[var(--uf-text-primary)]">
                    <span className="uf-mono mr-2 text-[12px]" style={{ color: engine.accent }}>
                      {engine.index}.
                    </span>
                    {engine.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--uf-text-secondary)]">
                    {engine.description}
                  </p>

                  <div className="mt-4 flex items-baseline gap-2 border-t border-[var(--uf-border-faint)] pt-3">
                    <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                      {engine.metric[0]}
                    </span>
                    <span className="uf-mono text-[14px] font-semibold" style={{ color: engine.accent }}>
                      {engine.metric[1]}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="flex items-center justify-between border-t border-[var(--uf-border-faint)] px-5 py-3 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-medium"
                    style={{ color: engine.accent }}
                  >
                    Learn more
                    <ArrowRight
                      className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                      aria-hidden
                    />
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-[var(--uf-border-faint)]"
                    >
                      <div className="space-y-2 px-5 py-4">
                        {engine.detail.map((d) => (
                          <li key={d} className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--uf-text-secondary)]">
                            <span className="mt-1.5 size-1 shrink-0 rounded-full" style={{ background: engine.accent }} aria-hidden />
                            {d}
                          </li>
                        ))}
                      </div>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
