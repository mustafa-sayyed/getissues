"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { Thread } from "@/components/assistant-ui/thread";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/ai-sdk";
import type { UIMessage } from "ai";
import {
  BotMessageSquare,
  CircleDot,
  GitBranch,
  Sparkles,
  Star,
  Trash2,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Custom tool fallback that renders IssueCards for our recommendation/search tools
function CustomToolFallback(props: React.ComponentProps<typeof ToolFallback>) {
  // ToolFallback props include result, toolName, status etc.
  // We check if result contains issues/recommendations
  const result = props.result;
  const issues = isIssuesOutput(result);
  if (issues && issues.length > 0) {
    return <IssueCards issues={issues} />;
  }
  return <ToolFallback {...props} />;
}

function CustomWelcome() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <BotMessageSquare className="size-10 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">
        How can I help you find issues?
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Tell me your skills and interests, ask what has been recommended to you,
        or search for issues to contribute to.
      </p>
    </div>
  );
}

function AssistantChat({
  sessionId,
  initialMessages,
  onNewSessionId,
}: {
  sessionId: string | null;
  initialMessages: UIMessage[];
  onNewSessionId: (sessionId: string) => void;
}) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: `${process.env.NEXT_PUBLIC_API_URL}/chats/stream`,
        credentials: "include" as const,
        body: currentSessionId ? { sessionId: currentSessionId } : undefined,
      }),
    [currentSessionId],
  );

  const runtime = useChatRuntime({
    transport,
    messages: initialMessages,
    onData: (event) => {
      if (event.type === "data-custom") {
        const newSessionId = (event.data as { sessionId?: unknown }).sessionId;

        if (typeof newSessionId === "string" && newSessionId) {
          onNewSessionId(newSessionId);
          setCurrentSessionId(newSessionId);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message ?? "Failed to send message.");
    },
  });

  const threadComponents = useMemo(
    () => ({
      ToolFallback: CustomToolFallback,
      Welcome: CustomWelcome,
    }),
    [],
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full flex-col rounded-lg border border-border/60">
        <Thread components={threadComponents} />
      </div>
    </AssistantRuntimeProvider>
  );
}

export default function AssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const newSessionId = useRef<string | null>(null);

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
        `/chats/sessions/${activeSessionId ?? newSessionId.current}/messages`,
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

  const handleNewSessionId = useCallback((sessionId: string) => {
    if (newSessionId.current === sessionId) return;

    newSessionId.current = sessionId;
  }, []);

  const startNewChat = () => {
    setActiveSessionId(null);
    setInitialMessages([]);
  };

  const deleteSession = async (event: React.MouseEvent, sessionId: string) => {
    event.stopPropagation();
    try {
      await api.delete(`/chats/sessions/${sessionId}`);
      toast.success("Chat deleted.");
      setSessions((current) => current.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) startNewChat();
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
            className="justify-start gap-2 p-4 rounded-lg cursor-pointer"
            onClick={startNewChat}
          >
            <Plus className="size-4" />
            New chat
          </Button>
          <div className="text-xs font-medium text-muted-foreground">
            Recent
          </div>
          <ScrollArea className="-mr-2 flex-1 pr-2">
            {isLoadingSessions ? (
              <div className="space-y-2 pt-1">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
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
                    className={`group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                      activeSessionId === session.id
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="min-w-0 overflow-x-visible">
                      {session.title}
                    </span>
                    <Trash2
                      className="hidden size-3.5 shrink-0 group-hover:block hover:text-red-500"
                      onClick={(e) => void deleteSession(e, session.id)}
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
            <AssistantChat
              key={activeSessionId ?? "new"}
              sessionId={activeSessionId}
              initialMessages={initialMessages}
              onNewSessionId={handleNewSessionId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
