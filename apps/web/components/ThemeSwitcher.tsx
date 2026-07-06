"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MdOutlineMonitor } from "react-icons/md";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-lg" className="rounded-full">
          {theme === "system" ? (
            <MdOutlineMonitor className="h-5 w-5" />
          ) : (
            <>
              {/* Sun icon shows in dark mode, hidden in light mode */}
              <Sun className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

              {/* Moon icon shows in light mode, hidden in dark mode */}
              <Moon className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;
