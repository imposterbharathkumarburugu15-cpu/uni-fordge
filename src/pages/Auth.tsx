import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Mono, Timestamp } from "@/components/common/Mono";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { useConflicts, useProducts, useSystemStatus } from "@/hooks/use-forge-store";
import { STAGES } from "@/utils/pipeline";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="uf-grid-bg flex min-h-screen flex-col bg-[var(--uf-bg-deep)] text-[var(--uf-text-primary)]">
      {/* top bar */}
      <header className="border-b border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-4 px-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="UNIFORGE — back to home"
            className="cursor-pointer"
          >
            <Logo
              className="text-[17px] text-[var(--uf-text-primary)]"
              markClassName="text-[var(--uf-accent)]"
            />
          </button>
          <span className="uf-mono ml-auto text-[10px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
            Operator access
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-[1120px] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* access panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="uf-panel overflow-hidden"
          >
            <div className="border-b border-[var(--uf-border-faint)] px-6 py-5">
              <p className="uf-eyebrow">UniForge · Access Control</p>
              <h1 className="mt-3 text-[22px] font-bold uppercase tracking-tight">
                {step === "signIn" ? "Operator sign-in" : "Code verification"}
              </h1>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--uf-text-secondary)]">
                {step === "signIn"
                  ? "Authenticate to enter the product data operations console. Email OTP or anonymous session."
                  : `A 6-digit access code was sent to ${step.email}.`}
              </p>
            </div>

            {step === "signIn" ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5 px-6 py-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="operator-email"
                    className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]"
                  >
                    Operator email
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--uf-text-tertiary)]"
                      aria-hidden
                    />
                    <Input
                      id="operator-email"
                      name="email"
                      placeholder="name@company.com"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                      className="h-11 cursor-text border-[var(--uf-border-strong)] bg-[var(--uf-surface)] pl-10 text-[14px] text-[var(--uf-text-primary)] focus-visible:ring-[var(--uf-accent)]"
                    />
                  </div>
                </div>

                {error && (
                  <p className="uf-mono text-[11px] uppercase tracking-[0.08em] text-[var(--uf-critical)]">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 cursor-pointer rounded-sm bg-[var(--uf-accent)] text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Sending code
                    </>
                  ) : (
                    <>
                      Request access code
                      <ArrowRight className="size-4" aria-hidden />
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-3" aria-hidden>
                  <span className="h-px flex-1 bg-[var(--uf-border-faint)]" />
                  <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                    Or continue without account
                  </span>
                  <span className="h-px flex-1 bg-[var(--uf-border-faint)]" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="h-11 cursor-pointer rounded-sm border-[var(--uf-border-strong)] bg-transparent text-[12.5px] uppercase tracking-[0.1em] text-[var(--uf-text-secondary)] hover:bg-[var(--uf-surface-raised)] hover:text-[var(--uf-text-primary)]"
                >
                  <UserX className="size-4 text-[var(--uf-accent)]" aria-hidden />
                  Continue as guest
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5 px-6 py-6">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />

                <div className="flex flex-col items-center gap-1.5">
                  <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                    Enter access code
                  </span>
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (e.target as HTMLElement).closest("form");
                        if (form) form.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="size-11 cursor-text border-[var(--uf-border-strong)] bg-[var(--uf-surface)] text-[16px] text-[var(--uf-text-primary)] first:rounded-l-sm last:rounded-r-sm"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="uf-mono text-center text-[11px] uppercase tracking-[0.08em] text-[var(--uf-critical)]">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="h-11 cursor-pointer rounded-sm bg-[var(--uf-accent)] text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Verifying
                    </>
                  ) : (
                    <>
                      <KeyRound className="size-4" aria-hidden />
                      Verify code
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("signIn")}
                  disabled={isLoading}
                  className="h-9 cursor-pointer text-[11.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)] hover:text-[var(--uf-text-primary)]"
                >
                  Use different email
                </Button>
              </form>
            )}

            <div className="border-t border-[var(--uf-border-faint)] bg-[var(--uf-bg-raised)] px-6 py-3">
              <p className="uf-mono text-center text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                Secured by Convex Auth · Email OTP ·{" "}
                <a
                  href="https://freebuff.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--uf-accent)] hover:text-[var(--uf-accent-bright)]"
                >
                  freebuff.com
                </a>
              </p>
            </div>
          </motion.div>

          {/* live system readout */}
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="hidden flex-col gap-4 lg:flex"
            aria-label="Live pipeline status"
          >
            <div className="uf-panel overflow-hidden">
              <div className="uf-panel-head">
                <h2 className="uf-section-title">
                  <span className="idx">SYS</span>
                  Pipeline Status
                </h2>
              </div>
              <PipelineReadout />
            </div>
            <div className="uf-panel overflow-hidden">
              <div className="uf-panel-head">
                <h2 className="uf-section-title">
                  <span className="idx">NET</span>
                  System
                </h2>
              </div>
              <SystemReadout />
            </div>
          </motion.aside>
        </div>
      </main>

      <footer className="border-t border-[var(--uf-border-faint)] py-4">
        <p className="uf-mono text-center text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
          UniForge · Product intelligence for industrial commerce
        </p>
      </footer>
    </div>
  );
}

