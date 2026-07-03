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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, LogOut, User, Settings, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
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
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const pageTitle = routeLabels[pathname] ?? "Dashboard";
  const { data: userSession } = authClient.useSession();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
    setIsLoggingOut(false);
    setShowLogoutDialog(false);
  };

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
              <AvatarImage
                src={userSession?.user?.image ?? ""}
                alt={userSession?.user?.name ?? "User"}
              />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {userSession?.user?.name?.[0]}
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
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2"
            >
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setShowLogoutDialog(true);
            }}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account? You will be
              redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer flex items-center justify-center gap-2"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Spinner />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
