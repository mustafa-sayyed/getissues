import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(16,185,129,.18),transparent_45%),radial-gradient(circle_at_86%_20%,rgba(251,146,60,.14),transparent_42%),radial-gradient(circle_at_55%_85%,rgba(14,165,233,.15),transparent_40%)]" />

      <Header />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-0 sm:px-10 lg:px-12 lg:pt-18">
        <div className="inline-flex w-fit items-center justify-center self-center mx-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-800">
          Built for open-source contributors
        </div>

        <div className="text-center">
          <div className="space-y-8 flex flex-col items-center justify-center">
            <h1 className="max-w-2xl text-4xl font-semibold font-geist-sans leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Stop hunting for issues.
              <span className="block text-emerald-700">
                AI Agents find them for you while you sleep.
              </span>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
              AI agents match your skills to real open issues, filter noisy
              repositories, and send curated opportunities to your app feed or
              Notion while you sleep.
            </p>

            <div className="flex flex-col gap-3 mt-4 sm:flex-row">
              <a
                href="#waitlist"
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-6 text-base font-medium text-white transition hover:bg-emerald-700"
              >
                Get Early Access
              </a>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 text-base font-medium text-slate-800 transition hover:border-slate-400 hover:bg-white"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12 lg:py-16"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white/80 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Skill-Aware Matching
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              LLM semantic ranking understands your stack and filters out
              irrelevant issues.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/80 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Delivered to your Notion
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Matched issues sync to your Notion database with score, labels,
              and repo context.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/80 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Campaign Modes
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Specialized issue search for Hacktoberfest, GSoC, and LFX, GSSoC
              tracks.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/80 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Semantically Watch Repos
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              semantically watch repo that match your skills and interests without noise from irrelevant issues.
            </p>
          </article>
        </div>
      </section>

      <section
        id="waitlist"
        className="mx-auto w-full max-w-4xl px-6 pb-20 pt-8 sm:px-10 lg:pb-28"
      >
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-8 sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Be first to try GetIssues
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
            Join the early waitlist and help shape the best AI workflow for
            open-source issue discovery and contribution tracking.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:hello@getissues.dev?subject=GetIssues%20Early%20Access"
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Join the Waitlist
            </a>
            <a
              href="https://github.com/mustafa-sayyed/getissues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-medium text-slate-800 transition hover:border-slate-400"
            >
              Follow Project Updates
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
