import React from "react";
import { getMentorDashboard } from "@/app/actions/mentorship";
import { ArrowRight, UserCircle, Target, Shield, BrainCircuit, Flag } from "lucide-react";
import Link from "next/link";

export default async function MentorReviewsPage({ searchParams }: { searchParams: { id?: string } }) {
  const email = "student3_profit@tradeadhyayan.com"; 
  let data;
  try {
    data = await getMentorDashboard(email);
  } catch(e) {
    data = { reviewRequests: [] };
  }

  // If a specific review ID is passed, we show the review form, otherwise the list
  const activeReview = data.reviewRequests.find((r:any) => r.id === searchParams.id) || data.reviewRequests[0];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center h-[44px]">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Mentor Review</h1>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Trades Shared", val: "12" },
          { label: "Reviewed", val: "8" },
          { label: "Avg Mentor Score", val: "78" },
          { label: "Improvement Areas", val: "3" },
          { label: "Action Taken", val: "Yes" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white p-4 rounded-[16px] border border-[#E7EAF3] shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">{kpi.label}</span>
            <h2 className="text-xl font-black text-[#0F172A]">{kpi.val}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-4">Recent Reviews</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-[#64748B] border-b border-[#E7EAF3]">
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Client</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Mentor Score</th>
                    <th className="pb-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reviewRequests.map((r:any) => (
                    <tr key={r.id} className="border-b border-[#E7EAF3] last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-2 text-sm text-[#64748B]">{new Date(r.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <UserCircle size={18} className="text-[#6D3DF5]"/>
                          <span className="font-bold text-sm text-[#0F172A]">{r.Client?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === 'COMPLETED' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm font-semibold">{r.MentorshipReview?.overallScore || "-"} / 100</td>
                      <td className="py-3 px-2">
                        <Link href={`/mentor/reviews?id=${r.id}`} className="text-[#6D3DF5] hover:text-[#5b32d4] text-xs font-bold">
                          {r.status === 'PENDING' ? 'Grade Now' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Mentor Summary / Feedback Form */}
        <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">Mentor Summary</h3>
          {activeReview ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#E7EAF3]">
                <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Review for {activeReview.Client?.name}</p>
                  <p className="text-xs text-[#64748B]">{activeReview.status}</p>
                </div>
              </div>

              {activeReview.status === "COMPLETED" && activeReview.MentorshipReview ? (
                <>
                  <div className="bg-[#FAFAFF] p-4 rounded-[12px] border border-[#E7EAF3] text-sm text-[#0F172A] italic">
                    "{activeReview.MentorshipReview.mentorRemark || "Good job following the plan this week."}"
                  </div>
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-[#16A34A] uppercase">Top Strengths</p>
                    <p className="text-sm text-[#0F172A]">{activeReview.MentorshipReview.strengths}</p>
                    <p className="text-xs font-bold text-[#E11D48] uppercase mt-3">Focus Areas</p>
                    <p className="text-sm text-[#0F172A]">{activeReview.MentorshipReview.nextWeekFocus}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-500">Grading form placeholder (Client component handles form submission)</p>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0F172A]">Execution Score</label>
                    <input type="range" min="0" max="100" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0F172A]">Risk Score</label>
                    <input type="range" min="0" max="100" className="w-full" />
                  </div>
                  <button className="w-full bg-[#6D3DF5] text-white py-2 rounded-[12px] font-bold text-sm">
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">Select a review to view details.</p>
          )}
        </div>

      </div>
    </div>
  );
}
