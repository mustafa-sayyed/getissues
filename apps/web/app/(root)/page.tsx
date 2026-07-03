"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={19} height={19}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}
function IconNotion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={19} height={19}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </svg>
  );
}
function IconFlag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={19} height={19}>
      <path d="M5 3v18M5 4h11l-2 4 2 4H5" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={19} height={19}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Pipeline steps ────────────────────────────────────────────────────────────
const PIPELINE = [
  {
    num: "01",
    title: "Reads your stack",
    desc: "Pulls your languages, frameworks, and past contributions to build a skill profile.",
  },
  {
    num: "02",
    title: "Scans open issues",
    desc: "Semantically ranks issues across watched and trending repos against that profile.",
  },
  {
    num: "03",
    title: "Filters the noise",
    desc: "Drops stale, mislabeled, or out-of-scope issues before they ever reach you.",
  },
  {
    num: "04",
    title: "Syncs to Notion",
    desc: "Matched issues land in your database with score, labels, and repo context.",
  },
];

// ─── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    accent: "amber" as const,
    tab: "match.ts",
    Icon: IconTarget,
    title: "Skill-Aware Matching",
    desc: "LLM semantic ranking reads your stack and skips issues that don't actually fit it.",
  },
  {
    accent: "green" as const,
    tab: "sync.notion",
    Icon: IconNotion,
    title: "Delivered to Your Notion",
    desc: "Matched issues sync to your Notion database with score, labels, and repo context attached.",
  },
  {
    accent: "indigo" as const,
    tab: "campaigns.json",
    Icon: IconFlag,
    title: "Campaign Modes",
    desc: "Switch on focused search for Hacktoberfest, GSoC, GSSoC, and LFX tracks.",
  },
  {
    accent: "coral" as const,
    tab: "watch.yml",
    Icon: IconEye,
    title: "Semantic Repo Watch",
    desc: "Watch repos that match your interests, without the noise from issues you'd never touch.",
  },
];

const ACCENT_CLASSES = {
  amber: {
    tab: "bg-[var(--gi-amber)]",
    icon: "bg-[var(--gi-amber-dim)] text-[var(--gi-amber)]",
    border: "hover:border-[var(--gi-amber)]",
  },
  green: {
    tab: "bg-[var(--gi-green)]",
    icon: "bg-[var(--gi-green-dim)] text-[var(--gi-green)]",
    border: "hover:border-[var(--gi-green)]",
  },
  indigo: {
    tab: "bg-[var(--gi-indigo)]",
    icon: "bg-[var(--gi-indigo-dim)] text-[var(--gi-indigo)]",
    border: "hover:border-[var(--gi-indigo)]",
  },
  coral: {
    tab: "bg-[var(--gi-coral)]",
    icon: "bg-[var(--gi-coral-dim)] text-[var(--gi-coral)]",
    border: "hover:border-[var(--gi-coral)]",
  },
};

