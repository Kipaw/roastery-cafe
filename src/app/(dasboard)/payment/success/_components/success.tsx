"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Success() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");

  const { mutate } = useMutation({
    mutationKey: ["mutateUpdateStatusOrder"],
    mutationFn: async () => {
      await supabase
        .from("orders")
        .update({
          status: "settled",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order_id);
    },
  });

  useEffect(() => {
    if (order_id) mutate();
  }, [order_id]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <CheckCircle className="size-16 text-green-400" />
      <h1 className="text-2xl font-bold">Payment Success</h1>
      <Button nativeButton={false} render={<Link href="/order" />}>
        Back To Order
      </Button>
    </div>
  );
}
