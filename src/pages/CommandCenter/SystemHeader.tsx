import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { ProductVisualization } from "@/components/common/ProductVisualization";
import { Button } from "@/components/ui/button";
import { useSystemStatus } from "@/hooks/use-forge-store";

/**
 * System header — the operational hero. Mirrors the Stitch reference:
 * "TURN SUPPLIER CHAOS INTO PRODUCT TRUTH." with the live coupling record.
 */
export function SystemHeader() {
  const navigate = useNavigate();
  const system = useSystemStatus();

  return (
    <section className="uf-grid-bg overflow-hidden rounded-md border border-[var(--uf-border)] bg-[var(--uf-bg-raised)]">
      <div className="grid items-center gap-6 p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2.5 py-1"
          >
            <span className="uf-mono text-[10px] uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
              UniForge / Command Center
            </span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-5 text-3xl font-bold uppercase leading-[1.08] tracking-tight text-[var(--uf-text-primary)] md:text-[42px]"
          >
            Turn supplier chaos
            <br />
            into product truth.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mt-4 max-w-[480px] text-[13.5px] leading-relaxed text-[var(--uf-text-secondary)]"
          >
            {system.cohort.total.toLocaleString()} products flowing through intake,
            forge, prove, resolve and DNA. {system.cohort.verified.toLocaleString()}{" "}
            verified against source evidence —{" "}
            <span className="text-[var(--uf-warning)]">{system.resolveQueue} conflicts await review</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <Button
              type="button"
              onClick={() => navigate("/intake")}
              className="h-10 rounded-sm bg-[var(--uf-accent)] px-5 text-[13px] font-semibold text-[var(--uf-primary-foreground)] shadow-[0_0_20px_rgba(55,199,234,0.22)] hover:bg-[var(--uf-accent-bright)]"
            >
              <Plus className="size-4" aria-hidden />
              Import Catalogue
            </Button>
            <button
              type="button"
              onClick={() => navigate("/product/PRD-0101")}
              className="uf-mono inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-accent)]"
            >
              View Sample
              <ArrowRight className="size-3.5" aria-hidden />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <ProductVisualization className="mx-auto h-auto w-full max-w-[560px]" />
        </motion.div>
      </div>
    </section>
  );
}
