"use client";

import React from "react";

interface StatBadgeProps {
  label: string;
  type?: "success" | "danger" | "warning" | "info" | "purple" | "default";
}

export default function StatBadge({ label, type = "default" }: StatBadgeProps) {
  const getStyle = () => {
    switch (type) {
      case "success":
        return "bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]";
      case "danger":
        return "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]";
      case "warning":
        return "bg-[#FFF9F2] text-[#F59E0B] border-[#FFE7CC]";
      case "info":
        return "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]";
      case "purple":
        return "bg-[#FAF5FF] text-[#8B5CF6] border-[#F3E8FF]";
      case "default":
      default:
        return "bg-slate-50 text-[#6B7280] border-slate-200";
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStyle()}`}>
      {label}
    </span>
  );
}
