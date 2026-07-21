import React, { useState } from "react";
import { 
  db, 
  auth, 
  isFirebaseAvailable 
} from "../firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { 
  PlusCircle, 
  Users, 
  Key, 
  LogOut, 
  Home, 
  AlertCircle, 
  Check, 
  User, 
  ArrowRight,
  Clipboard
} from "lucide-react";

interface HouseSetupViewProps {
  userId: string;
  userDisplayName: string | null;
  onSetupComplete: (houseId: string, role: "user_a" | "user_b") => void;
}

export default function HouseSetupView({ userId, userDisplayName, onSetupComplete }: HouseSetupViewProps) {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [houseName, setHouseName] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [houseIdToJoin, setHouseIdToJoin] = useState("");
  const [role, setRole] = useState<"user_a" | "user_b">("user_a");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHouseId, setSuccessHouseId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseName.trim()) {
      setError("Please enter a household name.");
      return;
    }
    if (!joinPassword.trim()) {
      setError("Please set a secure joining password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const newHouseId = "house_" + Math.random().toString(36).substring(2, 9);
      
      const pA = {
        id: "user_a",
        name: role === "user_a" ? (userDisplayName || "Alex") : "Alex",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        color: "#6366f1"
      };

      const pB = {
        id: "user_b",
        name: role === "user_b" ? (userDisplayName || "Taylor") : "Taylor",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        color: "#f59e0b"
      };

      const housePayload = {
        id: newHouseId,
        name: houseName,
        joinPassword: joinPassword,
        createdAt: new Date().toISOString(),
        creatorUid: userId,
        partnerA_uid: role === "user_a" ? userId : null,
        partnerB_uid: role === "user_b" ? userId : null,
        partnerA: pA,
        partnerB: pB
      };

      // 1. Create the house doc in firestore
      await setDoc(doc(db, "houses", newHouseId), housePayload);

      // 2. Update user profile doc in firestore
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        displayName: userDisplayName,
        houseId: newHouseId,
        roleInHouse: role
      }, { merge: true });

      setSuccessHouseId(newHouseId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create household.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseIdToJoin.trim()) {
      setError("Please enter the House ID.");
      return;
    }
    if (!joinPassword.trim()) {
      setError("Please enter the joining password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const houseDocRef = doc(db, "houses", houseIdToJoin.trim());
      const houseDocSnap = await getDoc(houseDocRef);

      if (!houseDocSnap.exists()) {
        setError("Household not found. Please double check the ID.");
        setLoading(false);
        return;
      }

      const houseData = houseDocSnap.data();

      // Check Password
      if (houseData.joinPassword !== joinPassword.trim()) {
        setError("Incorrect password or keyword for this household.");
        setLoading(false);
        return;
      }

      // Check Role Availability
      const partnerUidField = role === "user_a" ? "partnerA_uid" : "partnerB_uid";
      if (houseData[partnerUidField]) {
        setError(`That role (${role === "user_a" ? "Partner A" : "Partner B"}) is already taken in this house.`);
        setLoading(false);
        return;
      }

      // Update House Doc
      const updates: any = {
        [partnerUidField]: userId
      };

      // Update internal partner profile names to match joining user's display name
      if (role === "user_a" && userDisplayName) {
        updates.partnerA = {
          ...houseData.partnerA,
          name: userDisplayName
        };
      } else if (role === "user_b" && userDisplayName) {
        updates.partnerB = {
          ...houseData.partnerB,
          name: userDisplayName
        };
      }

      await updateDoc(houseDocRef, updates);

      // Update User Profile Doc
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        displayName: userDisplayName,
        houseId: houseIdToJoin.trim(),
        roleInHouse: role
      }, { merge: true });

      onSetupComplete(houseIdToJoin.trim(), role);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to join household.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (successHouseId) {
      navigator.clipboard.writeText(successHouseId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (successHouseId) {
    return (
      <div id="setup-success-container" className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c0f16] px-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-[#131924] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-4">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Household Created!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Give this unique ID and password to your partner so they can securely join:
          </p>

          <div className="mt-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-left relative group">
            <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">House ID</div>
            <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 break-all select-all">
              {successHouseId}
            </div>
            <button
              onClick={copyToClipboard}
              className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              title="Copy House ID"
            >
              {copied ? <span className="text-[10px] text-emerald-500 font-medium">Copied!</span> : <Clipboard className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-left">
            <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Password / Key</div>
            <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
              {joinPassword}
            </div>
          </div>

          <button
            onClick={() => onSetupComplete(successHouseId, role)}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="setup-container" className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c0f16] px-4 transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-[#131924] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-sm">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-500" />
              Household Setup
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {userDisplayName ? `Hello, ${userDisplayName}. ` : ""}Create or connect to a secure house.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl mb-6">
          <button
            onClick={() => { setTab("create"); setError(null); }}
            className={`inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === "create"
                ? "bg-white dark:bg-[#1a2130] text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Create House
          </button>
          <button
            onClick={() => { setTab("join"); setError(null); }}
            className={`inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === "join"
                ? "bg-white dark:bg-[#1a2130] text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Join Existing
          </button>
        </div>

        {/* Form */}
        {tab === "create" ? (
          <form onSubmit={handleCreateHouse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Household / Couple Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex & Taylor's Nest"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Secure Joining Password / Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Set password for your partner"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user_a")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "user_a"
                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-900 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/20"
                  }`}
                >
                  <div className="font-bold text-sm">Partner A</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Primary Ledger Admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("user_b")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "user_b"
                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-900 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/20"
                  }`}
                >
                  <div className="font-bold text-sm">Partner B</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Secondary Ledger Admin</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Creating..." : "Create Household"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinHouse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Household ID
              </label>
              <input
                type="text"
                placeholder="e.g. house_abcd123"
                value={houseIdToJoin}
                onChange={(e) => setHouseIdToJoin(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Secured Joining Password / Keyword
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter secure password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Join As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user_a")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "user_a"
                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-900 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/20"
                  }`}
                >
                  <div className="font-bold text-sm">Partner A</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Primary Ledger Admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("user_b")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "user_b"
                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-900 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/20"
                  }`}
                >
                  <div className="font-bold text-sm">Partner B</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Secondary Ledger Admin</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Connecting..." : "Join Household"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
