import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Allan } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import StoreProvider from "@/lib/StoreProvider";
import { Toaster } from "sonner";
import { PHProvider } from "@/components/posthog/PostHogProvider";

const manropeHeading = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
});

const allan = Allan({
  subsets: ["latin"],
  variable: "--font-allan",
  weight: ["400", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "getissues - Stop Searching, Start Contributing",
  description:
    "Autonomous AI agents find issues for you, so you can contribute",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "getissues - Stop Searching, Start Contributing",
    description:
      "Autonomous AI agents find issues for you, so you can contribute",
    type: "website",
    images: "https://getissues.tech/getissues.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "scroll-smooth",
        geistSans.variable,
        geistMono.variable,
        manropeHeading.variable,
        allan.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <TooltipProvider>
              <PHProvider>{children}</PHProvider>
              <Toaster richColors />
            </TooltipProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
