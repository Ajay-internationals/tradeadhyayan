"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Contact, UserCheck, Award, ClipboardList,
  Video, MessageSquare, CreditCard, History, Tag, Settings,
  Plus, ArrowLeftRight, ShieldCheck, UserPlus, Volume2,
  X, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  adminAddMentor,
  adminAllocateClient,
  adminGetMentors,
  adminGetClients,
  adminCreateSession,
  adminBroadcastMessage,
} from "@/app/actions/adminQuickActions";

// ─── Types ───────────────────────────────────────────────────────────────────
type ModalType = "addMentor" | "allocate" | "createSession" | "broadcast" | null;

interface SelectOption { id: string; name: string; email: string; }

// ─── Shared Modal Shell ───────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-lg border border-[#EEF0F4] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EEF0F4]">
          <h2 className="text-[15px] font-black text-[#0F172A] tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X size={16} className="text-[#64748B]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 rounded-[10px] border border-[#E2E8F0] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#6D3DF5]/30 focus:border-[#6D3DF5] transition-all bg-[#FAFAFF] placeholder:text-[#94A3B8]";
const labelCls = "block text-[11px] font-black uppercase tracking-wider text-[#64748B] mb-1.5";
const selectCls = inputCls + " cursor-pointer";

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] bg-gradient-to-r from-[#6D3DF5] to-[#9333EA] text-white text-[13px] font-black tracking-tight hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-purple-200"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      {loading ? "Processing..." : label}
    </button>
  );
}

function ResultBanner({ result }: { result: { success: boolean; error?: string } | null }) {
  if (!result) return null;
  return result.success ? (
    <div className="flex items-center gap-2 px-4 py-3 rounded-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-bold">
      <CheckCircle2 size={14} /> Done! Changes have been saved.
    </div>
  ) : (
    <div className="flex items-start gap-2 px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[12px] font-bold">
      <AlertCircle size={14} className="mt-0.5 shrink-0" /> {result.error}
    </div>
  );
}

// ─── Add Mentor Modal ─────────────────────────────────────────────────────────
function AddMentorModal({ onClose }: { onClose: () => void }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminAddMentor({
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        phone: fd.get("phone") as string,
        designation: fd.get("designation") as string,
        category: fd.get("category") as string,
        capacity: Number(fd.get("capacity")),
        payoutShare: Number(fd.get("payoutShare")),
      });
      setResult(res);
      if (res.success) toast.success("Mentor added successfully!");
    });
  };

  return (
    <Modal title="➕ Add New Mentor" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Full Name">
            <input name="name" required placeholder="e.g. Rahul Sharma" className={inputCls} />
          </FormRow>
          <FormRow label="Email">
            <input name="email" type="email" required placeholder="mentor@email.com" className={inputCls} />
          </FormRow>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Phone">
            <input name="phone" placeholder="+91 98765 43210" className={inputCls} />
          </FormRow>
          <FormRow label="Designation">
            <input name="designation" placeholder="Lead Instructor" className={inputCls} />
          </FormRow>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormRow label="Category">
            <select name="category" defaultValue="JUNIOR" className={selectCls}>
              <option value="JUNIOR">Junior</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="HEAD">Head</option>
            </select>
          </FormRow>
          <FormRow label="Capacity">
            <input name="capacity" type="number" defaultValue={10} min={1} max={50} className={inputCls} />
          </FormRow>
          <FormRow label="Payout %">
            <input name="payoutShare" type="number" defaultValue={40} min={0} max={100} className={inputCls} />
          </FormRow>
        </div>
        <ResultBanner result={result} />
        {!result?.success && <SubmitBtn loading={pending} label="Create Mentor Account" />}
      </form>
    </Modal>
  );
}

