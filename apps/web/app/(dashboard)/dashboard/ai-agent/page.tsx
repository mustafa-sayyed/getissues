"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  User,
  Sparkles,
  CircleDot,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const suggestions = [
  "Find good first issues in TypeScript projects",
  "What React issues match my skill level?",
  "Show me Hacktoberfest eligible issues",
  "Suggest issues for a beginner in open source",
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "👋 Hi there! I'm your AI Agent, specialized in finding open source issues that match your skills and interests.\n\nI can help you:\n• Discover beginner-friendly issues\n• Filter issues by language or framework\n• Find Hacktoberfest or GSSoC opportunities\n• Explain what a contribution involves\n\nWhat would you like to explore today?",
    timestamp: new Date(),
  },
];

function simulateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("typescript") || lower.includes("ts")) {
    return "I found **12 TypeScript issues** matching your profile!\n\n**Top picks:**\n- `microsoft/TypeScript` — Improve type inference for generics (Hard)\n- `colinhacks/zod` — Add Zod v4 validation support (Medium)\n- `shadcn-ui/ui` — Add dark mode to more components (Easy)\n\nWould you like me to show the full list or filter further?";
  }
  if (lower.includes("react")) {
    return "Here are some great **React issues** for you:\n\n1. **facebook/react** — Update documentation for hooks (*Easy*)\n2. **vercel/next.js** — Fix hydration mismatch in SSR (*Medium*)\n3. **tanstack/query** — Add retry logic for mutations (*Medium*)\n\nAll of these are open and unassigned. Want details on any specific one?";
  }
  if (lower.includes("beginner") || lower.includes("good first")) {
    return "Perfect for getting started! Here are **8 beginner-friendly issues**:\n\n✅ `vercel/next.js` — Fix typo in error message\n✅ `facebook/react` — Add missing JSDoc comments\n✅ `shadcn-ui/ui` — Update storybook examples\n✅ `colinhacks/zod` — Add good first issue label to backlog\n\nAll labeled `good first issue`. Ready to dive in?";
  }
  if (lower.includes("hacktoberfest")) {
    return "🎃 **Hacktoberfest** is a great opportunity! I found **7 eligible issues**:\n\n- `tailwindlabs/tailwindcss` — Refactor CSS tokens (Easy)\n- `prisma/prisma` — Fix null handling edge case (Medium)\n- `framer/motion` — Performance regression fix (Hard)\n\nThese all have the `hacktoberfest` label. Want to see them in the Issues tab?";
  }
  return "Great question! Let me analyze your profile and search for the best matching issues...\n\nI found **24 issues** that could be a great fit for you across various repositories. The top matches are in **TypeScript**, **React**, and **documentation** categories.\n\nWould you like me to filter by difficulty, language, or a specific area?";
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: simulateResponse(text),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content.split("\n").map((line, i) => {
      const boldFormatted = line.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>",
      );
      const codeFormatted = boldFormatted.replace(
        /`(.*?)`/g,
        '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>',
      );
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: codeFormatted }}
          className="block leading-6"
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="size-6 text-primary" />
            AI Agent
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personal open source issue finder
          </p>
        </div>
        <Badge
          variant="secondary"
          className="gap-1.5 bg-primary/10 text-primary border-primary/20"
        >
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Online
        </Badge>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-border/60 bg-card overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 items-start",
                  msg.role === "user" && "flex-row-reverse",
                )}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold",
                      msg.role === "assistant"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-muted/60 text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm",
                  )}
                >
                  <div className="space-y-0.5">
                    {formatContent(msg.content)}
                  </div>
                  <p
                    className={cn(
                      "text-[10px] mt-2 opacity-60",
                      msg.role === "user" ? "text-right" : "text-left",
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 items-start">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
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

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="size-3" />
              Try asking...
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/60 hover:border-primary/30 transition-colors text-muted-foreground"
                >
                  <CircleDot className="size-2.5 shrink-0" />
                  {s}
                  <ChevronRight className="size-2.5 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/60 p-3 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <Input
              ref={inputRef}
              placeholder="Ask me to find issues for you..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-muted/40 border-border/60 focus-visible:ring-primary/40 resize-none"
              disabled={isTyping}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="shrink-0 size-9"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Press Enter to send · AI responses are simulated
          </p>
        </div>
      </div>
    </div>
  );
}
