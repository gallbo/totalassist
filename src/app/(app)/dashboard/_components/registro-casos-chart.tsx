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

type Punto = { mes: string; anio: number; valor: number };

export function RegistroCasosChart({ serie }: { serie: Punto[] }) {
  const maxValor = Math.max(...serie.map((p) => p.valor), 4);
  const ticksMaximo = Math.ceil(maxValor * 1.2);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={serie}
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
          domain={[0, ticksMaximo]}
          allowDecimals={false}
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
