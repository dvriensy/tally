/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBudgetStore } from "./useBudgetStore";
import { BiometricOverlay } from "./components/BiometricOverlay";
import { DashboardView } from "./components/DashboardView";
import { ExpensesView } from "./components/ExpensesView";
import { CalendarView } from "./components/CalendarView";
import { GoalsView } from "./components/GoalsView";
import { SettingsView } from "./components/SettingsView";
import LoginView from "./components/LoginView";
import HouseSetupView from "./components/HouseSetupView";
import { HouseholdView } from "./components/HouseholdView";
import { AnimatedLogo } from "./components/AnimatedLogo";
import { auth, db, isFirebaseAvailable } from "./firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon, 
  PiggyBank, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  RefreshCw,
  Fingerprint,
  LogOut,
  Home,
  Menu,
  X
} from "lucide-react";

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | "local_demo" | null>(null);
  const [houseId, setHouseId] = useState<string | null>(null);
  const [role, setRole] = useState<"user_a" | "user_b">("user_a");
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseAvailable || !auth) {
      // Fallback automatically to Local Demo if Firebase fails to initialize
      setFirebaseUser("local_demo");
      setHouseId("demo_house");
      setRole("user_a");
      setUserDisplayName("Alex");
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setUserDisplayName(user.displayName);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.displayName) {
              setUserDisplayName(data.displayName);
            }
            if (data.houseId && data.roleInHouse) {
              setHouseId(data.houseId);
              setRole(data.roleInHouse);
            } else {
              setHouseId(null);
            }
          } else {
            setHouseId(null);
          }
        } catch (err) {
          console.error("Error reading user profile:", err);
          setHouseId(null);
        }
      } else {
        setFirebaseUser(null);
        setHouseId(null);
        setUserDisplayName(null);
      }
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLocalDemo = () => {
    setFirebaseUser("local_demo");
    setHouseId("demo_house");
    setRole("user_a");
  };

  const handleSignOut = async () => {
    if (firebaseUser === "local_demo") {
      setFirebaseUser(null);
      setHouseId(null);
    } else if (auth) {
      await signOut(auth);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c0f16]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-semibold">
            Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <LoginView onLocalDemo={handleLocalDemo} />;
  }

  if (firebaseUser !== "local_demo" && !houseId) {
    return (
      <HouseSetupView
        userId={firebaseUser.uid}
        userDisplayName={userDisplayName}
        onSetupComplete={(hId, r) => {
          setHouseId(hId);
          setRole(r);
        }}
      />
    );
  }

  return (
    <AppWithStore 
      houseId={houseId} 
      role={role} 
      onSignOut={handleSignOut} 
      isDemo={firebaseUser === "local_demo"} 
    />
  );
}

interface AppWithStoreProps {
  houseId: string | null;
  role: "user_a" | "user_b";
  onSignOut: () => void;
  isDemo: boolean;
}

