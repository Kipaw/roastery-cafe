"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

export default function Home() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-muted">
      <h1 className="text-4xl font-semibold">Welcome {profile.name}</h1>
      <Button
        nativeButton={false}
        render={<Link href={profile.role === "admin" ? "/admin" : "/order"} />}
        className="bg-teal-500 text-white hover:bg-teal-600"
      >
        Access Dashboard
      </Button>
    </div>
  );
}
