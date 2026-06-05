"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoot() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("trade_adhyayan_user");
    if (user) {
      router.push("/admin/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAFAFF]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-[#6D3DF5] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#64748B] font-bold text-sm uppercase tracking-widest">Loading Admin Area</p>
      </div>
    </div>
  );
}
