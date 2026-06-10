"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Bot,
  Flame,
  Home,
  Settings,
  CircleDot,
  User,
  Sprout,
} from "lucide-react";

import type { Route } from "./nav-main";
import DashboardNavigation from "./nav-main";
import { NotificationsPopover } from "./nav-notifications";
import Icon from "./Icon";

const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New issue matched your profile.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "AI",
    text: "AI Agent found 3 new issues.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "GS",
    text: "Girlscript SoC application open.",
    time: "2h ago",
  },
];

const dashboardRoutes: Route[] = [
  {
    id: "home",
    title: "Home",
    icon: <Home className="size-4" />,
    link: "/dashboard",
  },
  {
    id: "issues",
    title: "Issues",
    icon: <CircleDot className="size-4" />,
    link: "/dashboard/issues",
  },
  {
    id: "ai-agent",
    title: "AI Agent",
    icon: <Bot className="size-4" />,
    link: "/dashboard/ai-agent",
  },
  {
    id: "hacktoberfest",
    title: "Hacktoberfest",
    icon: <Flame className="size-4" />,
    link: "/dashboard/hacktoberfest",
  },
  {
    id: "girlscript",
    title: "Girlscript SoC",
    icon: <Sprout className="size-4" />,
    link: "/dashboard/girlscript",
  },
  {
    id: "profile",
    title: "Profile",
    icon: <User className="size-4" />,
    link: "/dashboard/profile",
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="size-4" />,
    link: "/dashboard/settings",
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href="/dashboard" className="flex items-center gap-2 ml-0.5">
          <Icon className="size-7" fillColor="currentColor" />
          {!isCollapsed && (
            <span className="font-semibold text-foreground text-sm">
              getissues
            </span>
          )}
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <NotificationsPopover notifications={sampleNotifications} />
          <SidebarTrigger className="cursor-pointer" />
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2 bg-sidebar-accent/50",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
            U
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-medium text-foreground">
                User Name
              </span>
              <span className="truncate text-xs text-muted-foreground">
                user@example.com
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
