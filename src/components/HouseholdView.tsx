import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Home, 
  Share2, 
  Copy, 
  Check, 
  Key, 
  UserPlus, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Info
} from "lucide-react";
import { Person } from "../types";

interface HouseholdViewProps {
  houseId: string | null;
  houseName: string;
  joinPassword?: string;
  partnerA: Person;
  partnerB: Person;
  currentUserRole: "user_a" | "user_b";
  isDemo: boolean;
  partnerA_uid?: string | null;
  partnerB_uid?: string | null;
}

export function HouseholdView({
  houseId,
  houseName,
  joinPassword = "Not Set",
  partnerA,
  partnerB,
  currentUserRole,
  isDemo,
  partnerA_uid,
  partnerB_uid
}: HouseholdViewProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const displayHouseId = houseId || "demo_house_code";
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(displayHouseId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(joinPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const inviteMessage = `Hey! Join our shared household budget ledger on Tally. \n\n🏠 House Name: ${houseName}\n🆔 House ID: ${displayHouseId}\n🔑 Join Password: ${joinPassword}\n\nDownload Tally or open the website to connect instantly!`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  // Determine connected states
  const isAConnected = isDemo || !!partnerA_uid || currentUserRole === "user_a";
  const isBConnected = isDemo || !!partnerB_uid || currentUserRole === "user_b";

  return (
    <div className="space-y-6">
      
      {/* Overview Block */}
      <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600 dark:text-accent-emerald font-bold">
              Active Household Profile
            </span>
            <h2 className="serif text-2xl italic tracking-tight text-gray-900 dark:text-white mt-1">
              {houseName || "Alex & Taylor's Nest"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              {isDemo ? "Running in Offline Demo Sandbox. Setup Firestore to experience live cross-device sync." : "Fully connected to the Firestore Realtime Sync database."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-accent-emerald">
              {isDemo ? "Demo Active" : "Production Database Ready"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Credentials and Sharing */}
        <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="serif text-lg italic font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-500" />
              Invite Partner & Connection Codes
            </h3>
            <p className="text-xs text-gray-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Share these credentials with your partner or roommate. They can input these codes on their own device under "Join Existing" to sync your expenses instantly in real time.
            </p>

            <div className="space-y-4">
              {/* House ID Card */}
              <div className="p-4 bg-gray-50 dark:bg-neutral-900/30 border border-gray-300 dark:border-subtle rounded-xl relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-500 uppercase tracking-widest font-bold">Household Code / ID</span>
                    <div className="font-mono text-sm font-bold text-gray-950 dark:text-white mt-1 select-all break-all pr-12">
                      {displayHouseId}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-subtle hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Copy House ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Card */}
              <div className="p-4 bg-gray-50 dark:bg-neutral-900/30 border border-gray-300 dark:border-subtle rounded-xl relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-500 uppercase tracking-widest font-bold">Join Password / Keyword</span>
                    <div className="font-mono text-sm font-bold text-gray-950 dark:text-white mt-1 flex items-center gap-2">
                      {showPassword ? (
                        <span>{joinPassword}</span>
                      ) : (
                        <span>••••••••</span>
                      )}
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyPassword}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-subtle hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-subtle">
            <button
              onClick={handleCopyInvite}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  Invitation Message Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Copy Ready-to-Send Invitation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Members Status Panel */}
        <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
          <h3 className="serif text-lg italic font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-500" />
            Household Members Status
          </h3>
          <p className="text-xs text-gray-600 dark:text-neutral-400 mb-6 leading-relaxed">
            Every house supports up to two active ledger admins. View who has connected to your house ledger.
          </p>

          <div className="space-y-4">
            {/* Partner A Card */}
            <div className="p-4 border border-gray-300 dark:border-subtle rounded-xl flex items-center justify-between bg-gray-50/50 dark:bg-[#151a25]">
              <div className="flex items-center gap-3">
                <img
                  src={partnerA.avatar}
                  alt={partnerA.name}
                  className="w-11 h-11 rounded-full object-cover border-2"
                  style={{ borderColor: partnerA.color }}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-bold text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                    {partnerA.name}
                    {currentUserRole === "user_a" && (
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider">You</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-neutral-500 font-mono uppercase tracking-wider mt-0.5">Partner A (Primary Admin)</div>
                </div>
              </div>

              <div>
                {isAConnected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-accent-emerald font-semibold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-accent-amber font-semibold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Vacant Slot
                  </span>
                )}
              </div>
            </div>

            {/* Partner B Card */}
            <div className="p-4 border border-gray-300 dark:border-subtle rounded-xl flex items-center justify-between bg-gray-50/50 dark:bg-[#151a25]">
              <div className="flex items-center gap-3">
                <img
                  src={partnerB.avatar}
                  alt={partnerB.name}
                  className="w-11 h-11 rounded-full object-cover border-2"
                  style={{ borderColor: partnerB.color }}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-bold text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                    {partnerB.name}
                    {currentUserRole === "user_b" && (
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider">You</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-neutral-500 font-mono uppercase tracking-wider mt-0.5">Partner B (Secondary Admin)</div>
                </div>
              </div>

              <div>
                {isBConnected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-accent-emerald font-semibold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-accent-amber font-semibold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Waiting...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/15 dark:border-indigo-900/30 rounded-xl flex gap-3 text-xs text-indigo-600 dark:text-indigo-400">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              When a new member registers and enters your House ID and password, their account name is automatically linked, and they will immediately appear in this member log.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
