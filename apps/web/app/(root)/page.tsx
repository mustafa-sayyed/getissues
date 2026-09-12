import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, howItWorks, memory, problemSolution } from "./constant";
import * as motion from "framer-motion/client";
import {
  ArrowRight,
  Bookmark,
  Bot,
  Check,
  Diamond,
  EyeOff,
  Hourglass,
  Inbox,
  MessagesSquare,
  Puzzle,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

const problemIcons = [Hourglass, Zap, Puzzle];
const memoryIcons = [EyeOff, Bookmark, MessagesSquare];

const tickerItems = [
  "Find your first issue",
  "Skip dead repos",
  "Know why it matches",
  "Never search manually",
  "Ship your first PR",
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

function SectionHeading({
  index,
  kicker,
  title,
}: {
  index: string;
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-12">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.35em] text-primary">
        {index} — {kicker}
      </p>
      <h2 className="mt-4 max-w-2xl font-heading text-4xl font-black tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(var(--spotlight-emerald),.18),transparent_45%),radial-gradient(circle_at_86%_20%,rgba(var(--spotlight-amber),.14),transparent_42%),radial-gradient(circle_at_55%_85%,rgba(var(--spotlight-sky),.15),transparent_40%)]" />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-10 text-center sm:px-10 lg:px-12 lg:pt-14">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium tracking-wider text-primary"
        >
          Built for Open Source Contributors
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mx-auto mt-8 font-heading text-5xl font-black uppercase leading-[0.95] tracking-tighter sm:text-7xl lg:text-8xl"
        >
          Stop{" "}
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeInOut" }}
            className="relative inline-block"
          >
            searching.
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.7, ease: "easeInOut" }}
              className="absolute left-[-1%] top-[45%] h-[0.2em] w-full origin-left rounded-full bg-black"
            />
          </motion.span>
          <span className="block text-primary">Start contributing.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
          className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground"
        >
          Lost in GitHub&rsquo;s millions of repos? Tell us your stack once —
          agents score open issues against your skills and drop curated matches
          in your feed, while you sleep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
          className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="h-12 rounded-none px-8 text-base text-white dark:text-black"
          >
            <Link href="/login">Start contributing</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-none border-border/70 bg-card/80 px-8 text-base text-foreground"
          >
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          {["Free to Use", "60-second setup", "No filters to configure"].map(
            (item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="size-3.5 text-primary" />
                {item}
              </span>
            ),
          )}
        </motion.div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="overflow-hidden bg-primary mt-15"
      >
        <motion.div
          className="flex w-max items-center gap-10 py-3 pl-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 36, ease: "linear" }}
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-10 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-white dark:text-black"
            >
              {item}
              <span className="opacity-60">
                <Diamond />
              </span>
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── 01 PROBLEM ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24"
      >
        <SectionHeading
          index="01"
          kicker="The problem"
          title="Finding issues feels like a full-time job."
        />

        <div className="border-b border-border/60">
          {problemSolution.map((item, i) => {
            const Icon = problemIcons[i % problemIcons.length];
            const step = String(i + 1).padStart(2, "0");
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                className="grid gap-3 border-t border-border/60 py-8 md:grid-cols-12 md:items-center md:gap-6"
              >
                <span className="font-heading text-5xl font-black tracking-tighter text-primary/25 md:col-span-2">
                  {step}
                </span>
                <p className="font-heading text-2xl font-bold leading-snug text-foreground md:col-span-5">
                  {item.problem}
                </p>
                <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground md:col-span-5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>
                  {item.solution}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── 02 HOW IT WORKS ──────────────────────────────────────── */}
      <motion.div
        id="how-it-works"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14 sm:px-10 lg:px-12 lg:py-20"
      >
        <SectionHeading
          index="02"
          kicker="How it works"
          title="Three steps. Zero searching."
        />

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
          {howItWorks.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
            >
              <p className="font-heading text-7xl font-black tracking-tighter text-primary">
                {s.step}
              </p>
              <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── 03 MEMORY ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20"
      >
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-[oklch(var(--accent-wash-1))] to-[oklch(var(--accent-wash-2))] px-8 py-12 sm:px-12">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.35em] text-primary">
            03 — Memory
          </p>
          <h2 className="mt-4 max-w-xl font-heading text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            It learns your taste. Not just your stack.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every vote and dismissal teaches the agent. No settings, no manual
            filters — your feed reshapes itself around what you actually pick.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {memory.map((c, i) => {
              const Icon = memoryIcons[i % memoryIcons.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1 + 0.1,
                    ease: "easeOut",
                  }}
                  className="rounded-2xl border border-border/60 bg-background/60 p-5 backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-primary/30 hover:bg-background/80"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {c.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {c.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── 04 FEATURES ──────────────────────────────────────────── */}
      <motion.div
        id="features"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-16 sm:px-10 lg:px-12 lg:py-24"
      >
        <SectionHeading
          index="04"
          kicker="Features"
          title="Everything the agent does for you."
        />

        <div className="grid gap-6 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex md:col-span-8"
          >
            <div className="flex w-full flex-col justify-between rounded-3xl border border-border/40 bg-gradient-to-br from-card/60 to-background/30 p-8 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Target className="size-7 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Skill-aware semantic matching
                </h3>
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                  LLM-powered ranking understands your full stack — not just
                  keyword overlap. It knows the difference between &ldquo;used
                  React once&rdquo; and &ldquo;ships production React.&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="flex md:col-span-4"
          >
            <div className="flex w-full flex-col justify-between rounded-3xl border border-border/40 bg-card/40 p-8 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                <ShieldCheck className="size-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  Repo health checks
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Last commit date, maintainer response time, contributing docs
                  — spam filtered before it reaches you.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="flex md:col-span-5"
          >
            <div className="flex w-full flex-col justify-between rounded-3xl border border-border/40 bg-card/40 p-8 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                <Bot className="size-6 text-amber-500" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  Runs while you sleep
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The agent wakes every few hours, scores fresh issues against
                  your evolving profile, and queues your next matches.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="flex md:col-span-7"
          >
            <div className="flex w-full flex-col justify-between rounded-3xl border border-border/40 bg-gradient-to-tr from-card/60 to-background/30 p-8 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                <Inbox className="size-7 text-indigo-500" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Delivered where you work
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  A ranked feed in the app, synced to Notion, or in your inbox.
                  Every match ships with a score and the reason it picked you.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── 05 FAQ ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.35em] text-primary">
                05 - FAQ
              </p>
              <h2 className="mt-4 font-heading text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                Questions, answered.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                Anything else on your mind? Log in and ask the in-app assistant
                — it knows every corner of the product.
              </p>
            </div>
          </div>
          <Accordion
            collapsible={true}
            type="single"
            defaultValue={"item-1"}
            className="border-b border-border/60 lg:col-span-7"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.value}
                value={faq.value}
                className="cursor-pointer border-t border-border/60 px-2"
              >
                <AccordionTrigger className="cursor-pointer gap-4 py-5 text-left font-heading text-lg font-bold hover:no-underline sm:text-xl">
                  <span className="shrink-0 font-mono text-sm font-medium text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-10 text-[15px] leading-7 text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.div>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <motion.div
        id="waitlist"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="w-full scroll-mt-20 bg-primary"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 text-center sm:px-10 sm:py-24 lg:px-12">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.35em] text-white/80 dark:text-black/70">
              06 — Get started
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl font-heading text-5xl font-black uppercase leading-[0.95] tracking-tighter text-white dark:text-black sm:text-7xl">
              Your first match is waiting.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/85 dark:text-black/70">
              Free to start. Tell the agent your stack once — wake up to issues
              worth your time.
            </p>

            <div className="mt-10 flex justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-14 rounded-none px-10 text-base font-semibold "
              >
                <Link href="/login" className="flex items-center gap-2">
                  Log in to get started
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-background/90">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-2xl font-black tracking-tight text-foreground">
                getissues.tech
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your AI agent for open source contribution.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <a href="#how-it-works" className="transition hover:text-primary">
                How it works
              </a>
              <a href="#features" className="transition hover:text-primary">
                Features
              </a>
              <a href="/login" className="transition hover:text-primary">
                Get Started
              </a>
              <a
                href="https://github.com/mustafa-sayyed/getissues"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-primary"
              >
                GitHub
              </a>
            </nav>
          </div>
          <div className="mt-8 border-t border-border/40 pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} getissues.tech - Built for open-source
            contributors.
          </div>
        </div>
      </footer>

      {/* TYPOGRAPHIC MARK AT THE BOTTOM */}
      <div className="pointer-events-none w-full overflow-hidden leading-none select-none flex justify-center pb-2">
        <h1 className="font-heading font-black text-[12vw] mb-10 tracking-tighter text-primary/50 text-manrope whitespace-nowrap">
          getissues.tech
        </h1>
      </div>
    </main>
  );
}
