import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, CheckCircle, AlertTriangle, Activity, Search, Filter, 
  ChevronLeft, ChevronRight, Download, Info, Settings,
  Database, ShieldAlert, FileText, Trash2, CheckSquare, Square
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Victim } from "./types";
import { MetricCard } from "./components/MetricCard";
import { VictimCard } from "./components/VictimCard";
import { VictimModal } from "./components/VictimModal";
import { DataSettingsModal } from "./components/DataSettingsModal";
import { SunAndLion, Rose } from "./components/Illustrations";

export default function App() {
  const [lang, setLang] = useState<"en" | "fa">("fa");
  const [step, setStep] = useState<"intro" | "magnitude" | "gallery">("intro");
  const [victims, setVictims] = useState<Victim[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Confirmed by State" | "Citizen Only" | "Awaiting Review">("All");
  const [selectedVictim, setSelectedVictim] = useState<Victim | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 24;

  const t = {
    en: {
      title: "Javid Name",
      subtitle: "Verification & Accountability Portal",
      introTitle: "Javid Name",
      introSub: "A digital memorial dedicated to the souls documented by the people.",
      introAction: "Begin Remembrance",
      magnitudeTitle: "The Magnitude of Truth",
      magnitudeSub: "The discrepancy between citizen documentation and official recognition.",
      kpi1: "Citizen Reports",
      kpi2: "Official Recognition",
      kpi3: "The Truth Gap",
      pezeshkianCount: "Total names announced by the Pezeshkian government",
      telegramCount: "Total names from 'Remember the Names' Telegram channel",
      currentDate: "As of February 22, 2026",
      downloadCsv: "Download Pezeshkian Records (CSV)",
      viewJson: "View JSON Data",
      telegramLink: "Telegram Channel",
      galleryTitle: "The Faces of",
      gallerySub: "Individual stories of those we remember.",
      back: "Back",
      loading: "Gathering Evidence...",
      records: "Records",
      search: "Search name...",
      noRecords: "No records found"
    },
    fa: {
      title: "جاوید نام",
      subtitle: "پورتال تایید و پاسخگویی",
      introTitle: "جاوید نام",
      introSub: "بنای یادبود دیجیتال برای جان‌های مستند شده توسط مردم.",
      introAction: "آغاز روایت",
      magnitudeTitle: "ابعاد حقیقت",
      magnitudeSub: "شکاف میان مستندات مردمی و تاییدات رسمی نهادها.",
      kpi1: "گزارش‌های مردمی",
      kpi2: "تایید رسمی",
      kpi3: "شکاف حقیقت",
      pezeshkianCount: "تعداد کل اسامی اعلام شده توسط دولت پزشکیان",
      telegramCount: "تعداد کل اسامی اعلام شده از گزارش‌های مردمی در کانال تلگرامی «نام‌ها را بخاطر بسپار»",
      currentDate: "تا تاریخ ۴ اسفند ۱۴۰۴",
      downloadCsv: "دانلود فایل CSV جزئیات (دولت پزشکیان)",
      viewJson: "مشاهده فایل JSON",
      telegramLink: "کانال تلگرام",
      galleryTitle: "چهره‌های",
      gallerySub: "روایت انفرادی کسانی که به یاد می‌آوریم.",
      back: "بازگشت",
      loading: "در حال گردآوری شواهد...",
      records: "رکورد",
      search: "جستجوی نام...",
      noRecords: "موردی یافت نشد"
    }
  }[lang];

  const fetchData = useCallback(() => {
    fetch("/api/victims?limit=10000")
      .then(res => res.json())
      .then(data => {
        setVictims(data.victims);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [loading]);

  const handleVerify = async (name: string, status: "Verified" | "Unverified") => {
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });
      if (response.ok) {
        setVictims(prev => prev.map(v => v.name === name ? { ...v, manualStatus: status } : v));
        if (selectedVictim?.name === name) {
          setSelectedVictim(prev => prev ? { ...prev, manualStatus: status } : null);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const filteredVictims = useMemo(() => {
    return victims.filter(v => {
      const isVerified = (v.manualStatus || v.status) === "Verified";
      const isAwaiting = v.score >= 80 && v.score < 95 && !v.manualStatus;
      
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === "Confirmed by State") matchesStatus = isVerified;
      if (statusFilter === "Citizen Only") matchesStatus = !isVerified;
      if (statusFilter === "Awaiting Review") matchesStatus = isAwaiting;

      return matchesSearch && matchesStatus;
    });
  }, [victims, searchTerm, statusFilter]);

  const paginatedVictims = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVictims.slice(start, start + itemsPerPage);
  }, [filteredVictims, currentPage]);

  const totalPages = Math.ceil(filteredVictims.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalReported = victims.length;
    const confirmedCount = victims.filter(v => (v.manualStatus || v.status) === "Verified").length;
    const gap = Math.max(0, totalReported - confirmedCount);
    return { totalReported, confirmedCount, gap };
  }, [victims]);

  if (loading || loadingProgress < 100) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white ${lang === 'fa' ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-gray-100 rounded-full" />
            <motion.div 
              className="absolute w-24 h-24 border-2 border-imperial-gold border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute text-xl font-bold text-midnight-cobalt font-mono">
              {loadingProgress}%
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-imperial-gold font-bold tracking-[0.3em] uppercase text-[10px] farsi">{t.loading}</p>
            <div className="w-48 h-1 bg-gray-50 rounded-full overflow-hidden mx-auto">
              <motion.div 
                className="h-full bg-imperial-gold"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden bg-white ${lang === 'fa' ? 'rtl' : 'ltr'}`}>
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex flex-col items-center justify-center p-8 text-center relative"
          >
            <SunAndLion className="absolute w-[600px] h-[600px] text-imperial-gold/5 sun-ray-pulse pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <SunAndLion className="w-24 h-24 text-imperial-gold mx-auto mb-6" />
              </motion.div>
              <h1 className="text-7xl md:text-9xl font-bold text-midnight-cobalt farsi tracking-tighter">
                {t.introTitle}
              </h1>
              <p className="text-xl md:text-2xl text-midnight-cobalt/40 font-light farsi max-w-xl mx-auto">
                {t.introSub}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep("magnitude")}
                className="mt-12 px-12 py-4 bg-midnight-cobalt text-white rounded-full font-bold text-lg farsi hover:bg-imperial-gold transition-colors shadow-xl shadow-midnight-cobalt/20"
              >
                {t.introAction}
              </motion.button>
            </div>
            <div className="absolute top-8 right-8">
              <button onClick={() => setLang(lang === 'en' ? 'fa' : 'en')} className="text-xs font-bold text-midnight-cobalt/20 hover:text-imperial-gold uppercase tracking-widest">
                {lang === 'en' ? 'FA' : 'EN'}
              </button>
            </div>
          </motion.div>
        )}

        {step === "magnitude" && (
          <motion.div
            key="magnitude"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col items-center justify-center p-8 text-center bg-white"
          >
            <div className="max-w-5xl w-full space-y-16">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-bold text-midnight-cobalt farsi">{t.magnitudeTitle}</h2>
                <p className="text-lg text-midnight-cobalt/40 farsi">{t.magnitudeSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { 
                    label: t.kpi1, 
                    value: stats.totalReported, 
                    filter: "All" as const,
                    sub: `${t.telegramCount} ${t.currentDate}`,
                    links: [
                      { label: t.telegramLink, url: "https://t.me/RememberTheNames", icon: <Activity size={12} /> },
                      { label: t.viewJson, url: "/api/victims?format=json", icon: <FileText size={12} /> }
                    ]
                  },
                  { 
                    label: t.kpi2, 
                    value: stats.confirmedCount, 
                    filter: "Confirmed by State" as const,
                    sub: t.pezeshkianCount,
                    links: [
                      { label: t.downloadCsv, url: "/api/victims?format=csv&source=government", icon: <Download size={12} /> }
                    ]
                  },
                  { 
                    label: t.kpi3, 
                    value: stats.gap, 
                    filter: "Citizen Only" as const,
                    sub: t.magnitudeSub
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="group p-10 rounded-3xl border border-gray-100 hover:border-imperial-gold/30 hover:shadow-2xl transition-all bg-white relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-imperial-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div 
                      onClick={() => {
                        setStatusFilter(item.filter);
                        setStep("gallery");
                      }}
                      className="cursor-pointer"
                    >
                      <div className="text-7xl font-bold text-midnight-cobalt mb-4 group-hover:text-imperial-gold transition-colors">{item.value}</div>
                      <div className="text-xs uppercase tracking-[0.3em] font-bold text-midnight-cobalt/30 farsi mb-4">{item.label}</div>
                      {item.sub && (
                        <p className="text-[10px] text-midnight-cobalt/50 farsi leading-relaxed mb-6">
                          {item.sub}
                        </p>
                      )}
                    </div>

                    {item.links && (
                      <div className="mt-auto pt-6 border-t border-gray-50 flex flex-wrap gap-3 justify-center relative z-10">
                        {item.links.map((link, li) => (
                          <a 
                            key={li}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-imperial-gold hover:text-white text-[9px] font-bold rounded-full transition-all text-midnight-cobalt/60 farsi"
                          >
                            {link.icon}
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}

                    <Rose className="absolute -bottom-4 -right-4 w-20 h-20 text-imperial-gold/5 group-hover:text-imperial-gold/10 transition-colors pointer-events-none" />
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => setStep("intro")}
                className="text-xs font-bold text-midnight-cobalt/20 hover:text-imperial-gold uppercase tracking-widest farsi"
              >
                {t.back}
              </button>
            </div>
          </motion.div>
        )}

        {step === "gallery" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col bg-white"
          >
            <header className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-6">
                <button onClick={() => setStep("magnitude")} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <ChevronLeft size={24} className={lang === 'fa' ? 'rotate-180' : ''} />
                </button>
                <div>
                  <h3 className="text-2xl font-bold text-midnight-cobalt farsi">{t.galleryTitle} {t[statusFilter === 'All' ? 'kpi1' : statusFilter === 'Confirmed by State' ? 'kpi2' : 'kpi3']}</h3>
                  <p className="text-xs text-midnight-cobalt/30 farsi">{filteredVictims.length} {t.records}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute ${lang === 'fa' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-midnight-cobalt/20`} size={14} />
                  <input 
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`bg-gray-50 border border-gray-100 rounded-full py-2 ${lang === 'fa' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm focus:outline-none focus:border-imperial-gold/50 transition-all farsi w-64`}
                  />
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
                  <AnimatePresence mode="popLayout">
                    {paginatedVictims.map((victim, idx) => (
                      <VictimCard 
                        key={victim.id}
                        victim={victim} 
                        delay={idx * 0.02} 
                        onClick={setSelectedVictim}
                        lang={lang}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {filteredVictims.length === 0 && (
                  <div className="py-32 text-center">
                    <h3 className="text-lg font-medium text-midnight-cobalt/40 farsi">{t.noRecords}</h3>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-4">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="p-2 disabled:opacity-20"
                    >
                      <ChevronLeft size={20} className={lang === 'fa' ? 'rotate-180' : ''} />
                    </button>
                    <span className="text-xs font-bold text-midnight-cobalt/40 uppercase tracking-widest">
                      {currentPage} / {totalPages}
                    </span>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="p-2 disabled:opacity-20"
                    >
                      <ChevronRight size={20} className={lang === 'fa' ? 'rotate-180' : ''} />
                    </button>
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <VictimModal 
        isOpen={!!selectedVictim}
        victim={selectedVictim}
        onClose={() => setSelectedVictim(null)}
        onVerify={handleVerify}
        lang={lang}
      />
    </div>
  );
}
