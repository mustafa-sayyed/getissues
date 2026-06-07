"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) return <div>Checking status...</div>;
  if (error) return <div>Failed to authenticate.</div>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>User Dashboard</h1>
      <div>
        <p>Welcome, {session?.user?.name}</p>
        <p>Email: {session?.user?.email}</p>
      </div>
      <Button onClick={() => authClient.signOut()}>Log Out</Button>
    </div>
  );
}
