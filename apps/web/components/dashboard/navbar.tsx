"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, LogOut, User, Settings, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient, type Session } from "@/lib/auth-client";
import ThemeSwitcher from "../ThemeSwitcher";

const routeLabels: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/issues": "Issues",
  "/dashboard/ai-agent": "AI Agent",
  "/dashboard/hacktoberfest": "Hacktoberfest",
  "/dashboard/girlscript": "Girlscript SoC",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
};
export function DashboardNavbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const pageTitle = routeLabels[pathname] ?? "Dashboard";
  const [userSession, setUserSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      const session = await authClient.getSession();      
      if (session.data) {
        setUserSession({...session.data});
      }
    };
    fetchUserSession();
  }, []);
  

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-md px-4">
      {/* Mobile sidebar trigger */}
      <SidebarTrigger className="md:hidden" />

      {/* Page title / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-muted-foreground text-sm hidden sm:block">
          Dashboard
        </span>
        <span className="text-muted-foreground text-sm hidden sm:block">/</span>
        <span className="font-semibold text-foreground text-sm truncate">
          {pageTitle}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search issues..."
          className="pl-8 h-8 w-52 text-sm bg-muted/50 border-border/60 focus-visible:ring-primary/40"
        />
      </div>

      {/* Theme toggle */}
      <ThemeSwitcher />

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative size-8 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Avatar className="size-8">
              <AvatarImage src={userSession?.user?.image ?? ""} alt="User" />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {userSession?.user?.name[0] ?? "Test"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-sm">
                {userSession?.user?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {userSession?.user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2"
            >
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center gap-2">
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
