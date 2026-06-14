"use client";

import React from "react";

interface SparklinePoint {
  value: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ReactNode;
  themeColor: string; // Hex code or tailwind color e.g., "#10B981"
  sparklineData?: SparklinePoint[];
  progress?: number; // Optional progress percentage
}

export default function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
  themeColor,
}: MetricCardProps) {
  const isUp = changeType === "up";
  const isDown = changeType === "down";

  return (
    <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between min-h-[132px] hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-all duration-300 group select-none relative overflow-hidden">
      
      {/* Absolute Icon in top right */}
      <div 
        className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.01)] transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: `${themeColor}12`, color: themeColor }}
      >
        {icon}
      </div>

      {/* Top Header Row: Title */}
      <div className="w-full pr-8 shrink-0 text-left">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#6B7280] block leading-tight whitespace-normal break-words">
          {title}
        </span>
      </div>

      {/* Middle Row: Large Value */}
      <div className="mt-2 text-left w-full">
        <span className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight block truncate leading-none" title={String(value)}>
          {value}
        </span>
      </div>

      {/* Bottom Row: Trend and Change Sub-text */}
      <div className="mt-3 pt-3 border-t border-[#EEF0F4]/60 flex items-center gap-1.5 text-left shrink-0 w-full min-w-0">
        {changeType !== "neutral" && (
          <span className={`inline-flex items-center text-[10px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
            isUp 
              ? "bg-[#ECFDF5] text-[#10B981]" 
              : "bg-[#FEF2F2] text-[#EF4444]"
          }`}>
            {isUp ? "▲" : "▼"} {isUp ? "Up" : "Down"}
          </span>
        )}
        <span className="text-xs font-bold text-[#6B7280] truncate flex-1" title={change}>
          {change}
        </span>
      </div>

    </div>
  );
}
