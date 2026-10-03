import type { Vibe } from "@/types/onboarding";

export function composeInterests(vibe: Vibe): string {
  const parts = [`${vibe.journey} contributor`];
  if (vibe.flavors.length > 0) {
    parts.push(`enjoys ${vibe.flavors.join(", ")}`);
  }
  const note = vibe.note.trim();
  if (note) {
    parts.push(`Note: ${note}`);
  }
  return parts.join(". ") + ".";
}

export function track(event: string, properties?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const posthog = require("posthog-js").default;
    posthog?.capture?.(event, properties);
  } catch {
    // Analytics must never break onboarding.
  }
}
