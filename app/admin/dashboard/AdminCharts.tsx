"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ['#16A34A', '#2563EB', '#6D3DF5', '#EA580C', '#94A3B8'];

export function AdminCharts({ chartType, data }: { chartType: "allocation" | "reviews", data?: any }) {
  
  if (chartType === "allocation") {
    // Process mentors data for Donut Chart
    let total = 0;
    const pieData = (data || []).map((m: any, i: number) => {
      const assigned = m.MentorClient?.length || 0;
      total += assigned;
      return { name: m.name, value: assigned, fill: COLORS[i % COLORS.length] };
    });

    return (
      <div className="flex gap-4 items-center">
        <div className="w-[140px] h-[140px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-[#0F172A]">{total}</span>
            <span className="text-[10px] font-bold text-[#64748B]">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {pieData.map((entry: any, i: number) => (
            <div key={i} className="flex justify-between items-center text-[12px] font-semibold text-[#64748B]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                <span>{entry.name}</span>
              </div>
              <span>{entry.value} ({(total > 0 ? (entry.value/total)*100 : 0).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Line Chart for Reviews
  const lineData = data && data.length > 0 ? data : [
    { name: 'Week 1', completed: 0, pending: 0 },
    { name: 'Week 2', completed: 0, pending: 0 },
    { name: 'Week 3', completed: 0, pending: 0 },
    { name: 'Week 4', completed: 0, pending: 0 },
  ];

  return (
    <div className="h-[200px] w-full">
      <div className="flex justify-end gap-6 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-[#16A34A] rounded-full"></div>
          <span className="text-[11px] font-bold text-[#64748B]">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-[#EA580C] rounded-full"></div>
          <span className="text-[11px] font-bold text-[#64748B]">Pending</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF3" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line type="monotone" dataKey="completed" stroke="#16A34A" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="pending" stroke="#EA580C" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
