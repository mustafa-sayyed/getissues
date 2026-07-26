import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, Users, GitPullRequest, Database, Bot, Sparkles, Activity } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GetIssues Admin - Analytics & Monitoring",
  description: "Comprehensive analytics and operational telemetry for GetIssues platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full bg-background text-foreground flex flex-col antialiased selection:bg-primary selection:text-primary-foreground`}>
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  GetIssues
                </span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Admin Analytics
                </span>
              </div>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-2">
              <a
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground shadow-xs transition-colors hover:bg-secondary/80"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
              <div className="h-4 w-px bg-border/60 mx-1" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded-md border border-border/30">
                <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>System Operational</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} GetIssues Platform. Direct DB Analytics.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              Neon DB Direct Connected
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
