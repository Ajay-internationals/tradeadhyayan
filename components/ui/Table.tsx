"use client";

import React from "react";

interface TableColumn<T> {
  header: string;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyState?: React.ReactNode;
  rowKey: (item: T, index: number) => string | number;
}

export default function Table<T>({
  columns,
  data,
  emptyState,
  rowKey
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto border border-[#EEF0F4] rounded-2xl bg-white w-full">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-[#F7F8FC] border-b border-[#EEF0F4] text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
            {columns.map((col, idx) => (
              <th key={idx} className={`py-4 px-5 font-black ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF0F4] text-xs font-semibold text-[#111827]">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={rowKey(item, index)} className="hover:bg-[#F7F8FC]/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-4 px-5 ${col.className || ""}`}>
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center bg-white text-[#6B7280]">
                {emptyState || "No records found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
