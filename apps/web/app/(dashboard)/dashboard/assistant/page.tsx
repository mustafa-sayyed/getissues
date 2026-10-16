"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  MessageSquare,
  Star,
  Trash2,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  status?: string | null;
  similarity?: number | null;
  matchScore?: number | null;
  repo?: {
    name?: string | null;
    languages?: string[] | null;
    stars?: number | null;
  } | null;
};

type RecommendationResult = {
  matchScore?: number | null;
  reason?: string | null;
  issue?: {
    title?: string;
    description?: string | null;
    url?: string;
    status?: string | null;
  } | null;
  repo?: ToolIssue["repo"];
};

const toToolIssue = (item: unknown): ToolIssue | null => {
  if (typeof item !== "object" || item === null) return null;
  const record = item as Record<string, unknown>;
  // Flat shape (search_issues tool): { title, url, … }
  if (typeof record.title === "string" && typeof record.url === "string") {
    return item as ToolIssue;
  }
  // Nested shape (get_recommendations tool): { issue: {…}, repo, matchScore }
  const nested = item as RecommendationResult;
  if (
    nested.issue &&
    typeof nested.issue.title === "string" &&
    typeof nested.issue.url === "string"
  ) {
    return {
      title: nested.issue.title,
      description: nested.issue.description ?? null,
      url: nested.issue.url,
      status: nested.issue.status ?? null,
      matchScore: nested.matchScore ?? null,
      repo: nested.repo ?? null,
    };
  }
  return null;
};

const isIssuesOutput = (output: unknown): ToolIssue[] | null => {
  if (typeof output !== "object" || output === null) return null;
  const record = output as Record<string, unknown>;
  const list = record.issues ?? record.recommendations;
  if (!Array.isArray(list)) return null;
  const issues = list
    .map(toToolIssue)
    .filter((item): item is ToolIssue => item !== null);
  return issues.length > 0 ? issues : null;
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    sessionId,
  );

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
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyReload, setHistoryReload] = useState(0);
  const [chatKey, setChatKey] = useState(0);
  const [isChatsMenuOpen, setIsChatsMenuOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!activeSessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialMessages([]);
      setHistoryError(null);
      return;
    }
    const controller = new AbortController();
    setIsLoadingHistory(true);
    setHistoryError(null);

    api
      .get<{ messages: StoredMessage[] }>(
        `/chats/sessions/${activeSessionId}/messages`,
        { signal: controller.signal },
      )
      .then(({ data }) =>
        setInitialMessages(
          data.messages
            .filter((message) => message.role !== "system")
            .map((message) => ({
              id: message.id,
              role: message.role === "assistant" ? "assistant" : "user",
              parts: [{ type: "text" as const, text: message.content }],
            })),
        ),
      )
      .catch((error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "ERR_CANCELED"
        ) {
          return;
        }
        setHistoryError("Could not load this chat's messages.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingHistory(false);
      });

    return () => controller.abort();
  }, [activeSessionId, historyReload]);

  const handleNewSessionId = useCallback((sessionId: string) => {
    if (newSessionId.current === sessionId) return;
    newSessionId.current = sessionId;

    setSessions((current) => {
      if (current.some((session) => session.id === sessionId)) return current;
      const now = new Date().toISOString();
      return [
        { id: sessionId, title: "New chat", createdAt: now, updatedAt: now },
        ...current,
      ];
    });
  }, []);

  const startNewChat = () => {
    newSessionId.current = null;
    setActiveSessionId(null);
    setInitialMessages([]);
    setHistoryError(null);
    setIsChatsMenuOpen(false);
    setChatKey((n) => n + 1);
  };

  const confirmDeleteSession = async () => {
    if (!deleteTarget || isDeleting) return;
    const sessionId = deleteTarget.id;
    setIsDeleting(true);
    try {
      await api.delete(`/chats/sessions/${sessionId}`);
      toast.success("Chat deleted.");
      setSessions((current) => current.filter((s) => s.id !== sessionId));
      if (newSessionId.current === sessionId) newSessionId.current = null;
      if (activeSessionId === sessionId) startNewChat();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete chat.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSessionList = (onSelect?: () => void) => {
    if (isLoadingSessions) {
      return (
        <div className="space-y-2 pt-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No chats yet
        </p>
      );
    }

    return (
      <div className="space-y-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => {
              setActiveSessionId(session.id);
              onSelect?.();
            }}
            className={`group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
              activeSessionId === session.id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <span className="min-w-0 flex-1 truncate">{session.title}</span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Delete chat ${session.title}`}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(session);
                onSelect?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteTarget(session);
                  onSelect?.();
                }
              }}
              className="shrink-0 rounded p-1 opacity-60 hover:bg-red-500/10 hover:text-red-500 hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full w-full space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu
            open={isChatsMenuOpen}
            onOpenChange={setIsChatsMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 cursor-pointer">
                <MessageSquare className="size-4" />
                Chats
                {sessions.length > 0 && (
                  <Badge className="ml-1 border-0 bg-muted px-1.5 text-[10px] text-muted-foreground">
                    {sessions.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-73">
              <DropdownMenuLabel>Recent chats</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea>
                <div className="max-h-[50vh] w-72 p-1">
                  {renderSessionList(() => setIsChatsMenuOpen(false))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className="gap-2 cursor-pointer"
            onClick={startNewChat}
          >
            <Plus className="size-4" />
            New chat
          </Button>
        </div>
      </div>

      <main className="h-[calc(100dvh-150px)] w-full :bg-transparent">
        {activeSessionId && isLoadingHistory ? (
          <div className="h-full w-full flex justify-center border border-border/60">
            <div className="max-w-3xl w-full flex flex-col gap-4 rounded-lg p-6">
              <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl" />
              <Skeleton className="h-20 w-4/5 rounded-xl" />
              <Skeleton className="ml-auto h-10 w-1/3 rounded-2xl" />
              <Skeleton className="h-16 w-3/4 rounded-xl" />
            </div>
          </div>
        ) : activeSessionId && historyError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-border/60 p-6 text-center">
            <BotMessageSquare className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              {historyError}
            </p>
            <p className="text-xs text-muted-foreground">
              Your messages are safe — this is just a loading problem.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setHistoryReload((n) => n + 1)}
            >
              Retry
            </Button>
          </div>
        ) : (
          <AssistantChat
            key={activeSessionId ?? `new-${chatKey}`}
            sessionId={activeSessionId}
            initialMessages={initialMessages}
            onNewSessionId={handleNewSessionId}
          />
        )}
      </main>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this chat?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” and all its messages will be permanently removed. This cannot be undone.`
                : "This chat and all its messages will be permanently removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={isDeleting}
              onClick={() => void confirmDeleteSession()}
            >
              {isDeleting ? "Deleting…" : "Delete chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
