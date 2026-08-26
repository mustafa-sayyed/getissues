"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  BotMessageSquare,
  CircleDot,
  GitBranch,
  LoaderCircle,
  MessageSquarePlus,
  Sparkles,
  Star,
  Trash2,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type StoredMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

type ToolIssue = {
  title: string;
  description?: string | null;
  url: string;
  state?: string;
  similarity?: number | null;
  matchScore?: number | null;
  repo?: {
    name?: string | null;
    languages?: string[] | null;
    stars?: number | null;
  } | null;
};

type ToolPartLike = {
  type: string;
  state?: string;
  output?: unknown;
};

const isIssuesOutput = (output: unknown): ToolIssue[] | null => {
  if (typeof output !== "object" || output === null) return null;

  const record = output as Record<string, unknown>;
  const list = record.issues ?? record.recommendations;

  if (!Array.isArray(list)) return null;

  return list.filter(
    (item): item is ToolIssue =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as ToolIssue).title === "string",
  );
};

const formatScore = (score: number | null | undefined) => {
  if (typeof score !== "number") return null;
  return `${Math.round(score * 100)}%`;
};

function IssueCards({ issues }: { issues: ToolIssue[] }) {
  if (!issues.length) return null;

  return (
    <div className="grid w-full gap-2.5">
      {issues.slice(0, 6).map((issue) => {
        const score =
          formatScore(issue.matchScore) ?? formatScore(issue.similarity);

        return (
          <Card key={issue.url} className="gap-2 border-border/60 py-3.5">
            <CardContent className="space-y-2 px-4">
              <div className="flex items-start justify-between gap-3">
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-start gap-2 text-[15px] font-medium leading-6 hover:text-primary"
                >
                  <CircleDot className="mt-1 size-4 shrink-0 text-primary" />
                  <span className="min-w-0">{issue.title}</span>
                </a>
                {score && (
                  <Badge className="shrink-0 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                    {score}
                  </Badge>
                )}
              </div>

              {issue.description && (
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {issue.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {issue.repo?.name && (
                  <span className="flex items-center gap-1">
                    <GitBranch className="size-3.5" />
                    {issue.repo.name}
                  </span>
                )}
                {typeof issue.repo?.stars === "number" && (
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5" />
                    {issue.repo.stars.toLocaleString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AssistantToolPart({ part }: { part: ToolPartLike }) {
  const issues = isIssuesOutput(part.output);

  if (issues) {
    return <IssueCards issues={issues} />;
  }

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wrench className="size-3.5 animate-pulse" />
        Working...
      </div>
    );
  }

  return null;
}

function AssistantMessage({ message }: { message: UIMessage }) {
  const hasVisibleContent = message.parts.some(
    (part) =>
      part.type === "text" ||
      (part.type.startsWith("tool-") &&
        ["input-streaming", "input-available", "output-available"].includes(
          (part as unknown as ToolPartLike).state ?? "",
        )),
  );

  if (!hasVisibleContent) return null;

  return (
    <>
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          if (!part.text.trim()) return null;

          return (
            <MessageResponse
              key={index}
              className="text-[15px] leading-7 [&_code]:text-[13px]"
            >
              {part.text}
            </MessageResponse>
          );
        }

        if (part.type.startsWith("tool-")) {
          return (
            <AssistantToolPart
              key={index}
              part={part as unknown as ToolPartLike}
            />
          );
        }

        return null;
      })}
    </>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1 text-[15px] text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" />
      Thinking...
    </div>
  );
}

function ChatPanel({
  sessionId,
  initialMessages,
  onStreamFinished,
}: {
  sessionId: string | null;
  initialMessages: UIMessage[];
  onStreamFinished?: () => void;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${process.env.NEXT_PUBLIC_API_URL}/chats/stream`,
        credentials: "include",
        body: sessionId ? { sessionId } : undefined,
      }),
    [sessionId],
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
    messages: initialMessages,
    onError: (event) => {
      toast.error(event?.message ?? "Failed to send message.");
    },
    onFinish: () => onStreamFinished?.(),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSubmit = useCallback(
    ({ text }: { text: string }) => {
      if (!text.trim() || isStreaming) return;
      void sendMessage({ text });
    },
    [isStreaming, sendMessage],
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border/60">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-8 md:px-8">
          {messages.length === 0 && !isStreaming ? (
            <ConversationEmptyState
              icon={<BotMessageSquare className="size-10 text-primary" />}
              title="How can I help you find issues?"
              description="Tell me your skills and interests, ask what has been recommended to you, or search for issues to contribute to."
              className="py-24"
            />
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                from={message.role}
                className="max-w-full"
              >
                <MessageContent
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-[15px] leading-7"
                      : "w-full max-w-none text-[15px] leading-7"
                  }
                >
                  {message.role === "assistant" ? (
                    <AssistantMessage message={message} />
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {message.parts
                        .map((part) => (part.type === "text" ? part.text : ""))
                        .join("")}
                    </p>
                  )}
                </MessageContent>
              </Message>
            ))
          )}

          {isStreaming && <ThinkingIndicator />}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              Something went wrong. Please try again.
            </div>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t border-border/60 bg-background/80 p-3 md:p-4">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            onSubmit={handleSubmit}
            className="rounded-xl border-border/60"
          >
            <PromptInputBody>
              <PromptInputTextarea
                name="message"
                placeholder="Ask about issues, share your preferences..."
                className="min-h-14 text-[15px] leading-6"
              />
            </PromptInputBody>
            <PromptInputFooter className="items-center justify-between">
              <PromptInputTools />
              <PromptInputSubmit
                status={status}
                onStop={() => stop()}
                size="icon-sm"
                className="size-9 rounded-lg"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);

    try {
      const { data } = await api.get<{ sessions: ChatSession[] }>(
        "/chats/sessions",
      );
      setSessions(data.sessions);
    } catch {
      toast.error("Failed to load chat sessions.");
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!activeSessionId) {
      setInitialMessages([]);
      return;
    }

    setIsLoadingHistory(true);

    api
      .get<{ messages: StoredMessage[] }>(
        `/chats/sessions/${activeSessionId}/messages`,
      )
      .then(({ data }) =>
        setInitialMessages(
          data.messages.map((message) => ({
            id: message.id,
            role: message.role === "assistant" ? "assistant" : "user",
            parts: [{ type: "text" as const, text: message.content }],
          })),
        ),
      )
      .catch(() => toast.error("Failed to load chat history."))
      .finally(() => setIsLoadingHistory(false));
  }, [activeSessionId]);

  const startNewChat = () => {
    setActiveSessionId(null);
    setInitialMessages([]);
  };

  const deleteSession = async (
    event: React.MouseEvent,
    sessionId: string,
  ) => {
    event.stopPropagation();

    try {
      await api.delete(`/chats/sessions/${sessionId}`);
      setSessions((current) =>
        current.filter((session) => session.id !== sessionId),
      );

      if (activeSessionId === sessionId) {
        startNewChat();
      }
    } catch {
      toast.error("Failed to delete chat.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          AI Assistant
          <Sparkles className="size-5 text-primary" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chat about your preferences and discover recommended issues
        </p>
      </div>

      <div className="grid h-[calc(100vh-190px)] min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-2 lg:flex">
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={startNewChat}
          >
            <MessageSquarePlus className="size-4" />
            New chat
          </Button>

          <div className="text-xs font-medium text-muted-foreground">
            Recent
          </div>

          <ScrollArea className="-mr-2 flex-1 pr-2">
            {isLoadingSessions ? (
              <div className="space-y-2 pt-1">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No chats yet
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      activeSessionId === session.id
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="min-w-0 truncate">{session.title}</span>
                    <Trash2
                      className="hidden size-3.5 shrink-0 group-hover:block hover:text-red-500"
                      onClick={(event) =>
                        void deleteSession(event, session.id)
                      }
                    />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        <main className="min-h-0">
          {activeSessionId && isLoadingHistory ? (
            <div className="flex h-full flex-col gap-4 rounded-lg border border-border/60 p-6">
              <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl" />
              <Skeleton className="h-20 w-4/5 rounded-xl" />
              <Skeleton className="ml-auto h-10 w-1/3 rounded-2xl" />
              <Skeleton className="h-16 w-3/4 rounded-xl" />
            </div>
          ) : (
            <ChatPanel
              key={activeSessionId ?? "new"}
              sessionId={activeSessionId}
              initialMessages={initialMessages}
              onStreamFinished={fetchSessions}
            />
          )}
        </main>
      </div>
    </div>
  );
}