// ─── Agent Feed issues ─────────────────────────────────────────────────────────
const ISSUES = [
  { id: "#1247", title: "fix: cursor pagination skips last page", tags: ["good-first-issue", "typescript"], match: "94% match", filtered: false },
  { id: "#1198", title: "docs: fix typo in CONTRIBUTING.md", tags: ["docs"], match: "filtered", filtered: true },
  { id: "#0892", title: "feat: add retry backoff to webhook queue", tags: ["go", "backend"], match: "88% match", filtered: false },
  { id: "#1410", title: "chore: bump dependency versions", tags: ["chore"], match: "filtered", filtered: true },
];

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <main className="gi-page relative isolate overflow-hidden">
      {/* Background layers */}
      <div className="gi-bg-texture" aria-hidden />
      <div className="gi-bg-grid" aria-hidden />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="gi-wrap gi-hero-grid gi-section-hero">
        {/* Left col */}
        <div>
          <span className="gi-eyebrow">Built for open-source contributors</span>
          <h1 className="gi-h1">
            Stop hunting for issues.<br />
            <span className="gi-accent">AI agents find them</span><br />
            <span className="gi-muted">while you sleep.</span>
          </h1>
          <p className="gi-lead">
            Agents read your stack, match it against real open issues, filter out the noisy
            repos, and drop curated opportunities straight into your Notion workspace.
          </p>
          <div className="gi-hero-ctas">
            <Link href="#waitlist" className="gi-btn gi-btn-primary">Get Early Access</Link>
            <Link href="#features" className="gi-btn gi-btn-ghost">See How It Works</Link>
          </div>
          <div className="gi-hero-meta">$ tracks --supported · gsoc · gssoc · lfx · hacktoberfest</div>
        </div>

        {/* Right col — Agent feed card */}
        <div className="gi-agent-feed">
          <div className="gi-feed-bar">
            <div className="gi-feed-dots">
              <span className="gi-dot gi-dot-amber" />
              <span className="gi-dot gi-dot-green" />
              <span className="gi-dot gi-dot-coral" />
            </div>
            <span className="gi-feed-bar-title">agent-feed.live</span>
            <span />
          </div>

          <div className="gi-feed-body">
            <div className="gi-scan-line" aria-hidden />
            {ISSUES.map((issue) => (
              <div key={issue.id} className={`gi-issue-row${issue.filtered ? " gi-filtered" : ""}`}>
                <span className="gi-issue-id">{issue.id}</span>
                <div className="gi-issue-info">
                  <div className="gi-issue-title">{issue.title}</div>
                  <div className="gi-issue-tags">
                    {issue.tags.map((t) => (
                      <span key={t} className="gi-tag">{t}</span>
                    ))}
                  </div>
                </div>
                {issue.filtered ? (
                  <span className="gi-filtered-badge">filtered</span>
                ) : (
                  <span className="gi-match-badge">{issue.match}</span>
                )}
              </div>
            ))}
          </div>

          <div className="gi-feed-footer">
            <div className="gi-sync-pill">
              <span className="gi-dot gi-dot-green gi-dot-sm" />
              2 matches synced to Notion
            </div>
            <span className="gi-font-mono gi-scanning">scanning…</span>
          </div>
        </div>
      </section>

      {/* ── PIPELINE ─────────────────────────────────────────────── */}
      <section className="gi-wrap gi-pipeline" id="how-it-works">
        <div className="gi-section-head">
          <span className="gi-section-tag">// how it works</span>
          <h2 className="gi-h2">One pipeline, from your stack to your task list.</h2>
          <p className="gi-section-desc">
            Every issue that reaches you has already passed through four real checks — not a
            marketing funnel, the actual order the agent works in.
          </p>
        </div>
        <div className="gi-pipeline-row">
          {PIPELINE.map((step, i) => (
            <div key={step.num} className={`gi-pipe-step${i < PIPELINE.length - 1 ? " gi-pipe-step-arrow" : ""}`}>
              <div className="gi-pipe-num">{step.num}</div>
              <h3 className="gi-pipe-title">{step.title}</h3>
              <p className="gi-pipe-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="gi-wrap gi-features" id="features">
        <div className="gi-section-head">
          <span className="gi-section-tag">// capabilities</span>
          <h2 className="gi-h2">Four agents, one feed.</h2>
        </div>
        <div className="gi-feature-grid">
          {FEATURES.map(({ accent, tab, Icon, title, desc }) => {
            const cls = ACCENT_CLASSES[accent];
            return (
              <div key={tab} className={`gi-feature-card ${cls.border}`}>
                <div className="gi-feature-tab">
                  <span className="gi-feature-tab-name">{tab}</span>
                  <span className={`gi-feature-tab-dot ${cls.tab}`} />
                </div>
                <div className="gi-feature-body">
                  <div className={`gi-feature-icon ${cls.icon}`}>
                    <Icon />
                  </div>
                  <h3 className="gi-feature-title">{title}</h3>
                  <p className="gi-feature-desc">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── WAITLIST / TERMINAL ───────────────────────────────────── */}
      <section className="gi-wrap gi-cta-section" id="waitlist">
        <div className="gi-terminal">
          <div className="gi-terminal-top">
            <div className="gi-feed-dots">
              <span className="gi-dot gi-dot-amber" />
              <span className="gi-dot gi-dot-green" />
              <span className="gi-dot gi-dot-coral" />
            </div>
            <span className="gi-terminal-title">getissues — early-access@waitlist</span>
          </div>

          <div className="gi-terminal-body">
            <div className="gi-term-line">
              <span className="gi-term-prompt">$</span>
              <span>whoami</span>
            </div>
            <div className="gi-term-line">
              <span className="gi-term-prompt">&nbsp;</span>
              <span className="gi-term-out">open-source contributor, prepping for the next cohort</span>
            </div>
            <div className="gi-term-line">
              <span className="gi-term-prompt">$</span>
              <span>status</span>
            </div>
            <div className="gi-term-line">
              <span className="gi-term-prompt">&nbsp;</span>
              <span className="gi-term-out">
                {submitted ? "✓ you're on the list — we'll be in touch soon!" : "waiting for early access"}
              </span>
            </div>

            {!submitted ? (
              <form className="gi-term-form" onSubmit={handleSubmit}>
                <span className="gi-term-prompt">$</span>
                <input
                  ref={emailRef}
                  className="gi-term-input"
                  type="email"
                  placeholder="you@domain.dev"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="gi-btn gi-btn-primary gi-btn-mono" type="submit">
                  join --now
                </button>
              </form>
            ) : (
              <div className="gi-term-line" style={{ marginTop: "18px" }}>
                <span className="gi-term-prompt" style={{ color: "var(--gi-green)" }}>✓</span>
                <span className="gi-term-out" style={{ color: "var(--gi-green)" }}>
                  subscribed successfully
                </span>
                <span className="gi-cursor-blink" />
              </div>
            )}

            {!submitted && <span className="gi-cursor-blink" />}
          </div>

          <div className="gi-term-foot">
            <div className="gi-live-count">
              <span className="gi-dot gi-dot-green gi-dot-sm" />
              247 developers already in line
            </div>
            <a
              href="https://github.com/mustafa-sayyed/getissues"
              target="_blank"
              rel="noopener noreferrer"
              className="gi-font-mono gi-github-link"
            >
              Follow Project Updates →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="gi-footer">
        <div className="gi-wrap gi-footer-inner">
          <div className="gi-footer-logo">
            <span className="gi-status-dot" />
            <span className="gi-font-allan gi-logo-text">getissues</span>
          </div>
          <div className="gi-footer-links">
            <a href="https://github.com/mustafa-sayyed/getissues" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#features">Features</a>
            <a href="#waitlist">Early Access</a>
          </div>
          <div className="gi-font-mono gi-copyright">© 2026 getissues</div>
        </div>
      </footer>
    </main>
  );
}
