"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  activated: number;
  pending: number;
}

export default function ActivationChart({ activated, pending }: Props) {
  const data = [
    { name: "Active", value: activated },
    { name: "Pending", value: pending },
  ];

  return (
    <div className="bg-white border border-[#e6eadc] rounded-none p-5">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={92.5}
            outerRadius={112.5}
            paddingAngle={0}
            dataKey="value"
            startAngle={-65}
            endAngle={295}
          >
            <Cell fill="#007D32" />
            <Cell fill="#D9D9D9" />
          </Pie>
          <Tooltip
            formatter={(value) => `${value} athletes`}
            contentStyle={{ backgroundColor: "#fbf9f6", border: "1px solid #e6eadc", borderRadius: "8px" }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="center"
            wrapperStyle={{ color: '#003219' }}
            formatter={(value) => (
              <span style={{ color: '#003219', fontFamily: 'Albert Sans', fontWeight: 900, fontSize: '14px', lineHeight: '110%', letterSpacing: '-2%', verticalAlign: 'middle', fontStyle: 'normal' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
