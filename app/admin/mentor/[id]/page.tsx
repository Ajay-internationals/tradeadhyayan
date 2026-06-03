"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMentorDetailsForAdmin } from "@/app/actions/trades";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Activity,
  Sliders,
  Calendar,
  AlertCircle
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.id as string;
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true);
        const data = await getMentorDetailsForAdmin(mentorId);
        if (!data) {
          toast.error("Mentor not found.");
          router.push("/admin");
          return;
        }
        setMentor(data);
      } catch (err) {
        console.error("Error fetching mentor details:", err);
        toast.error("Failed to load mentor details.");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };
    if (mentorId) fetchMentor();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading Mentor Details...</p>
        </div>
      </div>
    );
  }

  if (!mentor) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-8 text-left">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mentor Inspector</h1>
            <p className="text-xs text-slate-500 font-bold">Deep performance audit & profile directory</p>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card Left: Profile Header & Details */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[28px] p-6 space-y-6 shadow-sm">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto">
                <span className="text-white font-extrabold text-2xl uppercase">
                  {mentor.name.slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">{mentor.name}</h2>
                <p className="text-xs text-indigo-600 font-bold">{mentor.designation || "Trading Mentor"}</p>
              </div>
              <span className="inline-block px-3 py-1 text-[9px] font-black bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 uppercase tracking-wider">
                {mentor.status}
              </span>
            </div>

            <hr className="border-slate-100" />

            {/* Information Info List */}
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400" />
                <span className="truncate">{mentor.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400" />
                <span>{mentor.phone || "No phone listed"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase size={16} className="text-slate-400" />
                <span>Specialization: {mentor.specialization || "General"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Award size={16} className="text-slate-400" />
                <span>Experience: {mentor.experience || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Sliders size={16} className="text-slate-400" />
                <span>Payout Share: {mentor.payoutShare}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-slate-400" />
                <span>Capacity: {mentor.MentorClient?.length || 0} / {mentor.capacity} Clients</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Biography</span>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                "{mentor.bio || "No profile bio provided yet."}"
              </p>
            </div>
          </div>

          {/* Card Right: KPI Metrics & Client Assignments */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Quality Score", val: `${mentor.MentorKpi?.qualityScore ?? 0}%`, color: "text-indigo-600" },
                { label: "Average Rating", val: `⭐ ${(mentor.averageRating ?? 0).toFixed(1)}`, color: "text-amber-500" },
                { label: "Reviews Completed", val: mentor.totalReviewsCompleted ?? 0, color: "text-slate-900" },
                { label: "SLA Breaches", val: mentor.MentorSlaLog?.length ?? 0, color: mentor.MentorSlaLog?.length > 0 ? "text-rose-600" : "text-slate-400" }
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-white border border-slate-200 rounded-[20px] shadow-sm space-y-1">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                  <span className={`text-xl font-black block ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>

            {/* Active Clients */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Active Client Allocations</h3>
              {mentor.MentorClient?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mentor.MentorClient.map((mc: any) => (
                    <div key={mc.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="text-xs font-bold">
                        <p className="text-slate-900 font-black">{mc.Client?.name}</p>
                        <p className="text-slate-500 font-semibold mt-0.5">{mc.Client?.email}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full uppercase tracking-wider">
                        {mc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold py-4 text-center">No active client allocations at this time.</p>
              )}
            </div>

            {/* Platform Sessions */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Scheduled 1:1 Sessions</h3>
              {mentor.MentorSession?.length > 0 ? (
                <div className="overflow-x-auto text-xs font-bold text-slate-700">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[8px] font-black uppercase">
                        <th className="py-2 px-2">Trader Client</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Scheduled At</th>
                        <th className="py-2 px-2">Duration</th>
                        <th className="py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentor.MentorSession.map((sess: any) => (
                        <tr key={sess.id} className="border-b border-slate-50">
                          <td className="py-3 px-2 font-black text-slate-900">{sess.Client?.name}</td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px]">
                              {sess.sessionType}
                            </span>
                          </td>
                          <td className="py-3 px-2">{new Date(sess.scheduledAt).toLocaleString()}</td>
                          <td className="py-3 px-2 text-slate-500">{sess.durationMins}m</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase border ${
                              sess.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                              {sess.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold py-4 text-center">No session history found.</p>
              )}
            </div>

            {/* Audit Logs */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Performance Audit Logs</h3>
              {mentor.MentorAudit?.length > 0 ? (
                <div className="space-y-4">
                  {mentor.MentorAudit.map((log: any) => (
                    <div key={log.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2 text-xs font-bold">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded border ${
                            log.severity === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {log.severity}
                          </span>
                          <span className="text-indigo-600 text-[10px]">{log.auditType}</span>
                        </div>
                        <span className="text-[8px] text-slate-400 font-black">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 font-semibold leading-relaxed">"{log.description}"</p>
                      {log.adminNotes && (
                        <p className="text-[10px] text-slate-500 border-t border-slate-100 pt-2"><span className="font-extrabold text-slate-600">Admin Note:</span> {log.adminNotes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold py-4 text-center">Clean record. No audit logs recorded.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
