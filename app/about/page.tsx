import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="p-8 text-center space-y-4 font-sans">
      <h1 className="text-2xl font-bold text-slate-800">About Trade Adhyayan</h1>
      <p className="text-slate-600 text-sm">Trade Adhyayan is a powerful trading journal and analytics platform.</p>
      <Link href="/dashboard" className="inline-block px-4 py-2 bg-[#7C4DFF] text-white text-xs font-bold rounded-xl hover:bg-[#7C4DFF]/90 transition-all">
        Go to Dashboard
      </Link>
    </div>
  );
}