import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(var(--spotlight-emerald),.18),transparent_45%),radial-gradient(circle_at_86%_20%,rgba(var(--spotlight-amber),.14),transparent_42%),radial-gradient(circle_at_55%_85%,rgba(var(--spotlight-sky),.15),transparent_40%)]" />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-14 sm:px-10 lg:px-12 lg:pt-18">
        <div className="mx-auto inline-flex w-fit items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          Built for open-source contributors
        </div>

        <div className="text-center">
          <div className="space-y-8 flex flex-col items-center justify-center">
            <h1 className="max-w-2xl text-4xl font-bold font-heading leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Stop hunting for issues.
              <span className="block text-primary">
                AI Agents find them for you while you sleep.
              </span>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              AI agents match your skills to real open issues, filter noisy
              repositories, and send curated opportunities to your app feed or
              Notion while you sleep.
            </p>

            <div className="flex flex-col gap-3 mt-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 text-base text-white dark:text-black"
              >
                <a href="#waitlist">Get Early Access</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 border-border/70 bg-card/80 px-6 text-base text-foreground"
              >
                <a href="#features">See How It Works</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12 lg:py-16"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Skill-Aware Matching
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              LLM semantic ranking understands your stack and filters out
              irrelevant issues.
            </p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Delivered to your Notion
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Matched issues sync to your Notion database with score, labels,
              and repo context.
            </p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Campaign Modes
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Specialized issue search for Hacktoberfest, GSoC, and LFX, GSSoC
              tracks.
            </p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Semantically Watch Repos
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              semantically watch repo that match your skills and interests
              without noise from irrelevant issues.
            </p>
          </article>
        </div>
      </section>

      <section
        id="waitlist"
        className="mx-auto w-full max-w-4xl px-6 pb-20 pt-8 sm:px-10 lg:pb-28"
      >
        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-[oklch(var(--accent-wash-1))] to-[oklch(var(--accent-wash-2))] p-8 sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Be first to try GetIssues
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Join the early waitlist and help shape the best AI workflow for
            open-source issue discovery and contribution tracking.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 px-6 text-sm text-white dark:text-black"
            >
              <a href="mailto:hello@getissues.dev?subject=GetIssues%20Early%20Access">
                Join the Waitlist
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 border-border/70 bg-card/80 px-6 text-sm"
            >
              <a
                href="https://github.com/mustafa-sayyed/getissues"
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow Project Updates
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
