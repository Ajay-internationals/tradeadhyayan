"use client";

import React from "react";
import AppShell from "@/components/app/AppShell";

export default function TradeJournalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
