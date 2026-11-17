"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">
      {/* lingkaran dekoratif lembut */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-accent/60" />

      <div className="relative flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border bg-card px-8 py-12 text-center shadow-sm">
        <Image
          src="/sinergy-logo.svg"
          alt="Sinergy Roastery"
          width={160}
          height={160}
          priority
          className="h-auto w-36"
        />

        <div className="h-px w-16 bg-border" />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selamat datang kembali,
          </p>
          <h1 className="text-3xl font-semibold capitalize">
            {profile.name ?? "Guest"}
          </h1>
        </div>

        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link href={profile.role === "admin" ? "/admin" : "/order"} />
          }
          className="w-full cursor-pointer rounded-full font-semibold"
        >
          Access Dashboard
          <ArrowRight />
        </Button>

        <p className="text-[10px] tracking-[0.3em] text-muted-foreground">
          GOOD BEANS · BETTER DAYS
        </p>
      </div>
    </div>
  );
}
