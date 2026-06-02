"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminOverview,
  addMentor,
  assignClientToMentor
} from "@/app/actions/trades";
import {
  Users,
  UserPlus,
  ClipboardList,
  ArrowLeft,
  User,
  CheckCircle,
  Plus,
  TrendingUp,
  Sliders,
  DollarSign,
  Briefcase,
  Activity,
  AlertCircle
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function AdminArena() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"mentors" | "allocate" | "reviews">("mentors");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Mentor Form State
  const [mentorForm, setMentorForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    bio: "",
    experience: "",
    specialization: "",
    capacity: 10,
    payoutShare: 40.0
  });

  // Allocation State
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsPageLoading(true);
      const data = await getAdminOverview();
      setAdminData(data);
    } catch (err) {
      console.error("Error loading admin data:", err);
      toast.error("Failed to load admin overview.");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  const handleMentorFormChange = (key: string, val: any) => {
    setMentorForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addMentor(mentorForm);
      toast.success("Mentor registered successfully! 🎓");
      // Reset Form
      setMentorForm({
        name: "",
        email: "",
        phone: "",
        designation: "",
        bio: "",
        experience: "",
        specialization: "",
        capacity: 10,
        payoutShare: 40.0
      });
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to register mentor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedMentorId) {
      toast.error("Please select both a client and a mentor.");
      return;
    }
    try {
      setIsSubmitting(true);
      await assignClientToMentor(selectedClientId, selectedMentorId);
      toast.success("Client allocated successfully! 🤝");
      setSelectedClientId("");
      setSelectedMentorId("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to allocate client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#111827] border-r border-[#1F2937] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-extrabold text-lg select-none">TA</span>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-white text-[13px] tracking-wider leading-none block uppercase">
                ADMIN ARENA
              </span>
              <span className="text-[9px] font-bold text-[#8C8CA1] block mt-1 tracking-tight">
                Mentorship Management
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-1.5">
            {[
              { id: "mentors", label: "Mentor Management", icon: Users },
              { id: "allocate", label: "Client Allocation", icon: UserPlus },
              { id: "reviews", label: "Review Requests", icon: ClipboardList }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/25"
                      : "text-[#8C8CA1] hover:text-[#E2E8F0] hover:bg-[#1F2937]"
                  }`}
                >
                  <IconComp size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold text-[#8C8CA1] hover:text-[#E2E8F0] hover:bg-[#1F2937] transition-all cursor-pointer border border-transparent"
          >
            <ArrowLeft size={16} />
            <span>Trader Arena</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-8 text-left">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { label: "Total Mentors", val: adminData?.mentors?.length || 0, color: "text-slate-200" },
              { label: "Unassigned Clients", val: adminData?.unassignedClients?.length || 0, color: "text-amber-500" },
              { label: "Review Requests", val: adminData?.reviewRequests?.length || 0, color: "text-indigo-400" },
              { label: "Pending Reviews", val: adminData?.reviewRequests?.filter((r: any) => r.status === "PENDING").length || 0, color: "text-red-400" }
            ].map((stat) => (
              <div key={stat.label} className="p-5 bg-[#111827] border border-[#1F2937] rounded-[24px] shadow-sm space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                <span className={`text-2xl font-black block ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>

          {/* TAB 1: MENTOR MANAGEMENT */}
          {activeTab === "mentors" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Mentors List */}
              <div className="lg:col-span-8 bg-[#111827] border border-[#1F2937] rounded-[24px] p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Registered Mentors</h3>
                {adminData?.mentors?.length > 0 ? (
                  <div className="space-y-4">
                    {adminData.mentors.map((mentor: any) => (
                      <div
                        key={mentor.id}
                        className="p-5 bg-[#1F2937]/30 border border-[#1F2937] rounded-[20px] flex flex-col sm:flex-row justify-between gap-4 text-xs"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-white">{mentor.name}</h4>
                            <span className="px-2 py-0.5 text-[8px] font-black bg-indigo-600/10 text-indigo-400 rounded-full uppercase tracking-wider border border-indigo-500/10">
                              {mentor.status}
                            </span>
                          </div>
                          <p className="text-[#8C8CA1] font-semibold">{mentor.email}</p>
                          <p className="text-slate-400 font-semibold max-w-lg leading-relaxed">
                            "{mentor.bio || "No bio added."}"
                          </p>
                          <div className="flex flex-wrap gap-4 pt-1 text-[9px] font-bold text-slate-500">
                            <div>
                              <span className="text-[#8C8CA1]">Specialization: </span>
                              {mentor.specialization || "General"}
                            </div>
                            <div>
                              <span className="text-[#8C8CA1]">Experience: </span>
                              {mentor.experience || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right flex flex-col justify-between items-start sm:items-end shrink-0 gap-2">
                          <div className="p-3 bg-[#1F2937]/60 border border-[#1F2937] rounded-xl text-center space-y-1 w-28">
                            <span className="text-[7px] text-[#8C8CA1] font-black uppercase tracking-wider block">Allocation</span>
                            <span className="text-xs font-black text-indigo-400 block">
                              {mentor.activeClientsCount} / {mentor.capacity}
                            </span>
                          </div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
                            Payout Share: {mentor.payoutShare}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8C8CA1] font-semibold text-center py-12">
                    No mentors registered yet.
                  </p>
                )}
              </div>

              {/* Add Mentor Form */}
              <div className="lg:col-span-4 bg-[#111827] border border-[#1F2937] rounded-[24px] p-6 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Register Mentor</h3>
                  <p className="text-[9px] text-[#8C8CA1] font-bold mt-0.5">Register a coach to assign clients</p>
                </div>

                <form onSubmit={handleAddMentor} className="space-y-4">
                  {[
                    { key: "name", label: "Full Name", placeholder: "e.g. Ajay Sharma", type: "text", required: true },
                    { key: "email", label: "Email Address", placeholder: "e.g. ajay@example.com", type: "email", required: true },
                    { key: "phone", label: "Phone Number", placeholder: "e.g. +91 9988776655", type: "text", required: false },
                    { key: "designation", label: "Designation", placeholder: "e.g. Options Buying Specialist", type: "text", required: false },
                    { key: "specialization", label: "Specialization", placeholder: "e.g. F&O Intraday", type: "text", required: false },
                    { key: "experience", label: "Experience", placeholder: "e.g. 7 Years", type: "text", required: false },
                    { key: "capacity", label: "Client Capacity Limit", placeholder: "10", type: "number", required: true },
                    { key: "payoutShare", label: "Payout Share (%)", placeholder: "40.0", type: "number", required: true }
                  ].map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={(mentorForm as any)[field.key]}
                        onChange={(e) => handleMentorFormChange(field.key, e.target.type === "number" ? parseFloat(e.target.value) : e.target.value)}
                        className="w-full px-4 h-10 rounded-xl bg-[#1F2937] border border-[#1F2937] focus:border-[#374151] text-xs font-bold text-slate-300 focus:outline-none"
                      />
                    </div>
                  ))}

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Bio / Profile Info</label>
                    <textarea
                      rows={3}
                      placeholder="Mentor background details..."
                      value={mentorForm.bio}
                      onChange={(e) => handleMentorFormChange("bio", e.target.value)}
                      className="w-full p-3 bg-[#1F2937] border border-[#1F2937] focus:border-[#374151] rounded-xl text-xs font-bold text-slate-300 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-800 cursor-pointer flex items-center justify-center"
                  >
                    {isSubmitting ? "Registering..." : "Add Mentor Profile"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT ALLOCATION PANEL */}
          {activeTab === "allocate" && (
            <div className="max-w-2xl bg-[#111827] border border-[#1F2937] rounded-[24px] p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Client Allocation Panel</h3>
                <p className="text-[9px] text-[#8C8CA1] font-bold mt-0.5">Assign unallocated traders to verified mentorship coaches</p>
              </div>

              <form onSubmit={handleAllocate} className="space-y-5">
                {/* Select Client */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                    Select Unassigned Client ({adminData?.unassignedClients?.length || 0} unassigned)
                  </label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 h-11 rounded-xl bg-[#1F2937] border border-[#1F2937] focus:border-[#374151] text-xs font-bold text-slate-300 focus:outline-none"
                  >
                    <option value="">-- Choose Client --</option>
                    {adminData?.unassignedClients?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Mentor */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                    Select Mentor Coach (Capacity limits checked)
                  </label>
                  <select
                    required
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    className="w-full px-4 h-11 rounded-xl bg-[#1F2937] border border-[#1F2937] focus:border-[#374151] text-xs font-bold text-slate-300 focus:outline-none"
                  >
                    <option value="">-- Choose Mentor --</option>
                    {adminData?.mentors?.map((m: any) => {
                      const isFull = m.activeClientsCount >= m.capacity;
                      return (
                        <option key={m.id} value={m.id} disabled={isFull}>
                          {m.name} - Specialization: {m.specialization || "General"} ({m.activeClientsCount} / {m.capacity} Active) {isFull ? "[LIMIT REACHED]" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || adminData?.unassignedClients?.length === 0}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-800 cursor-pointer flex items-center justify-center"
                >
                  {isSubmitting ? "Allocating..." : "Confirm Allocation Setup"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SYSTEM REVIEW REQUESTS */}
          {activeTab === "reviews" && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mentorship Review Log Feed</h3>
              {adminData?.reviewRequests?.length > 0 ? (
                <div className="space-y-4">
                  {adminData.reviewRequests.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-5 bg-[#1F2937]/30 border border-[#1F2937] rounded-[20px] flex flex-col sm:flex-row justify-between items-start gap-4 text-xs font-bold"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-[#8C8CA1] uppercase tracking-wider">Request ID: {req.id}</span>
                          <span
                            className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-wider ${
                              req.status === "COMPLETED"
                                ? "bg-[#15B77A]/10 text-[#15B77A]"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white">
                          Client: {req.Client.name} • Mentor: {req.Mentor.name}
                        </h4>
                        <p className="text-slate-400 font-semibold max-w-xl">
                          Trader's Notes: "{req.clientNotes || "No notes."}"
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 space-y-1">
                        <span className="text-[8px] font-black text-slate-500 block uppercase">
                          Submitted on {new Date(req.submittedAt).toLocaleDateString()}
                        </span>
                        {req.completedAt && (
                          <span className="text-[8px] font-black text-[#15B77A] block uppercase">
                            Evaluated on {new Date(req.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8C8CA1] font-semibold text-center py-12">
                  No review requests submitted in the system yet.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
