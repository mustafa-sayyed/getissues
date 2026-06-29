import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./app-sidebar";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { OnboardingDialog } from "@/components/dashboard/OnboardingDialog";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-dvh w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-1 flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
            <OnboardingDialog />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
