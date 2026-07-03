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
import { Settings, Shield, Palette, Trash2, Save, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa6";
import { SiNotion } from "react-icons/si";
import { NotebookPen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { GrConnect } from "react-icons/gr";

const sections = [
  // sections to be added in future
  // { id: "notifications", label: "Notifications", icon: Bell },
  // { id: "ai", label: "AI Preferences", icon: Bot },
  { id: "skills", label: "Skills", icon: NotebookPen },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: GrConnect },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("skills");
  const [saved, setSaved] = useState(false);

  const { setTheme, theme: currentTheme } = useTheme();

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

      <div className="flex gap-6 flex-col sm:flex-row">
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
        <div className="sm:hidden flex gap-2 flex-wrap pb-1 w-full">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex items-center gap-1.5 shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
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
          {/* Skills */}
          {activeSection === "skills" && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Skills</CardTitle>
                <CardDescription>
                  Add your skills, languages you work on and what issues you
                  want to work on
                  <br />
                  It will help AI Agent to improve resomendations
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Your Skills
                  </label>
                  <Input
                    defaultValue="TypeScript, React, Node.js"
                    className="h-9 bg-muted/40 border-border/60 focus-visible:ring-primary/40"
                    placeholder="e.g. TypeScript, Rust, Go"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tell about what issues you want to work on
                  </label>
                  <Textarea
                    className="max-h-60 min-h-30 bg-muted/40 border-border/60 focus-visible:ring-primary/40 rounded-md"
                    placeholder="e.g. I want to work on open source issues related to web development, especially in JavaScript and TypeScript. I am also interested in contributing to projects that focus on accessibility and performance optimization."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    size="lg"
                    onClick={handleSave}
                    className="flex items-center px-4 gap-1.5"
                  >
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
                      onClick={() => setTheme(theme)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        currentTheme === theme
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
                      {currentTheme === theme && (
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
                    desc: "Use to personalize issue recommendations",
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
                    className={`flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/30 transition-colors ${item.name === "Notion" ? "opacity-50" : ""}`}
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
                        Coming Soon...
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
