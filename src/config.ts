/** App-wide settings. Open business decisions live here so they can change without code edits. */
export const config = {
  /** Monthly PlatoListo Plus price in EUR. `null` until the business plan sets it. */
  plusPriceEur: null as number | null,
  /** Base URL of the Cloudflare Worker proxy. Empty string means live services are off. */
  workerUrl: (import.meta.env.VITE_WORKER_URL as string | undefined) ?? '',
  budget: { min: 1, max: 10, step: 0.5, default: 3 },
  /** "≤ N min" filter on the dishes screen. */
  quickMinutes: 20,
} as const;
