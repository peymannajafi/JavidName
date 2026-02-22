import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, Calendar, ShieldCheck, Info } from "lucide-react";
import { Victim } from "../types";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Rose } from "./Illustrations";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VictimCardProps {
  victim: Victim;
  delay?: number;
  onClick?: (victim: Victim) => void;
  lang?: "en" | "fa";
}

export const VictimCard: React.FC<VictimCardProps> = ({ victim, delay = 0, onClick, lang = "fa" }) => {
  const isVerified = (victim.manualStatus || victim.status) === "Verified";
  const isCitizenOnly = !isVerified;

  const t = {
    en: {
      confirmed: "Confirmed by State",
      citizen: "Citizen Only",
      unknown: "Unknown Date",
      match: "Match"
    },
    fa: {
      confirmed: "تایید شده توسط دولت",
      citizen: "فقط گزارش شهروندی",
      unknown: "تاریخ نامشخص",
      match: "انطباق"
    }
  }[lang];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8, transition: { duration: 0.4 } }}
      onClick={() => onClick?.(victim)}
      className={`bg-white rounded-2xl overflow-hidden cursor-pointer group flex flex-col h-full border border-gray-100/50 hover:border-imperial-gold/20 transition-all duration-500 ${lang === 'fa' ? 'rtl text-right' : 'ltr text-left'}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          src={victim.photo || `https://via.placeholder.com/400/500?text=${encodeURIComponent(victim.name)}`}
          alt={victim.name}
          className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-cobalt/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-5 flex flex-col flex-grow relative bg-white">
        <Rose className="absolute -bottom-2 -right-2 w-16 h-16 text-imperial-gold/[0.03] pointer-events-none group-hover:text-imperial-gold/[0.08] transition-colors duration-500" />
        
        <h3 className="farsi text-base font-bold text-midnight-cobalt group-hover:text-imperial-gold transition-colors duration-500 leading-tight mb-2">
          {victim.name}
        </h3>
        
        <div className="flex items-center gap-2 text-[9px] text-midnight-cobalt/30 font-bold uppercase tracking-widest farsi">
          {victim.date ? format(new Date(victim.date), "yyyy") : t.unknown}
        </div>
      </div>
    </motion.div>
  );
};
