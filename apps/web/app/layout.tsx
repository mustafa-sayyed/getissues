import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Allan } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

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
  title: "getissues - An AI agent that finds issues you can contribute to",
  description:
    "Autonomous AI agents that find open issues you can contribute to while you sleep.",
  icons: {
    icon: "/favicon.svg",
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
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
