"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { registroCasos } from "@/lib/mocks";

export function RegistroCasosChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={registroCasos.serie}
        margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="registroFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5C800" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#F5C800" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e5e7eb" vertical={false} strokeDasharray="0" />
        <XAxis
          dataKey="mes"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          ticks={[0, 25, 50, 100, 150, 200, 250]}
          domain={[0, 250]}
          width={32}
        />
        <Tooltip
          cursor={{ stroke: "#F5C800", strokeWidth: 1 }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 12,
          }}
          labelStyle={{ color: "#0F1F3C", fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="#F5C800"
          strokeWidth={2.5}
          fill="url(#registroFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