function PipelineReadout() {
  const system = useSystemStatus();
  const products = useProducts();
  const conflicts = useConflicts();
  const open = conflicts.filter((c) => c.status === "OPEN").length;
  const verified = products.filter(
    (p) =>
      p.attributes.length > 0 &&
      p.attributes.every((a) => a.verification === "VERIFIED"),
  ).length;

  return (
    <div className="p-4">
      <ul className="flex flex-col gap-1">
        {STAGES.map((s) => {
          const count = system.pipelineCounts[s.stage] ?? 0;
          const isResolve = s.stage === "RESOLVE";
          return (
            <li
              key={s.stage}
              className="flex items-center gap-3 border-b border-[var(--uf-border-faint)] py-2 last:border-b-0"
            >
              <span className="uf-mono w-6 text-[10px] text-[var(--uf-accent)]">
                {s.index}
              </span>
              <span className="uf-mono flex-1 text-[10.5px] uppercase tracking-[0.1em] text-[var(--uf-text-secondary)]">
                {s.label}
              </span>
              {isResolve && open > 0 ? (
                <span className="uf-dot uf-dot-warning" aria-hidden />
              ) : (
                <span className="uf-dot uf-dot-muted" aria-hidden />
              )}
              <span className="uf-mono w-8 text-right text-[12px] text-[var(--uf-text-primary)]">
                {String(count).padStart(2, "0")}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-[var(--uf-border-faint)] pt-3">
        <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          Verified records
        </span>
        <span className="uf-mono text-[12px] text-[var(--uf-success)]">
          {String(verified).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function SystemReadout() {
  const system = useSystemStatus();
  const conflicts = useConflicts();
  const open = conflicts.filter((c) => c.status === "OPEN").length;

  return (
    <div className="flex flex-col gap-2.5 p-4">
      <Row label="API" value={system.apiStatus}>
        <span
          className={`uf-dot ${
            system.apiStatus === "OPERATIONAL" ? "uf-dot-success" : "uf-dot-warning"
          }`}
          aria-hidden
        />
      </Row>
      <Row label="Open conflicts" value={`${open}`} />
      <Row label="Intake queue" value={`${system.intakeQueue} docs`} />
      <Row label="Ship ready" value={`${system.shipReady} products`} />
      <Row label="Operator" value={`${system.operator} / ${system.operatorRole}`} />
      <Row label="Last sync" value={<Timestamp iso={system.lastSync} />} />
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="uf-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
        {children}
        {label}
      </span>
      <Mono className="text-[11px] text-[var(--uf-text-primary)]">{value}</Mono>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
