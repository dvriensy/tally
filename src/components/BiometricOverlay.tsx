import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Fingerprint, Lock, ShieldCheck } from "lucide-react";

interface BiometricOverlayProps {
  isLocked: boolean;
  onUnlock: () => void;
  partnerName: string;
}

export function BiometricOverlay({ isLocked, onUnlock, partnerName }: BiometricOverlayProps) {
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle");

  const triggerScan = () => {
    setStatus("scanning");
    setTimeout(() => {
      // Simulate successful biometric check 85% of the time
      if (Math.random() > 0.15) {
        setStatus("success");
        setTimeout(() => {
          onUnlock();
          setStatus("idle");
        }, 1000);
      } else {
        setStatus("failed");
        setTimeout(() => {
          setStatus("idle");
        }, 1500);
      }
    }, 1500);
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-lg">
      <div className="max-w-md w-full px-6 text-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-neutral-900/40 dark:bg-sophisticated-card border border-gray-200 dark:border-subtle rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative background ambient circles */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500">
              <Lock className="w-6 h-6" />
            </div>
          </div>

          <h2 className="serif text-2xl italic text-gray-900 dark:text-white mb-2 font-medium">
            Portal Secured
          </h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-8 leading-relaxed max-w-sm mx-auto">
            Biometric verification is active. Authenticating as <span className="text-emerald-500 font-medium font-mono">{partnerName}</span> to unlock financial ledgers.
          </p>

          <div className="flex flex-col items-center justify-center mb-8">
            <motion.button
              onClick={status === "idle" || status === "failed" ? triggerScan : undefined}
              whileHover={{ scale: status === "idle" ? 1.05 : 1 }}
              whileTap={{ scale: status === "idle" ? 0.95 : 1 }}
              className={`relative flex items-center justify-center w-24 h-24 rounded-full border transition-all duration-300 ${
                status === "scanning" 
                  ? "bg-emerald-950/20 border-emerald-500 shadow-emerald-500/10 shadow-lg cursor-wait text-emerald-500" 
                  : status === "success"
                  ? "bg-emerald-950 border-emerald-500 shadow-emerald-500/20 shadow-lg text-emerald-400"
                  : status === "failed"
                  ? "bg-rose-950/50 border-rose-500 animate-shake text-rose-400"
                  : "bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-subtle hover:border-emerald-500 hover:bg-gray-200/50 dark:hover:bg-neutral-800 cursor-pointer text-emerald-500"
              }`}
            >
              {status === "scanning" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-emerald-500 border-r-2 border-transparent"
                />
              )}

              {status === "success" ? (
                <ShieldCheck className="w-10 h-10" />
              ) : status === "failed" ? (
                <ShieldAlert className="w-10 h-10" />
              ) : (
                <Fingerprint className="w-12 h-12" />
              )}
            </motion.button>

            <span className="text-[10px] font-mono tracking-wider text-gray-400 dark:text-neutral-500 uppercase mt-4">
              {status === "scanning" 
                ? "Scanning identity..." 
                : status === "success"
                ? "Access granted"
                : status === "failed"
                ? "Identity mismatch. Retry."
                : "Touch sensor to authorize"}
            </span>
          </div>

          <button
            onClick={onUnlock}
            className="w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400 transition-colors cursor-pointer border border-gray-200 dark:border-subtle"
          >
            Bypass with Device Pin
          </button>
        </motion.div>
      </div>
    </div>
  );
}
