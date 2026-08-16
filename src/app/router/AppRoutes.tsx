import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { RequireAuth } from "@/components/RequireAuth";

const Landing = lazy(() => import("@/pages/Landing"));
const AuthPage = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AppShell = lazy(() =>
  import("@/components/layout/AppShell").then((m) => ({ default: m.AppShell })),
);
const CommandCenter = lazy(() => import("@/pages/CommandCenter"));
const Intake = lazy(() => import("@/pages/Intake"));
const Forge = lazy(() => import("@/pages/Forge"));
const Prove = lazy(() => import("@/pages/Prove"));
const Resolve = lazy(() => import("@/pages/Resolve"));
const ProductDNA = lazy(() => import("@/pages/ProductDNA"));
const Ship = lazy(() => import("@/pages/Ship"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--uf-bg)]">
      <div className="flex items-center gap-3">
        <span className="uf-dot uf-dot-accent uf-anim-pulse" aria-hidden />
        <span className="uf-mono text-[11px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
          Loading module
        </span>
      </div>
    </div>
  );
}

/**
 * UNIFORGE routing:
 *  /               marketing landing
 *  /auth           sign in (returns to /command-center)
 *  /command-center the operational master screen
 *  /intake /forge /prove /resolve /product-dna /ship
 *  /product/:id    full product record
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage redirectAfterAuth="/command-center" />} />

        {/* Authenticated application shell — navigation persists across modules */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/forge" element={<Forge />} />
          <Route path="/prove" element={<Prove />} />
          <Route path="/resolve" element={<Resolve />} />
          <Route path="/product-dna" element={<ProductDNA />} />
          <Route path="/ship" element={<Ship />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
