"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminDetailsForAdmin } from "@/app/actions/trades";
import {
  ArrowLeft,
  Mail,
  User,
  Shield,
  Calendar,
  Lock,
  Activity,
  CheckCircle
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function AdminDetailPage() {
  const params = useParams();
  const router = useRouter();
  const adminId = params.id as string;
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);
        const data = await getAdminDetailsForAdmin(adminId);
        if (!data) {
          toast.error("Admin not found.");
          router.push("/admin");
          return;
        }
        setAdmin(data);
      } catch (err) {
        console.error("Error fetching admin details:", err);
        toast.error("Failed to load admin details.");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };
    if (adminId) fetchAdmin();
  }, [adminId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading Admin Profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 flex items-center justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm space-y-6 text-left">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Admin Profile</h1>
            <p className="text-[10px] text-slate-500 font-bold">System administrator records</p>
          </div>
        </div>

        {/* Profile Avatar / Logo */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto">
            <span className="text-white font-extrabold text-xl uppercase">
              {admin.name.slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">{admin.name}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Shield size={12} className="text-indigo-600" />
              <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">
                {admin.role} PRIVILEGES
              </span>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Account metadata list */}
        <div className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-slate-400" />
            <span className="truncate">{admin.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-slate-400" />
            <span>Member since: {new Date(admin.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-slate-400" />
            <span className="text-emerald-600 font-bold">Encrypted Credentials Stored</span>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Access logs/info notice */}
        <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-indigo-600" />
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">Administrative Capabilities</span>
          </div>
          <ul className="list-disc list-inside text-[10px] text-slate-600 font-semibold space-y-1 pl-1">
            <li>Register and manage coaching mentors</li>
            <li>Allocate students to mentorship queues</li>
            <li>Review logs, agreements, and sessions</li>
            <li>Broadcast system announcements</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
