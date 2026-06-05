"use client";
import { Hammer } from "lucide-react";
export default function ComingSoonPage() {
  return (
    <div className="flex-1 bg-[#FAFBFF] p-6 flex flex-col items-center justify-center h-full">
      <div className="w-24 h-24 bg-[#F4F0FF] rounded-full flex items-center justify-center mb-6">
        <Hammer className="w-12 h-12 text-[#7C3AED]" />
      </div>
      <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-3">Under Construction</h1>
      <p className="text-[#64748B] max-w-md text-center text-lg leading-relaxed">
        This module is currently being built and will be available in the next update.
      </p>
    </div>
  );
}
