"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending } = authClient.useSession();

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
          {isPending ? (
            <Skeleton className="rounded-none w-25 h-9" />
          ) : data ? (
            <Link href={"/dashboard"} onClick={() => setIsOpen(false)}>
              <Button className="text-white dark:text-black p-4 rounded-none">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href={"/login"} onClick={() => setIsOpen(false)}>
              <Button className="text-white dark:text-black-4 p-4 rounded-none">
                Login
              </Button>
            </Link>
          )}
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
            {isPending ? (
              <Skeleton className="rounded-none w-full h-9" />
            ) : data ? (
              <Link href={"/dashboard"} onClick={() => setIsOpen(false)}>
                <Button className="text-white dark:text-black p-4 rounded-none">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href={"/login"} onClick={() => setIsOpen(false)}>
                <Button className="text-white dark:text-black-4 p-4 rounded-none">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
