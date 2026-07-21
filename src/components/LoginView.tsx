import React, { useState } from "react";
import { 
  auth, 
  db,
  isFirebaseAvailable 
} from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { ShieldCheck, User, Lock, Sparkles, AlertCircle, ArrowRight, Chrome } from "lucide-react";

interface LoginViewProps {
  onLocalDemo: () => void;
}

export default function LoginView({ onLocalDemo }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseAvailable || !auth) {
      setError("Firebase Auth is currently unavailable. Using Local Demo Mode instead.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Google Sign-In is not enabled in your Firebase project. To fix this: \n1. Open your Firebase Console\n2. Go to Build > Authentication > Sign-in method\n3. Click 'Add new provider' and enable 'Google'.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseAvailable || !auth) {
      setError("Firebase Auth is currently unavailable.");
      return;
    }
    
    const cleanUsername = username.trim();
    const cleanAccountName = accountName.trim();
    if (!cleanUsername || !password || (isRegistering && !cleanAccountName)) {
      setError("Please fill in all fields.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setError("Username can only contain letters, numbers, underscores (_), and hyphens (-). Spaces or special symbols are not allowed.");
      return;
    }

    setLoading(true);
    setError(null);

    const formattedEmail = `${cleanUsername.toLowerCase()}@tally.local`;

    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, formattedEmail, password);
        await updateProfile(userCred.user, { displayName: cleanAccountName });
        
        // Save user profile to Firestore immediately
        if (db) {
          try {
            await setDoc(doc(db, "users", userCred.user.uid), {
              uid: userCred.user.uid,
              displayName: cleanAccountName,
              houseId: null,
              roleInHouse: null
            }, { merge: true });
          } catch (dbErr) {
            console.error("Failed to pre-save user profile to firestore:", dbErr);
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, formattedEmail, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message;
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        msg = "No account found with this username, or incorrect password.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Incorrect password.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Invalid username format. Please use only letters, numbers, underscores, and hyphens.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Email/Password Authentication is not enabled in your Firebase project. To fix this: \n1. Open your Firebase Console\n2. Go to Build > Authentication > Sign-in method\n3. Enable 'Email/Password' under native providers.";
      }
      setError(msg || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c0f16] px-4 transition-colors duration-300">
      <div id="login-card" className="w-full max-w-md bg-white dark:bg-[#131924] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-sm">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to Tally
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Secure household budget & split ledger
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs flex flex-col gap-2.5">
            <div className="flex items-start gap-2 whitespace-pre-line">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            
            {(error.includes("not enabled") || error.includes("operation-not-allowed") || error.includes("Operation not allowed")) && (
              <div className="pt-2.5 border-t border-rose-200/50 dark:border-rose-900/40 flex flex-col gap-2">
                <span className="font-semibold text-rose-700 dark:text-rose-300">💡 Quick Workaround:</span>
                <p className="text-rose-600/95 dark:text-rose-400/90 leading-relaxed">
                  You can bypass Firebase configuration entirely right now and launch the fully-featured offline local sandbox with one click:
                </p>
                <button
                  type="button"
                  onClick={onLocalDemo}
                  className="mt-1 self-start inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium rounded-lg text-[11px] transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Launch Offline Local Demo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Account Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Taylor Smith"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <Sparkles className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., taylor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegistering ? "Sign Up" : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <hr className="border-slate-200 dark:border-slate-800" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#131924] px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Or continue with
          </span>
        </div>

        {/* Providers */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            <Chrome className="w-4 h-4" />
            Google Account
          </button>

          <button
            onClick={onLocalDemo}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
          >
            Offline Local Demo Mode
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            disabled={loading}
            className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium"
          >
            {isRegistering ? "Already have an account? Sign In" : "New to Tally? Create an account"}
          </button>
        </div>

      </div>
    </div>
  );
}
