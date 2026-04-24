"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  weeklyActive: number;
  monthlyActive: number;
}

export default function EngagementChart({ weeklyActive, monthlyActive }: Props) {
  const data = [
    { name: "Week", active: weeklyActive },
    { name: "Month", active: monthlyActive },
  ];

  return (
    <div className="bg-white border border-[#e6eadc] rounded-[14px] p-5">
      <h3 className="text-sm font-bold text-[#015d25] mb-4">Active Users</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6eadc" />
          <XAxis dataKey="name" stroke="#636858" style={{ fontSize: "12px" }} />
          <YAxis stroke="#636858" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fbf9f6", border: "1px solid #e6eadc", borderRadius: "8px" }}
            formatter={(value) => `${value} athletes`}
          />
          <Bar dataKey="active" fill="#007c33" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
