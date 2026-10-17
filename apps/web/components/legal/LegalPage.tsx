import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  heading: string;
  content: ReactNode;
};

type LegalPageProps = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(var(--spotlight-emerald),.14),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(var(--spotlight-amber),.1),transparent_36%)]" />

      <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="max-w-3xl space-y-5">
          <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Legal
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:gap-16">
          <nav
            aria-label="On this page"
            className="lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:shrink-0"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl flex-1 space-y-10">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 space-y-4"
              >
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                  {section.heading}
                </h2>
                <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-foreground">
                  {section.content}
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className="mt-16 border-t border-border/50 pt-8 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link href="/" className="transition hover:text-primary">
              Back home
            </Link>
            <Link href="/terms" className="transition hover:text-primary">
              Terms of Service
            </Link>
            <Link
              href="/privacy-policy"
              className="transition hover:text-primary"
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:support@getissues.tech"
              className="transition hover:text-primary"
            >
              support@getissues.tech
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            getissues.tech — getissues is an independent project and is not
            affiliated with or endorsed by GitHub, Inc.
          </p>
        </footer>
      </section>
    </main>
  );
}
