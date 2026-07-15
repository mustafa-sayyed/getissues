import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PitchPage() {
  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(var(--spotlight-emerald),.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(var(--spotlight-amber),.14),transparent_36%),linear-gradient(180deg,transparent,rgba(255,255,255,.03))]" />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="max-w-3xl space-y-5">
          <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Project pitch
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-heading">
            Watch the getissues pitch video.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A quick walkthrough of the problem, the agent workflow, and how the
            app helps contributors find better issues faster.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="aspect-video w-full bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/bQhGpZkdrOI`}
              title="getissues pitch video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-border/60 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Ready to keep going?
              </h2>
              <p className="text-sm text-muted-foreground">
                Jump back to the homepage or sign in to try the app.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="rounded-none">
                <Link href="/">Back home</Link>
              </Button>
              <Button
                asChild
                className="rounded-none text-white dark:text-black"
              >
                <Link href="/login">Start with GitHub</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
