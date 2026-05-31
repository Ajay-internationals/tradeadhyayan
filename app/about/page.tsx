import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-purple/20">
      <Navbar />

      <main className="flex-1 pt-32 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Title block */}
            <div className="space-y-6 text-center">
              <h1 className="text-5xl md:text-7xl font-heading font-black text-slate-900 tracking-tight leading-[1.1]">
                Built for <span className="text-brand-purple">Traders</span>, <br />
                by <span className="text-brand-blue">Traders</span>.
              </h1>
              <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                Trade Adhyayan was born out of the frustration of repeating the same mistakes and the need for a scientific approach to trading.
              </p>
            </div>

            {/* Banner Image */}
            <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=2000"
                alt="Trading Environment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                <div className="text-white">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80">Our Mission</p>
                  <h2 className="text-3xl font-black mt-2">Empowering consistency in every trade.</h2>
                </div>
              </div>
            </div>

            {/* Story Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Our Story</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  We started Trade Adhyayan in 2024 with a simple goal: to help traders stop gambling and start performing like professionals. We realized that most traders don&apos;t lack a good strategy; they lack the discipline to follow it and the tools to analyze their failures objectively.
                </p>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Our platform is designed to be the ultimate companion for your trading journey, providing you with the insights you need to master your psychology and build a sustainable edge in the market.
                </p>
              </div>

              {/* Philosophies */}
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Our Philosophy</h3>
                <div className="space-y-4">
                  
                  <div className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-purple shadow-sm shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Data Over Intuition</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        Every trade is a data point. We help you connect the dots.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-purple shadow-sm shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Discipline is Freedom</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        Mastering yourself is the only way to master the market.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-purple shadow-sm shrink-0">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Continuous Learning</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        The market is a teacher. We help you become its best student.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="mt-40 text-center max-w-4xl mx-auto space-y-20">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tight">
                  Meet the Minds Behind the Platform
                </h2>
                <p className="text-lg text-slate-600 font-medium">
                  A passionate team of traders, developers, and analysts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { name: "Ajay Sharma", role: "Co-Founder &amp; Trader", img: "https://i.pravatar.cc/600?img=11" },
                  { name: "Rahul Verma", role: "Chief Architect", img: "https://i.pravatar.cc/600?img=12" },
                  { name: "Priya Patel", role: "Risk Analyst", img: "https://i.pravatar.cc/600?img=13" },
                ].map((member, idx) => (
                  <div key={idx} className="group space-y-6">
                    <div className="aspect-[4/5] rounded-[2.5rem] bg-slate-100 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                      <img
                        src={member.img}
                        alt="Team Member"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-brand-purple/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight font-heading">{member.name}</h4>
                      <p
                        className="text-sm font-bold text-brand-purple uppercase tracking-widest mt-1"
                        dangerouslySetInnerHTML={{ __html: member.role }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA block */}
            <div className="mt-40 relative p-16 md:p-24 rounded-[4rem] bg-slate-900 text-white overflow-hidden text-center">
              <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight leading-tight">
                  Join Our Journey to Better Trading.
                </h2>
                <Link
                  className="inline-flex px-12 py-6 bg-brand-purple text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-brand-purple/40 hover:bg-brand-purple/90 hover:-translate-y-1 transition-all items-center gap-3"
                  href="/signup"
                >
                  Get Started Free <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
