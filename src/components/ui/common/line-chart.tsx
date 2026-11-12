"use client";

import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export default function LineCharts({
  data,
}: {
  data: { name: string; total: number }[] | undefined;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Tooltip wrapperClassName="!bg-white z-20 dark:!bg-neutral-900 rounded-md" />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#00bba7"
          strokeWidth={2}
        />
        <XAxis dataKey="name" />
      </LineChart>
    </ResponsiveContainer>
  );
}
