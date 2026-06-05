"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  avgCompletion: number;
  totalCompleted: number;
}

export default function ModuleCompletionChart({ avgCompletion, totalCompleted }: Props) {
  const data = [
    { name: "Completion Rate Average", value: avgCompletion, fill: "#007D32" },
    { name: "Total Modules Completed", value: Math.min(totalCompleted / 10, 100), fill: "#007D32" },
  ];

  return (
    <div className="bg-white border border-[#e6eadc] rounded-none p-5">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e6eadc" />
          <XAxis type="number" stroke="#636858" style={{ fontSize: "12px" }} domain={[0, 100]} />
          <YAxis dataKey="name" type="category" stroke="#636858" style={{ fontSize: "12px" }} width={120} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fbf9f6", border: "1px solid #e6eadc", borderRadius: "8px" }}
            formatter={(value) => `${Math.round(Number(value) || 0)}%`}
          />
          <Bar dataKey="value" fill="#007D32" radius={[0, 0, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
