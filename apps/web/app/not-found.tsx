"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-[8em] font-bold text-center text-primary">404</h1>
      <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl mb-4">
        Page Not Found
      </h1>
      <p className="text-lg text-foreground/60 mb-8">
        The page you are looking for does not exist.
      </p>
      <div className="flex space-x-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="lg"
          className="cursor-pointer px-6 py-4"
        >
          Go Back
        </Button>
        <Link href="/" passHref>
          <Button size="lg" className="text-white cursor-pointer px-6 py-4">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
