"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, User, Calendar, Clock, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Posts");

  const categories = [
    "All Posts",
    "Market Insights",
    "Psychology",
    "Strategy",
    "Performance",
    "Case Studies",
  ];

  const posts = [
    {
      id: "featured",
      category: "Market Insights",
      title: "Why 90% of Traders Lose Money in F&O: SEBI's Eye-Opening Report",
      excerpt: "An in-depth analysis of the recent regulatory findings detailing the realities of derivative trading retail volume in India.",
      author: "Ajay Sharma",
      date: "May 12, 2026",
      readTime: "8 min read",
      img: "https://images.unsplash.com/photo-1611974717535-7c446a05eb4c?auto=format&fit=crop&q=80&w=800",
      featured: true,
    },
    {
      id: "0",
      category: "Psychology",
      title: "How to Stop Revenge Trading Once and For All",
      excerpt: "Practical psychological strategies and journal-based rules to prevent the emotional spiral of recovery trades.",
      author: "Ajay Sharma",
      date: "May 10, 2026",
      readTime: "5 min read",
      img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "1",
      category: "Strategy",
      title: "5 Essential Metrics Every Profitable Trader Tracks",
      excerpt: "Beyond just P&L—learn why Win Rate, Profit Factor, and Average RR are the true indicators of a sustainable edge.",
      author: "Priya Patel",
      date: "May 08, 2026",
      readTime: "6 min read",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "2",
      category: "Performance",
      title: "The Power of Post-Trade Review: A Step-by-Step Guide",
      excerpt: "How to conduct a meaningful weekend review that actually leads to performance improvements the following week.",
      author: "Rahul Verma",
      date: "May 05, 2026",
      readTime: "7 min read",
      img: "https://images.unsplash.com/photo-1642790103300-97e452138d58?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All Posts" || post.category === activeCategory;
    return matchesSearch && matchesCategory && !post.featured;
  });

  const featuredPost = posts.find((p) => p.featured);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-purple/20">
      <Navbar />

      <main className="flex-1 pt-32 pb-32">
        <div className="container mx-auto px-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl md:text-7xl font-heading font-black text-slate-900 tracking-tight leading-[1.1]">
                Insights for <span className="text-brand-purple">Smarter Trading</span>.
              </h1>
              <p className="text-xl text-slate-600 font-medium leading-relaxed">
                Practical guides, market insights, and psychological tips to help you master your performance.
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Featured Post Card */}
          {featuredPost && activeCategory === "All Posts" && !searchQuery && (
            <div className="group relative aspect-[21/9] rounded-[3rem] overflow-hidden mb-20 shadow-2xl">
              <img
                src={featuredPost.img}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple text-white text-[10px] font-black uppercase tracking-widest">
                  Featured Post
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl leading-tight font-heading">
                  {featuredPost.title}
                </h2>
                <div className="flex items-center gap-6 text-white/60 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {featuredPost.readTime}
                  </div>
                </div>
              </div>
              <Link className="absolute inset-0 z-10" href={`/blog/${featuredPost.id}`}></Link>
            </div>
          )}

          {/* Category Filter buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer border ${
                  activeCategory === cat
                    ? "bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20"
                    : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="group space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="aspect-[4/3] rounded-[2.5rem] bg-slate-100 overflow-hidden relative shadow-sm">
                      <img
                        src={post.img}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-brand-purple border border-white">
                        {post.category}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-brand-purple transition-colors font-heading">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar className="w-4 h-4" /> {post.date}
                    </div>
                    <Link
                      className="text-sm font-black text-slate-900 flex items-center gap-2 group-hover:gap-3 transition-all"
                      href={`/blog/${post.id}`}
                    >
                      Read More <ArrowRight className="w-4 h-4 text-brand-purple" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold">
                No articles found matching filters.
              </div>
            )}
          </div>

          {/* Newsletter Box */}
          <div className="mt-32 p-16 rounded-[4rem] bg-slate-50 border border-slate-100 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight font-heading">
                Stay Ahead of the Market
              </h2>
              <p className="text-lg text-slate-600 font-medium max-w-xl mx-auto">
                Get the latest trading guides and performance tips delivered straight to your inbox.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-6 py-5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium text-slate-900 shadow-sm"
              />
              <button className="w-full sm:w-auto px-10 py-5 bg-brand-purple text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all cursor-pointer">
                Subscribe
              </button>
            </div>
            
            <p className="text-xs text-slate-400 font-medium italic">
              Join 5,000+ traders already subscribed.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
