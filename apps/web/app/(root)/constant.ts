export const faqs = [
  {
    value: "item-1",
    q: "How getissues work?",
    a: "getissues runs background workflows that search smartly for issues on github, and ingest them in database, then A background agent scores issues against your skill and preference profile, and sends you curated issues in your feed.",
  },
  {
    value: "item-2",
    q: "How is this different from GitHub's built-in search?",
    a: "GitHub search is keyword-based and static — you have to run it yourself every time. getissues uses semantic LLM matching, scores issues against your skills, and runs as a background agent that learns your preferences over time.",
  },
  {
    value: "item-3",
    q: "Is it free?",
    a: "Yes. getissues is free right now. Start using it before a paywall comes for advanced features.",
  },
  {
    value: "item-4",
    q: "Which contribution programs does it support?",
    a: "getissues currently supports generals issue resommendation, Support for GSoC, LFX Mentorship, and Hacktoberfest is coming soon.",
  },
];

export const problemSolution = [
  {
    problem: "Spent hours finding an issue, maintainer never replied.",
    solution: "We filter by maintainer response times and repo activity.",
    icon: "⏳",
  },
  {
    problem: "Good first issues get claimed in minutes.",
    solution: "Our background agent alerts you the moment a match drops.",
    icon: "⚡",
  },
  {
    problem: "Every repo looks fine until you open the codebase.",
    solution: "We score repos on contribution docs and CI health.",
    icon: "🧩",
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Tell us your stack",
    desc: "Add your languages, frameworks, and contribution goals. Takes 60 seconds.",
  },
  {
    step: "02",
    title: "Agent runs every few hours",
    desc: "The agent scores open issues across thousands of repos against your skill + preference profile.",
  },
  {
    step: "03",
    title: "Curated issues in your feed",
    desc: "Issues arrive in the app, Notion, or email — each with a match score and repo health summary.",
  },
];

export const memory = [
  {
    icon: "👋",
    label: "Passive signal",
    title: "You dismiss a React issue",
    desc: "Agent quietly stops surfacing frontend issues — no settings changed, no manual filter.",
  },
  {
    icon: "🔖",
    label: "Positive signal",
    title: "You bookmark a Go issue",
    desc: "Agent starts recommending Go even if it wasn't in your original profile.",
  },
  {
    icon: "💬",
    label: "Explicit context",
    title: '"Backend only, good docs"',
    desc: "Told to the assistant once, remembered across every future session automatically.",
  },
];