// ─── Allocate Client Modal ────────────────────────────────────────────────────
function AllocateModal({ onClose }: { onClose: () => void }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [mentors, setMentors] = useState<SelectOption[]>([]);
  const [clients, setClients] = useState<SelectOption[]>([]);

  React.useEffect(() => {
    adminGetMentors().then(setMentors);
    adminGetClients().then(setClients);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminAllocateClient({
        clientId: fd.get("clientId") as string,
        mentorId: fd.get("mentorId") as string,
      });
      setResult(res);
      if (res.success) toast.success("Client allocated successfully!");
    });
  };

  return (
    <Modal title="🔗 Allocate Client to Mentor" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormRow label="Select Client">
          <select name="clientId" required className={selectCls}>
            <option value="">— Choose a client —</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </FormRow>
        <FormRow label="Assign to Mentor">
          <select name="mentorId" required className={selectCls}>
            <option value="">— Choose a mentor —</option>
            {mentors.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
        </FormRow>
        <p className="text-[11px] text-[#94A3B8] font-medium">
          ⚠ If the client is already allocated, their existing allocation will be replaced.
        </p>
        <ResultBanner result={result} />
        {!result?.success && <SubmitBtn loading={pending} label="Confirm Allocation" />}
      </form>
    </Modal>
  );
}

// ─── Create Session Modal ─────────────────────────────────────────────────────
function CreateSessionModal({ onClose }: { onClose: () => void }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [mentors, setMentors] = useState<SelectOption[]>([]);
  const [clients, setClients] = useState<SelectOption[]>([]);

  React.useEffect(() => {
    adminGetMentors().then(setMentors);
    adminGetClients().then(setClients);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminCreateSession({
        mentorId: fd.get("mentorId") as string,
        clientId: fd.get("clientId") as string,
        scheduledAt: fd.get("scheduledAt") as string,
        durationMins: Number(fd.get("durationMins")),
        sessionType: fd.get("sessionType") as string,
        notes: fd.get("notes") as string,
      });
      setResult(res);
      if (res.success) toast.success("Session scheduled successfully!");
    });
  };

  return (
    <Modal title="📅 Schedule New Session" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Mentor">
            <select name="mentorId" required className={selectCls}>
              <option value="">— Select mentor —</option>
              {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FormRow>
          <FormRow label="Client">
            <select name="clientId" required className={selectCls}>
              <option value="">— Select client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormRow>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Date & Time">
            <input name="scheduledAt" type="datetime-local" required className={inputCls} />
          </FormRow>
          <FormRow label="Duration (mins)">
            <input name="durationMins" type="number" defaultValue={30} min={15} step={15} className={inputCls} />
          </FormRow>
        </div>
        <FormRow label="Session Type">
          <select name="sessionType" defaultValue="REVIEW" className={selectCls}>
            <option value="REVIEW">Review</option>
            <option value="COACHING">Coaching</option>
            <option value="STRATEGY">Strategy</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </FormRow>
        <FormRow label="Notes (optional)">
          <textarea name="notes" rows={2} placeholder="Session agenda or context..." className={inputCls + " resize-none"} />
        </FormRow>
        <ResultBanner result={result} />
        {!result?.success && <SubmitBtn loading={pending} label="Schedule Session" />}
      </form>
    </Modal>
  );
}

