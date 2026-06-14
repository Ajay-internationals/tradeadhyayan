"use client";

import React from "react";

interface SoftCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SoftCard({
  title,
  action,
  children,
  className = ""
}: SoftCardProps) {
  return (
    <div className={`bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between ${className}`}>
      
      {/* Card Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#EEF0F4] mb-5 shrink-0">
        <h3 className="text-sm font-black text-[#111827] tracking-tight uppercase">
          {title}
        </h3>
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 min-h-0 text-left">
        {children}
      </div>

    </div>
  );
}
