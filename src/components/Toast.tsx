import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "error":
        return <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />;
      case "info":
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-[#091E1A]/95 border-emerald-500/25 text-emerald-100 shadow-emerald-500/5";
      case "error":
        return "bg-[#1C0F12]/95 border-red-500/25 text-red-100 shadow-red-500/5";
      case "warning":
        return "bg-[#1A160D]/95 border-yellow-500/25 text-yellow-100 shadow-yellow-500/5";
      case "info":
        return "bg-[#0D1821]/95 border-cyan-500/25 text-cyan-100 shadow-cyan-500/5";
    }
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div 
        id="toast-portal"
        className="fixed z-50 flex flex-col gap-3 w-full max-w-sm px-4 md:px-0 pointer-events-none top-4 right-4 md:top-6 md:right-6 bottom-auto left-0 md:left-auto"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
              layout
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl relative overflow-hidden ${getBgColor(
                item.type
              )}`}
            >
              {getIcon(item.type)}
              
              <div className="flex-grow pr-4">
                <p className="text-xs font-sans leading-relaxed font-medium">
                  {item.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-white transition-colors duration-150 p-0.5 rounded-md hover:bg-white/5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated progress bar indicator */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (item.duration || 4000) / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  item.type === "success"
                    ? "bg-emerald-500/60"
                    : item.type === "error"
                    ? "bg-red-500/60"
                    : item.type === "warning"
                    ? "bg-yellow-500/60"
                    : "bg-cyan-500/60"
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
