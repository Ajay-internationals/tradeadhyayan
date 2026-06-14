"use client";

import React from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  themeColor: string; // e.g., "#2563EB"
  centerText?: string;
  centerSubtext?: string;
}

export default function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  themeColor,
  centerText,
  centerSubtext
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track circle */}
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          style={{
            stroke: themeColor,
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease-out"
          }}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {/* Center Text label frame */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
        <span className="text-base font-black text-[#111827] leading-none">
          {centerText || `${percentage.toFixed(0)}%`}
        </span>
        {centerSubtext && (
          <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-wider mt-1.5 leading-none">
            {centerSubtext}
          </span>
        )}
      </div>
    </div>
  );
}