function AppWithStore({ houseId, role, onSignOut, isDemo }: AppWithStoreProps) {
  const store = useBudgetStore(houseId, role);
  const [activeTab, setActiveTab] = useState<"dashboard" | "expenses" | "calendar" | "goals" | "household" | "settings">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const summary = store.getSplitsSummary();

  // Navigation Tabs Configuration
  const tabs = [
    { id: "dashboard", name: "Dashboard Overview", icon: LayoutDashboard },
    { id: "expenses", name: "Expenses Ledger", icon: DollarSign },
    { id: "household", name: "Household Hub", icon: Home },
    { id: "calendar", name: "Bills Calendar", icon: CalendarIcon },
    { id: "goals", name: "Savings Milestones", icon: PiggyBank },
    { id: "settings", name: "Control Center", icon: SettingsIcon }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-sophisticated-bg text-gray-900 dark:text-sophisticated-text transition-colors duration-200 flex flex-col justify-between">
      
      {/* Biometric simulation lock overlay */}
      <BiometricOverlay
        isLocked={store.isBiometricLocked}
        partnerName={store.currentUser === "user_a" ? store.partnerA.name : store.partnerB.name}
        onUnlock={() => store.setIsBiometricLocked(false)}
      />

      <div className="flex-1">
        {/* Persistent Nav Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-sophisticated-bg/90 backdrop-blur-md border-b border-gray-300 dark:border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            
            {/* Logo Title - Beautifully Animated & Fun Logo and name lettering */}
            <div className="flex flex-col items-center md:items-start gap-1">
              <AnimatedLogo />
              
              {/* Cloud Synchronization status indicator */}
              <div className="flex items-center gap-1.5 md:pl-2 mt-[-2px] md:mt-[-4px]">
                {store.syncStatus === "synced" ? (
                  <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-accent-emerald font-mono uppercase tracking-wider font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync Active
                  </span>
                ) : store.syncStatus === "syncing" ? (
                  <span className="flex items-center gap-1 text-[9px] text-amber-600 dark:text-accent-amber font-mono uppercase tracking-wider font-semibold">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Syncing...
                  </span>
                ) : store.syncStatus === "offline" ? (
                  <span className="flex items-center gap-1 text-[9px] text-neutral-500 dark:text-neutral-400 font-mono uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    Offline Mode
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] text-rose-500 dark:text-accent-rose font-mono uppercase tracking-wider font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Sync Alert
                  </span>
                )}
              </div>
            </div>

            {/* Right Header Panel Control Area */}
            <div className="flex items-center flex-wrap gap-3">
              
              {isDemo && (
                <div className="bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Demo Sandbox
                </div>
              )}

              {/* Active Role/Simulation switcher */}
              {!isDemo ? (
                <div className="flex items-center gap-2 bg-gray-200 dark:bg-sophisticated-card py-1.5 px-3.5 rounded-full border border-gray-300 dark:border-subtle">
                  <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-500 uppercase tracking-widest font-semibold">Logged In:</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-950 dark:text-white">
                    <img
                      src={store.currentUser === "user_a" ? store.partnerA.avatar : store.partnerB.avatar}
                      alt="Avatar"
                      className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                      referrerPolicy="no-referrer"
                    />
                    <span>{store.currentUser === "user_a" ? store.partnerA.name : store.partnerB.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-300/50 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 font-mono uppercase">
                      {store.currentUser === "user_a" ? "Partner A" : "Partner B"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-gray-200 dark:bg-sophisticated-card p-1 rounded-full border border-gray-300 dark:border-subtle">
                  <span className="text-[9px] font-mono text-gray-600 dark:text-neutral-500 uppercase tracking-widest pl-2.5 pr-0.5">
                    Simulate:
                  </span>
                  <button
                    onClick={() => store.switchUser("user_a")}
                    className={`flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold transition-all ${
                      store.currentUser === "user_a"
                        ? "bg-white dark:bg-neutral-800 shadow-xs text-gray-900 dark:text-white border border-gray-300 dark:border-subtle"
                        : "text-gray-600 dark:text-slate-400 opacity-60 hover:opacity-100"
                    } cursor-pointer`}
                  >
                    <img src={store.partnerA.avatar} alt="A" className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                    {store.partnerA.name}
                  </button>
                  <button
                    onClick={() => store.switchUser("user_b")}
                    className={`flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold transition-all ${
                      store.currentUser === "user_b"
                        ? "bg-white dark:bg-neutral-800 shadow-xs text-gray-900 dark:text-white border border-gray-300 dark:border-subtle"
                        : "text-gray-600 dark:text-slate-400 opacity-60 hover:opacity-100"
                    } cursor-pointer`}
                  >
                    <img src={store.partnerB.avatar} alt="B" className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                    {store.partnerB.name}
                  </button>
                </div>
              )}

              {/* Quick Simulate Device Biometric lock action */}
              {store.isBiometricEnabled && (
                <button
                  onClick={() => store.setIsBiometricLocked(true)}
                  className="p-2 rounded-full text-gray-700 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-900 border border-gray-300 dark:border-subtle cursor-pointer transition-colors"
                  title="Lock Application with Biometrics"
                >
                  <Fingerprint className="w-4 h-4" />
                </button>
              )}

              {/* Intuitive Dark mode Toggle switch */}
              <button
                onClick={() => store.setIsDarkMode(!store.isDarkMode)}
                className="p-2 rounded-full text-gray-700 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-900 border border-gray-300 dark:border-subtle cursor-pointer transition-colors"
                title="Toggle Dark Mode Theme"
              >
                {store.isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>

              {/* Sign Out Action */}
              <button
                onClick={onSignOut}
                className="p-2 rounded-full text-gray-700 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-300 dark:border-subtle cursor-pointer transition-colors"
                title={isDemo ? "Exit Demo Sandbox" : "Sign Out"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Main Content Area Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Mobile Navigation Dropdown/Trigger */}
          <div className="md:hidden relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-xl px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white shadow-xs"
            >
              <div className="flex items-center gap-2">
                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || LayoutDashboard, { className: "w-5 h-5 text-emerald-600 dark:text-accent-emerald" })}
                <span>{tabs.find(t => t.id === activeTab)?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Menu</span>
                {mobileMenuOpen ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
              </div>
            </button>

            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  {/* Backdrop to close the menu */}
                  <div className="fixed inset-0 z-10" onClick={() => setMobileMenuOpen(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-2 z-20 bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-xl shadow-xl divide-y divide-gray-100 dark:divide-neutral-800 overflow-hidden"
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-accent-emerald"
                              : "text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <Icon className="w-4.5 h-4.5 shrink-0" />
                          <span>{tab.name}</span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Sub Navigation Bar Tabs */}
          <div className="hidden md:flex border-b border-gray-300 dark:border-subtle overflow-x-auto space-x-6 pb-px scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3.5 px-1 border-b-2 font-medium text-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-600 text-emerald-700 dark:border-accent-emerald dark:text-accent-emerald"
                      : "border-transparent text-gray-600 hover:text-gray-950 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Views Rendering */}
          <div className="pt-2">
            {activeTab === "dashboard" && (
              <DashboardView
                expenses={store.expenses}
                categories={store.categories}
                logs={store.activityLogs}
                partnerA={store.partnerA}
                partnerB={store.partnerB}
                currentUser={store.currentUser}
                summary={summary}
                onSettleUp={store.settleUp}
                onNavigateToExpenses={() => setActiveTab("expenses")}
              />
            )}

            {activeTab === "expenses" && (
              <ExpensesView
                expenses={store.expenses}
                categories={store.categories}
                partnerA={store.partnerA}
                partnerB={store.partnerB}
                currentUser={store.currentUser}
                onAddExpense={store.addExpense}
                onUpdateExpense={store.updateExpense}
                onDeleteExpense={store.deleteExpense}
                scanReceiptOCR={store.scanReceiptOCR}
              />
            )}

            {activeTab === "household" && (
              <HouseholdView
                houseId={houseId}
                houseName={store.houseName}
                joinPassword={store.joinPassword}
                partnerA={store.partnerA}
                partnerB={store.partnerB}
                currentUserRole={role}
                isDemo={isDemo}
                partnerA_uid={store.partnerA_uid}
                partnerB_uid={store.partnerB_uid}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarView
                reminders={store.reminders}
                categories={store.categories}
                partnerA={store.partnerA}
                partnerB={store.partnerB}
                onAddReminder={store.addReminder}
                onToggleReminderPaid={store.toggleReminderPaid}
                onDeleteReminder={store.deleteReminder}
              />
            )}

            {activeTab === "goals" && (
              <GoalsView
                goals={store.goals}
                onAddGoal={store.addGoal}
                onUpdateGoalProgress={store.updateGoalProgress}
                onDeleteGoal={store.deleteGoal}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                partnerA={store.partnerA}
                partnerB={store.partnerB}
                categories={store.categories}
                expenses={store.expenses}
                isBiometricEnabled={store.isBiometricEnabled}
                onToggleBiometric={store.setIsBiometricEnabled}
                onUpdatePartners={store.updatePartners}
                onAddCategory={store.addCategory}
                onUpdateCategory={store.updateCategory}
              />
            )}
          </div>

        </main>
      </div>

      {/* Elegant design footer from Sophisticated Dark design specs */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 pb-8 pt-6 border-t border-gray-300 dark:border-subtle flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-gray-600 dark:text-neutral-500">
        <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2">
          <span>Encrypted Database v2.5</span>
          <span>
            Cloud Sync: {store.syncStatus === "synced" ? "Active" : store.syncStatus === "offline" ? "Local Only" : "Connecting..."}
          </span>
          <span>Offline Mode Ready</span>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
          <span className="text-amber-700 dark:text-accent-amber font-semibold">
            {store.reminders.filter(r => !r.isPaid).length} Pending Reminders
          </span>
          <button 
            onClick={() => setActiveTab("settings")}
            className="hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors cursor-pointer uppercase tracking-[0.2em]"
          >
            Settings Center
          </button>
        </div>
      </footer>
    </div>
  );
}
