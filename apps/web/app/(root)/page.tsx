import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, howItWorks, memory, problemSolution } from "./constant";
import * as motion from "framer-motion/client";


export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(var(--spotlight-emerald),.18),transparent_45%),radial-gradient(circle_at_86%_20%,rgba(var(--spotlight-amber),.14),transparent_42%),radial-gradient(circle_at_55%_85%,rgba(var(--spotlight-sky),.15),transparent_40%)]" />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pb-16 pt-14 text-center sm:px-10 lg:px-12 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary"
        >
          Built for open-source contributors
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col items-center gap-6"
        >
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
              className="h-12 px-6 text-base text-white dark:text-black rounded-none"
            >
              <a href="/login">Start Using getissues for Free</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-border/70 bg-card/80 px-6 text-base text-foreground rounded-none"
            >
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── PROBLEM VS SOLUTION ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24"
      >
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-medium text-primary">
            The old way is broken
          </p>
          <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl">
            Why finding issues feels like a full-time job.
          </h2>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            There are millions of repos in github, finding from them is hard
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {problemSolution.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative group"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-xl">
                <div className="p-6 border-b border-border/40 bg-muted/20">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-medium leading-relaxed text-muted-foreground">
                    <span className="font-bold text-foreground block mb-1">
                      Problem:
                    </span>
                    {item.problem}
                  </h3>
                </div>
                <div className="p-6 bg-primary/5 grow">
                  <h3 className="text-sm font-medium leading-relaxed text-primary/90">
                    <span className="font-bold text-primary block mb-1">
                      How we solve it:
                    </span>
                    {item.solution}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <motion.div
        id="how-it-works"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20"
      >
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium text-primary">
            Simple process
          </p>
          <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Three steps, then the agent handles everything else.
          </p>
        </div>

        <div className="relative grid gap-6 sm:grid-cols-3">
          {/* Connector line between step cards */}
          <div className="absolute top-10 left-[calc(16.6%+16px)] right-[calc(16.6%+16px)] hidden h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 sm:block" />

          {howItWorks.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative rounded-2xl border border-border/70 bg-card/80 p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                {s.step}
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── MEMORY SECTION ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20"
      >
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-[oklch(var(--accent-wash-1))] to-[oklch(var(--accent-wash-2))] px-8 py-12 sm:px-12">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <span>🧠</span> Memory &amp; context powered by Cognee
          </div>
          <h2 className="max-w-xl text-3xl font-bold font-heading tracking-tight sm:text-4xl">
            It learns you. Not just your stack — your taste.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Persistent preferences that improve with every session — no manual
            tuning required.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {memory.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: (i * 0.1) + 0.1, ease: "easeOut" }}
                className="rounded-2xl border border-border/60 bg-background/60 p-5 backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-primary/30 hover:bg-background/80"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">{c.icon}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
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
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── PROGRAMS ─────────────────────────────────────────────── */}
      <motion.div
        id="programs"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20"
      >
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium text-primary">Programs</p>
          <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl">
            Built for every contribution program.
          </h2>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Whether you&apos;re applying to GSoC, LFX, or hunting Hacktoberfest
            issues — the agent has a dedicated mode for it.
          </p>
        </div>

        {/* Bento-style layout: big GSoC card + 2 stacked cards */}
        <div className="grid gap-5 lg:grid-cols-5">
          {/* GSoC — wide featured card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-3"
          >
            <div className="group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-[oklch(var(--accent-wash-1))] to-[oklch(var(--accent-wash-2))] p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
              {/* Decorative circle */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/8 transition-transform duration-500 group-hover:scale-125" />
              <div className="absolute right-5 top-5">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/25">
                  Coming Soon
                </span>
              </div>
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                    🏆
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-primary/70">
                      GSoC
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Google Summer of Code
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground max-w-sm">
                  Match your skills to project ideas from{" "}
                  <span className="font-semibold text-foreground">
                    180+ orgs
                  </span>{" "}
                  before proposals open. Get ahead of the crowd with semantic
                  skill matching and personalised org recommendations.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Personalised Skill based project recommendation", "Org discovery"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </motion.div>

          {/* Right column — LFX + Hacktoberfest stacked */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex-1"
            >
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-sky-500/6 transition-transform duration-500 group-hover:scale-125" />
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
                    Coming Soon
                  </span>
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-xl">
                    🎓
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-sky-500/80">
                      LFX
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      LFX Mentorship
                    </h3>
                  </div>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Recommends mentorship projects that match with your skills so you can apply to the right ones.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Project recommendation", "Skill match"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-sky-500/20 bg-sky-500/5 px-2.5 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex-1"
            >
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-orange-500/6 transition-transform duration-500 group-hover:scale-125" />
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
                    Coming Soon
                  </span>
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                    🎃
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-orange-500/80">
                      Hacktoberfest
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      Hacktoberfest
                    </h3>
                  </div>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Agent scans repos with the hacktoberfest label so you never
                  miss a valid issue during the event.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Label based issue search", "Instant notifications"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-orange-500/20 bg-orange-500/5 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── FEATURE DEEP-DIVE ────────────────────────────────────── */}
      <motion.div
        id="features"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24"
      >
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-medium text-primary">Features</p>
          <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl">
            Everything the agent does for you.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:col-span-8 flex"
          >
            <div className="flex flex-col justify-between rounded-3xl border border-border/40 bg-gradient-to-br from-card/60 to-background/30 backdrop-blur-xl p-8 w-full transition-all hover:border-primary/40 hover:shadow-xl">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                  🎯
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Skill-aware semantic matching
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground max-w-lg">
                  LLM-powered semantic ranking understands your full stack — not
                  just keyword overlap. It distinguishes between "used React
                  once" and "built production apps with React."
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:col-span-4 flex"
          >
            <div className="flex flex-col justify-between rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md p-8 w-full transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/20 text-2xl">
                📊
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  Repo Checks
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The agent checks last commit date, maintainer response time,
                  CONTRIBUTING.md, and Filter out Spams.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:col-span-5 flex"
          >
            <div className="flex flex-col justify-between rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md p-8 w-full transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl">
                🤖
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  Autonomous Agent
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Our agent wakes up every few hours, searches issues for you,
                  score them gainst your evolving profile adn recommend them to
                  you.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:col-span-7 flex"
          >
            <div className="flex flex-col justify-between rounded-3xl border border-border/40 bg-gradient-to-tr from-card/60 to-background/30 backdrop-blur-xl p-8 w-full transition-all hover:border-primary/40 hover:shadow-xl">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
                  📬
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Delivers to app, Notion, or email
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
                  Get a ranked feed inside the app, sync issues to a Notion
                  database with match score + labels, or receive a digest email.
                  You choose the delivery channel.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto w-full max-w-3xl px-6 py-14 sm:px-10 lg:py-20"
      >
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium text-primary">FAQ</p>
          <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl">
            Common questions
          </h2>
        </div>
        <Accordion
          collapsible={true}
          autoCapitalize="sentences"
          type="single"
          defaultValue={"item-1"}
          className="py-4 px-10"
        >
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.value}
              value={faq.value}
              className="cursor-pointer text-base rounded-md py-1 px-4"
            >
              <AccordionTrigger className="text-base cursor-pointer">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-[14px]">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <motion.div
        id="waitlist"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto w-full max-w-4xl px-6 pb-20 pt-8 sm:px-10 lg:pb-28"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-[oklch(var(--accent-wash-1))] to-[oklch(var(--accent-wash-2))] p-10 text-center sm:p-16 shadow-lg">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold font-heading tracking-tight sm:text-5xl">
              Get early access — it&apos;s free.
            </h2>
            <p className="mt-4 mx-auto max-w-lg text-lg text-muted-foreground">
              Start using the AI agent now{" "}
              <strong className="text-foreground">
                before a paywall comes.
              </strong>{" "}
              Lock in your free tier access today.
            </p>

            <div className="mt-10 flex justify-center">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-base font-semibold text-white dark:text-black rounded-full shadow-lg hover:scale-101 transition-transform duration-300"
              >
                <a href="/login">Log in to get started &rarr;</a>
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
              <a href="#programs" className="transition hover:text-primary">
                Programs
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
