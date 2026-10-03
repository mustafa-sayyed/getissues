import { FetchingState } from "@/components/onboarding/fetching-state";

/**
 * Loading state for the onboarding page. This component is displayed
 * instantly while the page awaits for session + skills data to load.
 * Same loader as the Suspense fallback so the handoff between the two
 * waits is seamless.
 */
export default function OnboardingLoading() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(var(--spotlight-emerald),.16),transparent_45%),radial-gradient(circle_at_88%_18%,rgba(var(--spotlight-amber),.12),transparent_42%),radial-gradient(circle_at_55%_90%,rgba(var(--spotlight-sky),.13),transparent_40%)]" />

      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-10 sm:pt-14">
        <FetchingState />
      </div>
    </main>
  );
}
