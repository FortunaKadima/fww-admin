"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  activated: number;
  pending: number;
}

export default function ActivationChart({ activated, pending }: Props) {
  const data = [
    { name: "Activated", value: activated },
    { name: "Pending", value: pending },
  ];

  return (
    <div className="bg-white border border-[#e6eadc] rounded-[14px] p-5">
      <h3 className="text-sm font-bold text-[#015d25] mb-4">Activation Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            <Cell fill="#00b64f" />
            <Cell fill="#e6eadc" />
          </Pie>
          <Tooltip
            formatter={(value) => `${value} athletes`}
            contentStyle={{ backgroundColor: "#fbf9f6", border: "1px solid #e6eadc", borderRadius: "8px" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
