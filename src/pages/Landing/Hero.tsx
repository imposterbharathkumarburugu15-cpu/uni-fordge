import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { PipelineIllustration } from "@/components/common/PipelineIllustration";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onExplore: () => void;
}

export function Hero({ onExplore }: HeroProps) {
  return (
    <section id="catalog-intelligence" className="uf-grid-bg border-b border-[var(--uf-border-faint)]">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-5 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="uf-mono flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--uf-accent)]"
          >
            <span className="text-[var(--uf-text-tertiary)]">01 — PLATFORM · CATALOG INTELLIGENCE</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-4xl font-bold uppercase leading-[1.04] tracking-tight text-[var(--uf-text-primary)] md:text-[56px]"
          >
            From supplier
            <br />
            chaos to trusted
            <br />
            product intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-[520px] text-[15px] leading-relaxed text-[var(--uf-text-secondary)]"
          >
            UniForge understands fragmented supplier data, verifies product
            information against trusted evidence, and turns it into structured
            product intelligence ready for industrial commerce.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              type="button"
              onClick={onExplore}
              className="h-11 rounded-sm bg-[var(--uf-accent)] px-6 text-[14px] font-semibold text-[var(--uf-primary-foreground)] shadow-[0_0_24px_rgba(55,199,234,0.25)] hover:bg-[var(--uf-accent-bright)]"
            >
              Explore Platform
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.querySelector("#process")?.scrollIntoView({ behavior: "smooth" })}
              className="h-11 rounded-sm border-[var(--uf-border-strong)] bg-transparent px-5 text-[14px] text-[var(--uf-text-primary)] hover:bg-[var(--uf-surface)]"
            >
              <Play className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
              Watch Demo
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative"
        >
          <PipelineIllustration className="mx-auto h-auto w-full max-w-[560px]" />
        </motion.div>
      </div>
    </section>
  );
}
