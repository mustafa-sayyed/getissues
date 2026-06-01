"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import Logo from "./Logo";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-foreground">
          <Logo fillColor="currentColor" fontSize={52} />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
          <Link href="/" className="transition hover:text-primary">
            Home
          </Link>
          <Link href="/#features" className="transition hover:text-primary">
            Features
          </Link>
          <Link href="/#waitlist" className="transition hover:text-primary">
            Early Access
          </Link>
          <Button className="text-white dark:text-black">
            <Link href={"/login"}>Login</Link>
          </Button>
        </nav>

        <Button
          variant="outline"
          size="default"
          className="md:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </Button>
      </div>

      {isOpen && (
        <div className="border-t border-border/70 bg-background/95 px-6 pb-6 pt-4 text-sm font-medium text-foreground/80 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="transition hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="transition hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#waitlist"
              className="transition hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Early Access
            </Link>
            <Link href={"/login"} className="w-full">
              <Button className="text-white w-full">Login</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
