import React from "react";
import { motion } from "motion/react";

export const SunAndLion: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sun Rays */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(16)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="100"
            x2="100"
            y2="40"
            stroke="currentColor"
            strokeWidth="2"
            transform={`rotate(${i * 22.5} 100 100)`}
            opacity="0.3"
          />
        ))}
      </motion.g>
      
      {/* Sun Circle */}
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      
      {/* Lion Silhouette (Simplified Artistic Representation) */}
      <path
        d="M70 130 C 70 110, 90 100, 110 100 S 130 110, 130 130 L 130 150 L 70 150 Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M130 130 L 160 110"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.4"
      />
    </svg>
  );
};

export const Rose: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rose Petals (Artistic Geometric) */}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        d="M50 50 Q 70 20, 50 10 Q 30 20, 50 50"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        d="M50 50 Q 80 40, 90 60 Q 70 80, 50 50"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
        d="M50 50 Q 30 80, 10 60 Q 20 40, 50 50"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Stem */}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 1.5 }}
        d="M50 50 L 50 90"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </svg>
  );
};
