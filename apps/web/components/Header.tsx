"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "./ui/spinner";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-foreground">
          <Logo fillColor="currentColor" fontSize={52} />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
          <Link href="/#how-it-works" className="transition hover:text-primary">
            How it works
          </Link>
          <Link href="/#features" className="transition hover:text-primary">
            Features
          </Link>
          <AuthButton />
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
              href="/#how-it-works"
              className="transition hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="transition hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <AuthButton onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

function AuthButton({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isPending } = authClient.useSession();

  return !isPending && data ? (
    <Link href={"/dashboard"} onClick={onNavigate}>
      <Button className="min-w-[120px] text-white dark:text-black p-4 rounded-none">
        Dashboard
      </Button>
    </Link>
  ) : (
    <Link href={"/login"} onClick={onNavigate}>
      <Button className="min-w-[120px] text-white dark:text-black p-4 rounded-none">
        Login
      </Button>
    </Link>
  );
}

export default Header;
