import React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SunAndLion } from "./Illustrations";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  delay?: number;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  delay = 0,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden",
        className
      )}
    >
      {/* Subtle Watermark */}
      <SunAndLion className="absolute -bottom-4 -right-4 w-24 h-24 text-midnight-cobalt/[0.02] pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2 bg-midnight-cobalt/5 rounded-lg">
          <Icon size={18} className="text-imperial-gold" />
        </div>
        <div className="h-1 w-1 rounded-full bg-imperial-gold" />
      </div>
      
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-cobalt/40 mb-1">
          {title}
        </h3>
        <div className="text-2xl font-bold tracking-tight text-midnight-cobalt">
          {value}
        </div>
        {subtitle && (
          <p className="text-[10px] mt-2 text-midnight-cobalt/30 font-medium uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};
