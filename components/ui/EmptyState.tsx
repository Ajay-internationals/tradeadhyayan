"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  desc: string;
  actionText?: string;
  onAction?: () => void;
  icon: React.ReactNode;
}

export default function EmptyState({
  title,
  desc,
  actionText,
  onAction,
  icon
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-10 text-center flex flex-col items-center justify-center min-h-[350px] shadow-[0_12px_30px_rgba(15,23,42,0.04)] w-full">
      
      {/* Icon frame */}
      <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#2563EB] mb-5 shadow-[0_4px_12px_rgba(37,99,235,0.04)]">
        {icon}
      </div>

      {/* Texts */}
      <h3 className="text-base font-black text-[#111827] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-xs font-semibold text-[#6B7280] max-w-sm leading-relaxed mb-6">
        {desc}
      </p>

      {/* Action button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black rounded-xl shadow-lg shadow-[#2563EB]/15 transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}

    </div>
  );
}
