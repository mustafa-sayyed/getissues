import DashboardShell from "@/components/dashboard/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - getissues",
  description: "Your personalized dashboard for AI-curated open source issues.",
  icons: {
    icon: "/favicon.svg",
  },
};

function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}

export default DashboardLayout;
