import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AppTopBar } from "@/components/navigation/AppTopBar";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { FooterBar } from "./FooterBar";

/**
 * The persistent UNIFORGE application shell. Navigation stays constant
 * across every module; the outlet animates between routes.
 */
export function AppShell() {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="uf-grid-bg flex min-h-screen flex-col bg-[var(--uf-bg)]">
      <AppTopBar onSearch={() => setPaletteOpen(true)} />

      <div
        ref={scrollRef}
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-6 lg:px-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      <FooterBar />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
