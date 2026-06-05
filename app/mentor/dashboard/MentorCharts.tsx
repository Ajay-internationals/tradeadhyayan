"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function MentorCharts({ chartType, data }: { chartType: "trend", data?: any[] }) {
  
  if (chartType === "trend") {
    // If no data, provide an empty state or placeholder
    const chartData = data && data.length > 0 ? data : [
      { name: "W1", score: 65 },
      { name: "W2", score: 68 },
      { name: "W3", score: 75 },
      { name: "W4", score: 72 },
      { name: "W5", score: 80 },
    ];

    return (
      <div className="w-full h-full min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF3" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} dy={5} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} domain={[0, 100]} />
            <Tooltip 
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#6D3DF5" 
              strokeWidth={2} 
              dot={{ r: 3, strokeWidth: 2, fill: "#fff", stroke: "#6D3DF5" }} 
              activeDot={{ r: 5, fill: "#6D3DF5" }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
