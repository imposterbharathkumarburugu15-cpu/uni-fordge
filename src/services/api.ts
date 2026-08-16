/** Simulated network latency for mock adapters. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Base URL placeholder for the future FastAPI backend. */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
