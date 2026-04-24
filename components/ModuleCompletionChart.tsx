"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  avgCompletion: number;
  totalCompleted: number;
}

export default function ModuleCompletionChart({ avgCompletion, totalCompleted }: Props) {
  const data = [
    { name: "Avg Completion Rate", value: avgCompletion, fill: "#00b64f" },
    { name: "Total Modules Completed", value: Math.min(totalCompleted / 10, 100), fill: "#008236" },
  ];

  return (
    <div className="bg-white border border-[#e6eadc] rounded-[14px] p-5">
      <h3 className="text-sm font-bold text-[#015d25] mb-4">Learning Progress</h3>
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
            formatter={(value) => `${Math.round(value)}%`}
          />
          <Bar dataKey="value" fill="#007c33" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
