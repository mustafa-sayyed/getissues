"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Bot,
  Trash2,
  Save,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa6";
import { Switch } from "@/components/ui/switch";
import { SiNotion } from "react-icons/si";

const sections = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI Preferences", icon: Bot },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: FaGithub },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("notifications");
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    newIssues: false,
    aiMatches: true,
    hacktoberfest: false,
    gssoc: true,
    weeklyDigest: true,
    email: false,
  });

  const [aiPrefs, setAiPrefs] = useState({
    autoMatch: true,
    suggestBeginner: true,
    hacktoberFilter: false,
    smartSummary: true,
  });

  const [appearance, setAppearance] = useState<"light" | "dark" | "system">(
    "system",
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="size-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your notifications, and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <nav className="hidden sm:flex flex-col gap-1 w-44 shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                activeSection === s.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <s.icon className="size-3.5 shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 w-full">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                activeSection === s.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground bg-muted/60 hover:text-foreground",
              )}
            >
              <s.icon className="size-3 shrink-0" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Notifications */}
          {activeSection === "notifications" && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>
                  Choose what you want to be notified about
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "newIssues" as const,
                    label: "New Matched Issues",
                    desc: "When AI finds new issues for you",
                  },
                  {
                    key: "aiMatches" as const,
                    label: "AI Agent Matches",
                    desc: "When the agent runs a new scan",
                  },
                  {
                    key: "hacktoberfest" as const,
                    label: "Hacktoberfest Alerts",
                    desc: "New hacktoberfest eligible issues",
                  },
                  {
                    key: "gssoc" as const,
                    label: "GSSoC Updates",
                    desc: "Girlscript SoC issue notifications",
                  },
                  {
                    key: "weeklyDigest" as const,
                    label: "Weekly Digest",
                    desc: "Summary of top issues every Monday",
                  },
                  {
                    key: "email" as const,
                    label: "Email Notifications",
                    desc: "Receive updates via email",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-1"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <Switch
                      className="cursor-pointer"
                      checked={notifications[item.key]}
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Preferences */}
          {activeSection === "ai" && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">AI Preferences</CardTitle>
                <CardDescription>
                  Customize how the AI Agent works for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "autoMatch" as const,
                    label: "Auto-matching",
                    desc: "Automatically scan for new issues daily",
                  },
                  {
                    key: "suggestBeginner" as const,
                    label: "Beginner Filter",
                    desc: "Prioritize good first issue labels",
                  },
                  {
                    key: "hacktoberFilter" as const,
                    label: "Hacktoberfest Only",
                    desc: "Show only hacktoberfest eligible issues",
                  },
                  {
                    key: "smartSummary" as const,
                    label: "Smart Summaries",
                    desc: "AI generates issue summaries for you",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-1"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <Switch
                      className="cursor-pointer"
                      checked={aiPrefs[item.key]}
                      onClick={() =>
                        setAiPrefs((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                    />
                  </div>
                ))}

                <Separator />

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Preferred Languages
                  </label>
                  <Input
                    defaultValue="TypeScript, JavaScript, Python"
                    className="h-9 bg-muted/40 border-border/60 focus-visible:ring-primary/40"
                    placeholder="e.g. TypeScript, Rust, Go"
                  />
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSave} className="gap-1.5">
                    {saved ? (
                      <>
                        <Check className="size-3.5" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="size-3.5" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription>Choose your preferred theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setAppearance(theme)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        appearance === theme
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/40",
                      )}
                    >
                      <div
                        className={cn(
                          "w-full h-12 rounded-lg",
                          theme === "light"
                            ? "bg-white border border-gray-200"
                            : theme === "dark"
                              ? "bg-gray-900 border border-gray-700"
                              : "bg-gradient-to-br from-white to-gray-900",
                        )}
                      />
                      <span className="text-xs font-medium capitalize">
                        {theme}
                      </span>
                      {appearance === theme && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                          Active
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations */}
          {activeSection === "integrations" && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Integrations</CardTitle>
                <CardDescription>
                  Connect your accounts for better matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    name: "GitHub",
                    icon: FaGithub,
                    desc: "Import your repos, stars, and PR history",
                    connected: true,
                  },
                  {
                    name: "Notion",
                    icon: SiNotion,
                    desc: "Connect your Notion account",
                    connected: false,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <item.icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    {item.connected ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
                        <Check className="size-2.5" />
                        Connected
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div className="space-y-4">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions — proceed with caution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" size="sm" className="gap-1.5">
                    <Trash2 className="size-3.5" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
