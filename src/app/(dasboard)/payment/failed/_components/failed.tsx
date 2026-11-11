"use client";

import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import Link from "next/link";

export default function Failed() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <Ban className="size-16 text-red-500" />
      <h1 className="text-2xl font-bold">Payment Failed</h1>
      <Button nativeButton={false} render={<Link href="/order" />}>
        Back To Order
      </Button>
    </div>
  );
}
