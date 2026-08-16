import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="uf-grid-bg flex min-h-screen flex-col items-center justify-center bg-[var(--uf-bg)] px-6 text-center"
    >
      <p className="uf-mono text-[11px] uppercase tracking-[0.18em] text-[var(--uf-accent)]">
        UniForge / 404
      </p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-[var(--uf-text-primary)]">
        RECORD NOT FOUND
      </h1>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-[var(--uf-text-secondary)]">
        The route or product record you requested does not exist in the
        system.
      </p>
      <button
        type="button"
        onClick={() => navigate("/command-center")}
        className="uf-mono mt-8 rounded-sm bg-[var(--uf-accent)] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--uf-primary-foreground)] transition-colors hover:bg-[var(--uf-accent-bright)]"
      >
        Return to Command Center
      </button>
    </motion.div>
  );
}
