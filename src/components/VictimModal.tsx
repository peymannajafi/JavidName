import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, ShieldCheck, MessageSquare, Clock, UserCheck } from "lucide-react";
import { Victim } from "../types";
import { format } from "date-fns";

interface VictimModalProps {
  victim: Victim | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (name: string, status: "Verified" | "Unverified") => void;
  lang?: "en" | "fa";
}

export const VictimModal: React.FC<VictimModalProps> = ({ victim, isOpen, onClose, onVerify, lang = "fa" }) => {
  if (!victim) return null;

  const isVerified = (victim.manualStatus || victim.status) === "Verified";

  const t = {
    en: {
      record: "Memorial Record",
      confirmed: "Confirmed by State",
      citizen: "Citizen Only",
      date: "Report Date",
      id: "Record ID",
      forensic: "Forensic Match Analysis",
      closest: "Closest official record",
      manual: "Manual Verification",
      override: "Override automated forensic results",
      revoke: "Revoke Verification",
      verify: "Verify Record",
      unknown: "Unknown"
    },
    fa: {
      record: "پرونده یادبود",
      confirmed: "تایید شده توسط دولت",
      citizen: "فقط گزارش شهروندی",
      date: "تاریخ گزارش",
      id: "شناسه پرونده",
      forensic: "تحلیل انطباق فورنزیک",
      closest: "نزدیک‌ترین رکورد رسمی",
      manual: "تایید دستی",
      override: "تغییر نتایج خودکار فورنزیک",
      revoke: "لغو تاییدیه",
      verify: "تایید پرونده",
      unknown: "نامشخص"
    }
  }[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 ${lang === 'fa' ? 'rtl' : 'ltr'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-midnight-cobalt/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className={`absolute top-4 ${lang === 'fa' ? 'left-4' : 'right-4'} z-10 p-2 bg-white/80 backdrop-blur rounded-full text-midnight-cobalt hover:bg-white transition-all shadow-sm`}
            >
              <X size={20} />
            </button>

            <div className="w-full md:w-1/2 bg-gray-50 aspect-[4/5] md:aspect-auto">
              <img
                src={victim.photo || `https://via.placeholder.com/600/800?text=${encodeURIComponent(victim.name)}`}
                alt={victim.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 overflow-y-auto flex flex-col">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-imperial-gold farsi">{t.record}</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <h2 className="farsi text-4xl font-bold text-midnight-cobalt mb-4">{victim.name}</h2>
                
                <div className="flex flex-wrap gap-3">
                  {isVerified ? (
                    <div className="bg-imperial-gold text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 farsi">
                      <UserCheck size={12} />
                      {t.confirmed}
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 farsi">
                      <AlertCircle size={12} />
                      {t.citizen}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-midnight-cobalt/40 mb-1">
                      <Calendar size={14} />
                      <span className="text-[10px] uppercase tracking-wider font-bold farsi">{t.date}</span>
                    </div>
                    <div className="text-sm font-medium farsi">
                      {victim.date ? format(new Date(victim.date), "MMMM d, yyyy") : t.unknown}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-midnight-cobalt/40 mb-1">
                      <Clock size={14} />
                      <span className="text-[10px] uppercase tracking-wider font-bold farsi">{t.id}</span>
                    </div>
                    <div className="text-sm font-mono font-medium">
                      #{victim.id}
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-midnight-cobalt/40">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] uppercase tracking-wider font-bold farsi">{t.forensic}</span>
                    </div>
                    <div className="text-xs font-bold text-imperial-gold">{victim.score}%</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-imperial-gold transition-all duration-1000"
                        style={{ width: `${victim.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-midnight-cobalt/60 italic farsi">
                      {t.closest}: <span className="text-midnight-cobalt font-medium">{victim.govMatch}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-midnight-cobalt/40 farsi">{t.manual}</h4>
                    <p className="text-[10px] text-midnight-cobalt/20 farsi">{t.override}</p>
                  </div>
                  <button
                    onClick={() => onVerify(victim.name, isVerified ? "Unverified" : "Verified")}
                    className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all farsi ${
                      isVerified 
                        ? "bg-gray-100 text-midnight-cobalt hover:bg-red-50" 
                        : "bg-imperial-gold text-white hover:bg-imperial-gold/90"
                    }`}
                  >
                    {isVerified ? t.revoke : t.verify}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import { AlertCircle } from "lucide-react";
