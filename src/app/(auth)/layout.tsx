import { DarkModeToggle } from "@/components/ui/common/darkmode-toggle";
import Image from "next/image";
import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-accent/60" />

      <div className="absolute right-4 top-4">
        <DarkModeToggle />
      </div>

      <div className="relative flex w-full max-w-sm flex-col gap-6">
        <Image
          src="/sinergy-logo.svg"
          alt="Sinergy Roastery"
          width={160}
          height={160}
          priority
          className="h-auto w-36 self-center"
        />
        {children}
      </div>
    </div>
  );
}
