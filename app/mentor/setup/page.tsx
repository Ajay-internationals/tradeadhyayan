"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  getMentorSetupStatus,
  saveMentorProfile,
  saveMentorAvailability,
  saveMentorSetupWizardStep,
  acceptMentorAgreement,
  updateMentorStatusDetail
} from "@/app/actions/trades";
import {
  User,
  FileText,
  Clock,
  Briefcase,
  Globe,
  Award,
  Shield,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Eye
} from "lucide-react";

export default function MentorSetupWizardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Completed steps tracker from database
  const [dbWizardState, setDbWizardState] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: "",
    bio: "",
    experience: "3",
    dateOfBirth: "",
    city: "",
    tradingStyle: [] as string[],
    segments: [] as string[],
    specializations: [] as string[],
    languages: [] as string[],
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] as string[],
    startTime: "18:00",
    endTime: "21:00",
    slotDuration: 30,
    statusDetail: "AVAILABLE",
    signature: "",
    agreementAccepted: false,
    certifications: ""
  });

  useEffect(() => {
    const userEmail = localStorage.getItem("trade_adhyayan_user");
    if (!userEmail) {
      router.push("/login");
      return;
    }
    setEmail(userEmail);
    fetchSetupStatus(userEmail);
  }, []);

  const fetchSetupStatus = async (userEmail: string) => {
    try {
      setLoading(true);
      const res = await getMentorSetupStatus(userEmail);
      if (res.wizardCompleted) {
        toast.success("Setup already completed!");
        router.push("/mentor");
        return;
      }
      setDbWizardState(res.wizard);

      // Pre-fill some default values or existing DB values if available
      // For now we set state
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load onboarding wizard details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectToggle = (field: "tradingStyle" | "segments" | "specializations" | "languages" | "workingDays", val: string) => {
    setFormData((prev) => {
      const arr = prev[field] as string[];
      if (arr.includes(val)) {
        return { ...prev, [field]: arr.filter((item) => item !== val) };
      } else {
        return { ...prev, [field]: [...arr, val] };
      }
    });
  };

  const handleNextStep = async () => {
    try {
      setSubmitting(true);
      // Validate current step and save progress
      if (currentStep === 1) {
        if (!formData.name.trim()) {
          toast.error("Name is required.");
          return;
        }
        await saveMentorProfile(email, {
          name: formData.name,
          phone: formData.phone,
          profileImage: formData.profileImage,
        });
        await saveMentorSetupWizardStep(email, "step1Photo", true);
      } else if (currentStep === 2) {
        if (!formData.bio.trim() || formData.bio.length < 50) {
          toast.error("Please write a bio of at least 50 characters.");
          return;
        }
        await saveMentorProfile(email, {
          bio: formData.bio,
        });
        await saveMentorSetupWizardStep(email, "step2Bio", true);
      } else if (currentStep === 3) {
        await saveMentorProfile(email, {
          experience: formData.experience,
          tradingStyle: formData.tradingStyle.join(","),
          certifications: formData.certifications,
        });
        await saveMentorSetupWizardStep(email, "step3Experience", true);
      } else if (currentStep === 4) {
        if (formData.specializations.length === 0) {
          toast.error("Select at least one specialization.");
          return;
        }
        await saveMentorProfile(email, {
          specialization: formData.specializations.join(","),
        });
        await saveMentorSetupWizardStep(email, "step4Specialize", true);
      } else if (currentStep === 5) {
        if (formData.languages.length === 0) {
          toast.error("Select at least one language.");
          return;
        }
        await saveMentorProfile(email, {
          languages: formData.languages.join(","),
        });
        await saveMentorSetupWizardStep(email, "step5Languages", true);
      } else if (currentStep === 6) {
        if (formData.workingDays.length === 0) {
          toast.error("Select at least one working day.");
          return;
        }
        await saveMentorAvailability(email, {
          workingDays: formData.workingDays.join(","),
          startTime: formData.startTime,
          endTime: formData.endTime,
          slotDuration: Number(formData.slotDuration),
        });
        await saveMentorSetupWizardStep(email, "step6Availability", true);
      } else if (currentStep === 7) {
        await updateMentorStatusDetail(email, formData.statusDetail);
        await saveMentorSetupWizardStep(email, "step7Status", true);
      } else if (currentStep === 8) {
        if (!formData.agreementAccepted) {
          toast.error("Please check the agreement acceptance box.");
          return;
        }
        if (!formData.signature.trim()) {
          toast.error("Digital signature is required. Type your name.");
          return;
        }
        await acceptMentorAgreement(email, "v1.0", "127.0.0.1", navigator.userAgent);
        toast.success("Wizard setup complete! Welcome to Trade Adhyayan Mentorship.");
        router.push("/mentor");
        return;
      }

      // Proceed to next step
      setCurrentStep((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save wizard progress.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const stepsList = [
    { num: 1, label: "Identity", icon: User },
    { num: 2, label: "Bio", icon: FileText },
    { num: 3, label: "Experience", icon: Briefcase },
    { num: 4, label: "Specialties", icon: Award },
    { num: 5, label: "Languages", icon: Globe },
    { num: 6, label: "Schedule", icon: Clock },
    { num: 7, label: "Status", icon: Activity },
    { num: 8, label: "Agreement", icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-bold">Loading Wizard Setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex flex-col justify-between py-10 px-4 md:px-8">
      <Toaster position="top-right" />

      {/* HEADER PROGRESS */}
      <header className="max-w-5xl w-full mx-auto mb-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-extrabold tracking-wider uppercase mb-3">
            Setup Wizard
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Mentor Account Setup</h1>
          <p className="text-slate-500 text-xs mt-1">Complete these steps to activate your Trade Adhyayan mentor profile</p>
        </div>

        {/* STEPPER INDICATOR */}
        <div className="relative flex justify-between items-center max-w-3xl mx-auto mt-8">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          />

          {stepsList.map((step) => {
            const Icon = step.icon;
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;

            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <button
                  disabled={!isCompleted && !isActive}
                  onClick={() => setCurrentStep(step.num)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-indigo-600 border-indigo-600 text-white cursor-pointer"
                      : isActive
                      ? "bg-white border-indigo-600 text-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-110"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
                </button>
                <span
                  className={`text-[9px] md:text-[10px] font-bold mt-2 hidden sm:block ${
                    isActive ? "text-indigo-600 font-extrabold" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {/* CONTENT BOX */}
      <main className="max-w-3xl w-full mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex-grow shadow-xl shadow-slate-100 flex flex-col justify-between">
        <div className="space-y-6">
          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="text-indigo-600" size={20} /> Identity Setup
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your professional display name"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Phone / Contact Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleInputChange}
                    placeholder="Link to your profile picture (or leave blank for initials)"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BIO */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="text-indigo-600" size={20} /> About & Bio
              </h2>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tell clients about your trading background, style & mentoring goals (min 50 chars) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={6}
                  maxLength={1000}
                  placeholder="Provide a detailed overview of your trading career, your market edge, and how you help junior traders learn..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium resize-none"
                />
                <div className="flex justify-end mt-2 text-[10px] font-bold text-slate-400">
                  {formData.bio.length} / 1000 characters
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="text-indigo-600" size={20} /> Trading Experience
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Trading Experience (Years)
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold cursor-pointer"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="4">4 Years</option>
                    <option value="5">5 Years</option>
                    <option value="7">7 Years</option>
                    <option value="10">10+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Preferred Trading Styles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Intraday", "Swing", "Scalping", "Position Trading", "Momentum", "Hedging"].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleMultiSelectToggle("tradingStyle", style)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          formData.tradingStyle.includes(style)
                            ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Certifications / Credentials
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="e.g. NISM Series VIII, CMT, CFA, etc."
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SPECIALIZATIONS */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="text-indigo-600" size={20} /> Core Specializations
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Select the domains where you hold primary expertise. This helps match you with relevant clients.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Options Buying",
                    "Options Selling",
                    "Swing Trading",
                    "Equity Investing",
                    "Psychology Coaching",
                    "Risk Management",
                    "Price Action",
                    "Technical Analysis",
                    "Algorithms / Systems",
                    "Commodities / FX"
                  ].map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleMultiSelectToggle("specializations", spec)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                        formData.specializations.includes(spec)
                          ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{spec}</span>
                      {formData.specializations.includes(spec) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: LANGUAGES */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe className="text-indigo-600" size={20} /> Languages Spoken
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Select all languages you can comfortably communicate in during 1:1 sessions.</p>
                <div className="grid grid-cols-3 gap-3">
                  {["English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali", "Malayalam"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleMultiSelectToggle("languages", lang)}
                      className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        formData.languages.includes(lang)
                          ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: AVAILABILITY */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="text-indigo-600" size={20} /> Weekly Availability Setup
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleMultiSelectToggle("workingDays", day)}
                        className={`w-12 h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formData.workingDays.includes(day)
                            ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Session Slot Duration
                  </label>
                  <select
                    name="slotDuration"
                    value={formData.slotDuration}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold cursor-pointer"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: STATUS CONTROL */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="text-indigo-600" size={20} /> Mentor Status & Capacity
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Specify your availability detail status. You can update this status dynamically inside the Mentor Arena dashboard at any time.</p>
                <div className="space-y-3">
                  {[
                    {
                      id: "AVAILABLE",
                      title: "Available",
                      desc: "Accepting reviews and active scheduling requests.",
                      color: "text-emerald-700 bg-emerald-50 border-emerald-200"
                    },
                    {
                      id: "BUSY",
                      title: "Busy",
                      desc: "Not accepting new reviews temporarily. Retain existing students only.",
                      color: "text-amber-700 bg-amber-50 border-amber-200"
                    },
                    {
                      id: "ON_LEAVE",
                      title: "On Leave / Pause",
                      desc: "All activities paused. No calendar bookings or reviews queue.",
                      color: "text-rose-700 bg-rose-50 border-rose-200"
                    }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, statusDetail: st.id }))}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.statusDetail === st.id
                          ? `${st.color} border-indigo-500`
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="mt-1">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${formData.statusDetail === st.id ? "border-indigo-500" : "border-slate-300"}`}>
                          {formData.statusDetail === st.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{st.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: AGREEMENT */}
          {currentStep === 8 && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Shield className="text-indigo-600" size={20} /> Mentor Agreement
              </h2>
              <div className="space-y-4">
                <div className="h-48 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed space-y-3">
                  <p className="font-extrabold text-slate-900">TRADE ADHYAYAN MENTORSHIP SERVICE AGREEMENT (v1.0)</p>
                  <p>This agreement outlines the operational rules and expectations for acting as an certified mentor on the Trade Adhyayan online educational platform.</p>
                  <p><span className="font-bold text-slate-800">1. Role & Professional Ethics:</span> As a mentor, you agree to conduct professional journal evaluations, hold booked 1:1 sessions, and provide feedback matching the curriculum. No financial advice or calls/tips are allowed under any circumstances.</p>
                  <p><span className="font-bold text-slate-800">2. SLA Commitments:</span> Review queue submissions must be processed within 24 hours of user submission. Regular breach of this response SLA may result in category demotion or suspension.</p>
                  <p><span className="font-bold text-slate-800">3. Revenue Share & Payouts:</span> Payouts are compiled on a calendar month basis. Mentor category governs the share rate (Junior: 25%, Senior: 35%, Lead/Head: 40%). Payouts are transferred automatically following admin verification of active mentorship metrics.</p>
                  <p><span className="font-bold text-slate-800">4. Client Confidentiality:</span> Mentors must not share details of client trade sheets, journals, or conversation messages outside of the Trade Adhyayan system platform.</p>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="agreementAccepted"
                    checked={formData.agreementAccepted}
                    onChange={(e) => setFormData((prev) => ({ ...prev, agreementAccepted: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded bg-white cursor-pointer focus:ring-indigo-500"
                  />
                  <label htmlFor="agreementAccepted" className="text-xs text-slate-600 font-medium select-none cursor-pointer">
                    I acknowledge that I have read and agree to all terms outlined in this Mentor Agreement.
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Digital Signature (Type your Full Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="signature"
                    value={formData.signature}
                    onChange={handleInputChange}
                    placeholder="Type your name to sign"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV BUTTONS */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || submitting}
            className={`flex items-center gap-2 h-10 px-5 rounded-xl text-xs font-bold transition-all border ${
              currentStep === 1 || submitting
                ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
            }`}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={submitting}
            className="flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-bold transition-all text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : currentStep === 8 ? (
              "Complete & Submit"
            ) : (
              <>
                Next <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
