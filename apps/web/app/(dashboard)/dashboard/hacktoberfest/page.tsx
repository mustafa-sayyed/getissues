"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Flame,
  Bot,
  Send,
  Star,
  GitFork,
  ExternalLink,
  CircleDot,
  Trophy,
  Target,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const hacktoberfestIssues = [
  {
    id: 1,
    title: "Refactor CSS variable tokens to use new format",
    repo: "tailwindlabs/tailwindcss",
    stars: 84000,
    forks: 4100,
    difficulty: "Easy",
    language: "JavaScript",
  },
  {
    id: 2,
    title: "Fix null handling edge case in query builder",
    repo: "prisma/prisma",
    stars: 38000,
    forks: 1500,
    difficulty: "Medium",
    language: "TypeScript",
  },
  {
    id: 3,
    title: "Performance regression in animation loop",
    repo: "framer/motion",
    stars: 24000,
    forks: 800,
    difficulty: "Hard",
    language: "TypeScript",
  },
  {
    id: 4,
    title: "Add missing aria-label to icon buttons",
    repo: "shadcn-ui/ui",
    stars: 74000,
    forks: 4500,
    difficulty: "Easy",
    language: "TypeScript",
  },
  {
    id: 5,
    title: "Update changelog for v4 release",
    repo: "colinhacks/zod",
    stars: 33000,
    forks: 1200,
    difficulty: "Easy",
    language: "TypeScript",
  },
  {
    id: 6,
    title: "Add support for custom serializers",
    repo: "tanstack/query",
    stars: 41000,
    forks: 2800,
    difficulty: "Medium",
    language: "TypeScript",
  },
  {
    id: 7,
    title: "Fix stale closure in useEffect hook",
    repo: "facebook/react",
    stars: 227000,
    forks: 46500,
    difficulty: "Medium",
    language: "JavaScript",
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0",
  Hard: "bg-red-500/15 text-red-600 dark:text-red-400 border-0",
};

const langColor: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
};

type Message = { id: string; role: "user" | "assistant"; content: string };

const hacktoberfestResponses: Record<string, string> = {
  default:
    "I'm your **Hacktoberfest AI Agent**! 🎃 I'm specialized in finding the best `hacktoberfest` labeled issues.\n\nThis year's event runs **October 1–31**. Complete 4 PRs to earn exclusive rewards!\n\nWould you like me to find issues matching your skills?",
  easy: "Here are the **easiest Hacktoberfest issues** for you:\n\n✅ `tailwindlabs/tailwindcss` — Refactor CSS tokens (Easy)\n✅ `shadcn-ui/ui` — Add missing aria-labels (Easy)\n✅ `colinhacks/zod` — Update changelog (Easy)\n\nAll beginner-friendly and unassigned. Start contributing! 🚀",
  help: "To participate in Hacktoberfest:\n\n1. Register at **hacktoberfest.com**\n2. Submit **4 valid PRs** in October\n3. PRs must be to repos with `hacktoberfest` topic\n4. Each PR must be approved or merged\n\nI'll help you find the best issues to target!",
};

function getHacktoberfestResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("easy") || lower.includes("beginner"))
    return hacktoberfestResponses.easy;
  if (lower.includes("how") || lower.includes("participate") || lower.includes("help"))
    return hacktoberfestResponses.help;
  return `🎃 Found **${hacktoberfestIssues.length} Hacktoberfest issues** for you!\n\nTop pick: **${hacktoberfestIssues[0]?.repo}** — ${hacktoberfestIssues[0]?.title}\n\nWant me to filter by difficulty or language?`;
}

export default function HacktoberfestPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: hacktoberfestResponses.default },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1000));
    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getHacktoberfestResponse(text),
    };
    setMessages((p) => [...p, reply]);
    setIsTyping(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-background to-red-500/5 p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="size-5 text-orange-500" />
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              Hacktoberfest 2025
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Contribute. Earn. Repeat. 🎃
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm md:text-base">
            Complete{" "}
            <span className="text-orange-500 font-semibold">4 pull requests</span>{" "}
            in October and earn exclusive Hacktoberfest rewards. Your AI agent
            finds the best matching issues.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-orange-500/10 rounded-lg px-3 py-2">
              <Target className="size-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-sm font-bold text-foreground">0 / 4 PRs</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-orange-500/10 rounded-lg px-3 py-2">
              <Trophy className="size-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Reward</p>
                <p className="text-sm font-bold text-foreground">Digital Badge</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 size-48 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Eligible Issues
            </h2>
            <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20">
              {hacktoberfestIssues.length} found
            </Badge>
          </div>
          <div className="space-y-2">
            {hacktoberfestIssues.map((issue) => (
              <Card
                key={issue.id}
                className="border-border/60 hover:border-orange-500/30 transition-all group cursor-pointer"
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                      <CircleDot className="size-3.5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-orange-500 transition-colors line-clamp-1">
                          {issue.title}
                        </p>
                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {issue.repo}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={`size-2 rounded-full ${langColor[issue.language] ?? "bg-gray-400"}`} />
                        <span className="text-xs text-muted-foreground">{issue.language}</span>
                        <Badge className={`text-[10px] px-1.5 py-0 ${difficultyColor[issue.difficulty]}`}>
                          {issue.difficulty}
                        </Badge>
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3" />
                          {(issue.stars / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Chatbot */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/15">
              <Bot className="size-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Hacktoberfest AI Agent
              </h2>
              <p className="text-xs text-muted-foreground">
                Ask me about the event
              </p>
            </div>
            <Badge className="ml-auto gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
              <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
              Online
            </Badge>
          </div>

          <div className="flex-1 flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden" style={{ minHeight: 360 }}>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3 pb-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2 items-start", msg.role === "user" && "flex-row-reverse")}>
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className={cn("text-xs", msg.role === "assistant" ? "bg-orange-500/15 text-orange-500" : "bg-muted text-muted-foreground")}>
                        {msg.role === "assistant" ? <Flame className="size-3.5" /> : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed", msg.role === "assistant" ? "bg-muted/60 text-foreground rounded-tl-sm" : "bg-orange-500 text-white rounded-tr-sm")}>
                      {msg.content.split("\n").map((line, i) => {
                        const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, '<code class="bg-black/10 px-1 rounded text-xs font-mono">$1</code>');
                        return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="block leading-5" />;
                      })}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="bg-orange-500/15 text-orange-500 text-xs">
                        <Flame className="size-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/60 rounded-xl rounded-tl-sm px-3 py-2">
                      <div className="flex gap-1 items-center h-4">
                        <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                        <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                        <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {["Find easy issues", "How to participate?", "TypeScript issues"].map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="text-xs px-2.5 py-1 rounded-full bg-muted/60 hover:bg-orange-500/10 hover:text-orange-600 border border-border/60 hover:border-orange-500/30 transition-colors text-muted-foreground">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border/60 p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about Hacktoberfest..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                  className="flex-1 h-8 text-sm bg-muted/40 border-border/60 focus-visible:ring-orange-500/40"
                  disabled={isTyping}
                />
                <Button size="icon" className="size-8 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}>
                  <Send className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
