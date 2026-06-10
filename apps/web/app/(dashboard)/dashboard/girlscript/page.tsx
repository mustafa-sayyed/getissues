"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sprout,
  Bot,
  Send,
  Star,
  ExternalLink,
  CircleDot,
  Heart,
  Users,
  Code2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const gssocIssues = [
  {
    id: 1,
    title: "Add multilingual support for landing page",
    repo: "GirlScriptSummerOfCode/gssoc-website",
    stars: 1200,
    difficulty: "Easy",
    points: 25,
    language: "TypeScript",
  },
  {
    id: 2,
    title: "Implement dark mode for dashboard components",
    repo: "GirlScriptSummerOfCode/gssoc-app",
    stars: 890,
    difficulty: "Medium",
    points: 50,
    language: "JavaScript",
  },
  {
    id: 3,
    title: "Create reusable card component for project listing",
    repo: "GirlScriptSummerOfCode/gssoc-portal",
    stars: 650,
    difficulty: "Easy",
    points: 25,
    language: "TypeScript",
  },
  {
    id: 4,
    title: "Add analytics tracking for user activity",
    repo: "GirlScriptSummerOfCode/gssoc-dashboard",
    stars: 430,
    difficulty: "Hard",
    points: 100,
    language: "TypeScript",
  },
  {
    id: 5,
    title: "Fix responsive layout on mobile devices",
    repo: "GirlScriptSummerOfCode/gssoc-website",
    stars: 1200,
    difficulty: "Easy",
    points: 25,
    language: "CSS",
  },
  {
    id: 6,
    title: "Optimize image loading with lazy load",
    repo: "GirlScriptSummerOfCode/gssoc-app",
    stars: 890,
    difficulty: "Medium",
    points: 50,
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
  CSS: "bg-pink-500",
};

const pointsColor: Record<string, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-red-600 dark:text-red-400",
};

type Message = { id: string; role: "user" | "assistant"; content: string };

function getGssocResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("easy") || lower.includes("beginner")) {
    return "Here are the **easiest GSSoC issues** to get started:\n\n🌿 `gssoc-website` — Add multilingual support (25 pts)\n🌿 `gssoc-portal` — Create reusable card component (25 pts)\n🌿 `gssoc-website` — Fix responsive layout (25 pts)\n\nAll are great starting points! Start with fixing the responsive layout if you're new.";
  }
  if (lower.includes("point") || lower.includes("score")) {
    return "GSSoC scoring system:\n\n- **Easy issues** = 25 points\n- **Medium issues** = 50 points\n- **Hard issues** = 100 points\n\nYou currently have **0 points**. Complete issues to climb the leaderboard! 🏆";
  }
  if (lower.includes("how") || lower.includes("start") || lower.includes("apply")) {
    return "To participate in **Girlscript Summer of Code**:\n\n1. Register at **gssoc.girlscript.tech**\n2. Browse participating projects\n3. Pick issues labeled `gssoc`\n4. Submit PRs and get them merged\n5. Earn points and climb the leaderboard!\n\nThe event runs **May–August** every year. 🌱";
  }
  return `🌿 Found **${gssocIssues.length} GSSoC issues** for you!\n\nI recommend starting with easy issues to get familiar with the codebase, then moving to medium ones for more points.\n\nWould you like to filter by difficulty or points?`;
}

export default function GirlscriptPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "🌿 Welcome to **Girlscript Summer of Code**!\n\nI'm your AI agent specialized in GSSoC issues. I'll help you find the best issues to contribute to and maximize your points.\n\n**Current Stats:**\n- 15 open issues across 4 repos\n- Your points: 0\n\nWhat would you like to work on today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1000));
    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getGssocResponse(text),
    };
    setMessages((p) => [...p, reply]);
    setIsTyping(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="size-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
              Girlscript Summer of Code
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Grow with Open Source 🌱
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm md:text-base">
            GSSoC connects{" "}
            <span className="text-emerald-500 font-semibold">students</span>{" "}
            with open source projects. Earn points by contributing and win
            exciting prizes.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 rounded-lg px-3 py-2">
              <Code2 className="size-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Issues Open</p>
                <p className="text-sm font-bold text-foreground">15 issues</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 rounded-lg px-3 py-2">
              <Users className="size-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Contributors</p>
                <p className="text-sm font-bold text-foreground">2.4k+</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 rounded-lg px-3 py-2">
              <Heart className="size-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Your Points</p>
                <p className="text-sm font-bold text-foreground">0 pts</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 size-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              GSSoC Issues
            </h2>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              {gssocIssues.length} open
            </Badge>
          </div>

          <div className="space-y-2">
            {gssocIssues.map((issue) => (
              <Card
                key={issue.id}
                className="border-border/60 hover:border-emerald-500/30 transition-all group cursor-pointer"
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <CircleDot className="size-3.5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-emerald-500 transition-colors line-clamp-1">
                          {issue.title}
                        </p>
                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                        {issue.repo}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div
                          className={`size-2 rounded-full ${langColor[issue.language] ?? "bg-gray-400"}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {issue.language}
                        </span>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${difficultyColor[issue.difficulty]}`}
                        >
                          {issue.difficulty}
                        </Badge>
                        <div className="ml-auto flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${pointsColor[issue.difficulty]}`}
                          >
                            +{issue.points} pts
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="size-3" />
                            {issue.stars}
                          </span>
                        </div>
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
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <Bot className="size-4 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                GSSoC AI Agent
              </h2>
              <p className="text-xs text-muted-foreground">
                Your Girlscript guide
              </p>
            </div>
            <Badge className="ml-auto gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </Badge>
          </div>

          <div
            className="flex-1 flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden"
            style={{ minHeight: 360 }}
          >
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3 pb-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2 items-start",
                      msg.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          msg.role === "assistant"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <Sprout className="size-3.5" />
                        ) : (
                          "U"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                        msg.role === "assistant"
                          ? "bg-muted/60 text-foreground rounded-tl-sm"
                          : "bg-emerald-500 text-white rounded-tr-sm"
                      )}
                    >
                      {msg.content.split("\n").map((line, i) => {
                        const f = line
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(
                            /`(.*?)`/g,
                            '<code class="bg-black/10 px-1 rounded text-xs font-mono">$1</code>'
                          );
                        return (
                          <span
                            key={i}
                            dangerouslySetInnerHTML={{ __html: f }}
                            className="block leading-5"
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="bg-emerald-500/15 text-emerald-500 text-xs">
                        <Sprout className="size-3.5" />
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

            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {[
                  "Find easy issues",
                  "How does scoring work?",
                  "How to participate?",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-600 border border-border/60 hover:border-emerald-500/30 transition-colors text-muted-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border/60 p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about GSSoC..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage(input);
                  }}
                  className="flex-1 h-8 text-sm bg-muted/40 border-border/60 focus-visible:ring-emerald-500/40"
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  className="size-8 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                >
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
