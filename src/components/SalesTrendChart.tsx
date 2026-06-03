"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function SalesTrendChart({
  data
}: {
  data: { date: string; quantity: number; revenue: number }[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 10 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <Tooltip
            contentStyle={{
              border: "1px solid #d9e2ec",
              borderRadius: 8,
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)"
            }}
          />
          <Area
            type="monotone"
            dataKey="quantity"
            stroke="#0d9488"
            strokeWidth={3}
            fill="url(#salesFill)"
            name="Units sold"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
