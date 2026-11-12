"use client";

import LineCharts from "@/components/ui/common/line-chart";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const toLocalKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export default function Dashboard() {
  const supabase = createClient();

  const lastWeek = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { data: orders } = useQuery({
    queryKey: ["orders-per-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", lastWeek.toISOString())
        .order("created_at");

      const counts: Record<string, number> = {};
      (data ?? []).forEach((order) => {
        const key = toLocalKey(new Date(order.created_at));
        counts[key] = (counts[key] || 0) + 1;
      });

      // isi 7 hari, termasuk yang 0
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(lastWeek);
        d.setDate(lastWeek.getDate() + i);
        const key = toLocalKey(d);
        return { name: key.slice(5), total: counts[key] ?? 0 };
      });
    },
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex w-full flex-col justify-between gap-2 lg:flex-row">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Create Per Week</CardTitle>
          <CardDescription suppressHydrationWarning>
            Showing orders from {dateFormatter.format(lastWeek)} to{" "}
            {dateFormatter.format(new Date())}
          </CardDescription>
        </CardHeader>
        <div className="h-64 w-full p-6">
          <LineCharts data={orders} />
        </div>
      </Card>
    </div>
  );
}
