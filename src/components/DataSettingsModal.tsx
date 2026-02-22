import React, { useState } from "react";
import { X, Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DataSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  source: {
    government: string;
    telegram: string;
  };
  lang?: "en" | "fa";
}

export const DataSettingsModal: React.FC<DataSettingsModalProps> = ({ isOpen, onClose, onUploadSuccess, source, lang = "fa" }) => {
  const [uploading, setUploading] = useState<string | null>(null);

  const t = {
    en: {
      title: "Data Verification Sources",
      subtitle: "Management of authoritative documentation",
      citizen: "Citizen-Documented Reports",
      citizenSub: "Primary source of civilian documentation",
      official: "Official State Recognition",
      officialSub: "Government acknowledged dataset",
      upload: "Upload New Evidence",
      refresh: "Refresh Forensic Cache",
      close: "Close",
      csv: "CSV Format Required",
      json: "JSON Format Required",
      overwrite: "* Uploading a new file will overwrite the existing one. The application will refresh automatically to process the new data."
    },
    fa: {
      title: "منابع تایید داده‌ها",
      subtitle: "مدیریت مستندات معتبر",
      citizen: "گزارش‌های مستندسازی شده توسط شهروندان",
      citizenSub: "منبع اصلی مستندات غیرنظامی",
      official: "لیست رسمی تایید شده توسط دولت",
      officialSub: "مجموعه داده‌های تایید شده دولتی",
      upload: "بارگذاری شواهد جدید",
      refresh: "بازنشانی حافظه فورنزیک",
      close: "بستن",
      csv: "فرمت CSV الزامی است",
      json: "فرمت JSON الزامی است",
      overwrite: "* بارگذاری فایل جدید جایگزین فایل قبلی خواهد شد. برنامه برای پردازش داده‌های جدید به طور خودکار بازنشانی می‌شود."
    }
  }[lang];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'json') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type === 'csv' ? 'government' : 'telegram');

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onUploadSuccess();
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload");
    } finally {
      setUploading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${lang === 'fa' ? 'rtl' : 'ltr'}`}>
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
            className="relative w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl border border-gray-100"
          >
            <button 
              onClick={onClose}
              className={`absolute top-6 ${lang === 'fa' ? 'left-6' : 'right-6'} p-2 hover:bg-gray-50 rounded-full transition-colors`}
            >
              <X size={20} className="text-midnight-cobalt/40" />
            </button>

            <h2 className="text-2xl font-bold text-midnight-cobalt mb-2 farsi">{t.title}</h2>
            <p className="text-midnight-cobalt/40 text-sm mb-8 farsi">
              {t.subtitle}
            </p>

            <div className="space-y-6">
              {/* Citizen Data */}
              <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-midnight-cobalt/5 rounded-lg">
                      <FileJson size={20} className="text-imperial-gold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-midnight-cobalt farsi">{t.citizen}</h4>
                      <p className="text-[10px] text-midnight-cobalt/40 uppercase tracking-widest farsi">{t.json}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {source.telegram.includes("Real") || source.telegram.includes("گزارش") ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={16} className="text-amber-500" />
                    )}
                    <span className="text-[10px] font-bold text-midnight-cobalt/60 farsi">{source.telegram}</span>
                  </div>
                </div>
                <label className="block w-full">
                  <span className="sr-only">Choose JSON file</span>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, 'json')}
                      className="block w-full text-xs text-midnight-cobalt/40 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-midnight-cobalt/5 file:text-midnight-cobalt hover:file:bg-midnight-cobalt/10 cursor-pointer farsi"
                    />
                    {uploading === 'json' && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <div className="w-4 h-4 border-2 border-imperial-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Official Data */}
              <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-midnight-cobalt/5 rounded-lg">
                      <FileSpreadsheet size={20} className="text-imperial-gold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-midnight-cobalt farsi">{t.official}</h4>
                      <p className="text-[10px] text-midnight-cobalt/40 uppercase tracking-widest farsi">{t.csv}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {source.government.includes("Real") || source.government.includes("لیست") ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={16} className="text-amber-500" />
                    )}
                    <span className="text-[10px] font-bold text-midnight-cobalt/60 farsi">{source.government}</span>
                  </div>
                </div>
                <label className="block w-full">
                  <span className="sr-only">Choose CSV file</span>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'csv')}
                      className="block w-full text-xs text-midnight-cobalt/40 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-midnight-cobalt/5 file:text-midnight-cobalt hover:file:bg-midnight-cobalt/10 cursor-pointer farsi"
                    />
                    {uploading === 'csv' && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <div className="w-4 h-4 border-2 border-imperial-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-[10px] text-midnight-cobalt/20 leading-relaxed italic farsi">
                {t.overwrite}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
