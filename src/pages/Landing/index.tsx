import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { DemoDialog } from "./DemoDialog";
import { Engines } from "./Engines";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Nav } from "./Nav";
import { ProductDialog } from "./ProductDialog";
import { Quote } from "./Quote";
import { Ticker } from "./Ticker";

/**
 * UNIFORGE landing page — marketing introduction to the platform.
 * SUPPLIER CHAOS → UNIFORGE → TRUSTED PRODUCT INTELLIGENCE.
 * The primary CTA enters the application.
 */
export default function Landing() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const enterApp = () => navigate("/auth?returnTo=/command-center");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-[var(--uf-bg-deep)] text-[var(--uf-text-primary)]"
    >
      <Nav onRequestDemo={() => setDemoOpen(true)} onOpenProduct={() => setProductOpen(true)} />
      <main>
        <Hero onExplore={enterApp} />
        <Ticker />
        <Engines />
        <Quote onRequestDemo={() => setDemoOpen(true)} />
      </main>
      <Footer onRequestDemo={() => setDemoOpen(true)} />

      <DemoDialog open={demoOpen} onOpenChange={setDemoOpen} onEnter={enterApp} />
      <ProductDialog open={productOpen} onOpenChange={setProductOpen} />
    </motion.div>
  );
}
