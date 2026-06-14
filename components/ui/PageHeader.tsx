"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b border-[#EEF0F4] gap-4 w-full shrink-0">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-[11px] md:text-xs font-semibold text-[#6B7280] mt-1">
          {subtitle}
        </p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