// ─── Broadcast Modal ──────────────────────────────────────────────────────────
function BroadcastModal({ onClose }: { onClose: () => void }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminBroadcastMessage({
        title: fd.get("title") as string,
        body: fd.get("body") as string,
        targetRole: fd.get("targetRole") as "ALL" | "CLIENT" | "MENTOR",
      });
      setResult(res);
      if (res.success) toast.success("Broadcast message sent!");
    });
  };

  return (
    <Modal title="📢 Broadcast Message" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormRow label="Message Title">
          <input name="title" required placeholder="e.g. System Maintenance Notice" className={inputCls} />
        </FormRow>
        <FormRow label="Target Audience">
          <select name="targetRole" defaultValue="ALL" className={selectCls}>
            <option value="ALL">Everyone (Clients + Mentors)</option>
            <option value="CLIENT">Clients Only</option>
            <option value="MENTOR">Mentors Only</option>
          </select>
        </FormRow>
        <FormRow label="Message Body">
          <textarea
            name="body"
            required
            rows={4}
            placeholder="Write your broadcast message here..."
            className={inputCls + " resize-none"}
          />
        </FormRow>
        <ResultBanner result={result} />
        {!result?.success && <SubmitBtn loading={pending} label="Send Broadcast" />}
      </form>
    </Modal>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const isLoginPage = pathname === "/admin" || pathname === "/admin/";
  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { label: "Dashboard",          href: "/admin/dashboard",             icon: LayoutDashboard },
    { label: "Users",              href: "/admin/dashboard/users",        icon: Users },
    { label: "Mentors",            href: "/admin/dashboard/mentors",      icon: Contact },
    { label: "Client Allocation",  href: "/admin/dashboard/allocation",   icon: ArrowLeftRight },
    { label: "Mentorship Clients", href: "/admin/dashboard/clients",      icon: Award },
    { label: "Reviews",            href: "/admin/dashboard/reviews",      icon: ClipboardList },
    { label: "Sessions",           href: "/admin/dashboard/sessions",     icon: Video },
    { label: "Community",          href: "/admin/dashboard/community",    icon: MessageSquare },
    { label: "Mentor Payouts",     href: "/admin/dashboard/payouts",      icon: CreditCard },
    { label: "Transactions",       href: "/admin/dashboard/transactions", icon: History },
    { label: "Plans & Pricing",    href: "/admin/dashboard/pricing",      icon: Tag },
    { label: "Settings",           href: "/admin/dashboard/settings",     icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Toaster position="top-right" />

      {/* Modals */}
      {activeModal === "addMentor"     && <AddMentorModal      onClose={() => setActiveModal(null)} />}
      {activeModal === "allocate"      && <AllocateModal       onClose={() => setActiveModal(null)} />}
      {activeModal === "createSession" && <CreateSessionModal  onClose={() => setActiveModal(null)} />}
      {activeModal === "broadcast"     && <BroadcastModal      onClose={() => setActiveModal(null)} />}

      {/* Sidebar */}
      <aside className="w-[264px] bg-white border-r border-[#EEF0F4] flex flex-col h-full shrink-0 shadow-[0_12px_30px_rgba(15,23,42,0.02)] select-none">
        {/* Brand */}
        <div className="p-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradPurple" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6D3DF5" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
                <path d="M6 8L14 16L6 24V8Z" fill="url(#logoGradPurple)" fillOpacity="0.85" />
                <path d="M26 8L18 16L26 24V8Z" fill="url(#logoGradPurple)" />
                <path d="M10 16H22" stroke="url(#logoGradPurple)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span className="font-black text-base text-[#0F172A] tracking-wider block leading-none">
                Trade Adhyayan
              </span>
              <span className="inline-block bg-[#F1ECFF] text-[#6D3DF5] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px] mt-1.5 leading-none">
                Admin Arena
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-[12px] text-[13px] font-bold tracking-tight transition-all duration-200 ${
                  active
                    ? "bg-[#F1ECFF] text-[#6D3DF5] shadow-[0_2px_8px_rgba(109,61,245,0.04)]"
                    : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
                }`}
              >
                <item.icon
                  size={16}
                  className={`transition-colors duration-200 ${active ? "text-[#6D3DF5]" : "text-[#64748B]"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="px-5 py-4 border-t border-[#EEF0F4] shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] block mb-3 pl-1">
            Quick Actions
          </span>
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveModal("addMentor")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F1ECFF] border border-dashed border-[#E9E6F5] transition-all"
            >
              <Plus size={14} className="text-[#6D3DF5]" />
              <span>Add Mentor</span>
            </button>
            <button
              onClick={() => setActiveModal("allocate")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F1ECFF] border border-dashed border-[#E9E6F5] transition-all"
            >
              <UserPlus size={14} className="text-[#6D3DF5]" />
              <span>Allocate Clients</span>
            </button>
            <button
              onClick={() => setActiveModal("createSession")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F1ECFF] border border-dashed border-[#E9E6F5] transition-all"
            >
              <Video size={14} className="text-[#6D3DF5]" />
              <span>Create Session</span>
            </button>
            <button
              onClick={() => setActiveModal("broadcast")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F1ECFF] border border-dashed border-[#E9E6F5] transition-all"
            >
              <Volume2 size={14} className="text-[#6D3DF5]" />
              <span>Broadcast Message</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="p-5 shrink-0 pt-0">
          <div className="p-4 bg-[#F8FAFC] border border-[#EEF0F4] rounded-[20px] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-[#16A34A]" />
            </div>
            <div>
              <span className="text-[11px] font-black text-[#0F172A] block leading-tight">System Status</span>
              <span className="text-[10px] font-bold text-[#16A34A] block mt-0.5">All Systems Operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
