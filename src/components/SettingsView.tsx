import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Tag, 
  Shield, 
  Download, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Fingerprint, 
  Info,
  DollarSign,
  Droplet,
  Home,
  ShoppingCart,
  Utensils,
  Sparkles,
  Car,
  ShoppingBag,
  HelpCircle
} from "lucide-react";
import { BudgetCategory, Person, Expense } from "../types";
import { AvatarSelector } from "./AvatarSelector";

interface SettingsViewProps {
  partnerA: Person;
  partnerB: Person;
  categories: BudgetCategory[];
  expenses: Expense[];
  isBiometricEnabled: boolean;
  onToggleBiometric: (val: boolean) => void;
  onUpdatePartners: (pA: Person, pB: Person) => Promise<void>;
  onAddCategory: (cat: Omit<BudgetCategory, "id">) => Promise<void>;
  onUpdateCategory: (cat: BudgetCategory) => Promise<void>;
}

export function SettingsView({
  partnerA,
  partnerB,
  categories,
  expenses,
  isBiometricEnabled,
  onToggleBiometric,
  onUpdatePartners,
  onAddCategory,
  onUpdateCategory
}: SettingsViewProps) {
  // Team Edit States
  const [nameA, setNameA] = useState(partnerA.name);
  const [nameB, setNameB] = useState(partnerB.name);
  const [colorA, setColorA] = useState(partnerA.color);
  const [colorB, setColorB] = useState(partnerB.color);
  const [avatarA, setAvatarA] = useState(partnerA.avatar);
  const [avatarB, setAvatarB] = useState(partnerB.avatar);
  const [showAvatarA, setShowAvatarA] = useState(false);
  const [showAvatarB, setShowAvatarB] = useState(false);
  const [isTeamSaved, setIsTeamSaved] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");
  const [newCatColor, setNewCatColor] = useState("#8b5cf6");
  const [newCatIcon, setNewCatIcon] = useState("HelpCircle");

  const availableIcons = ["Home", "Droplet", "ShoppingCart", "Utensils", "Sparkles", "Car", "ShoppingBag", "HelpCircle"];

  // Team Save action
  const handleSaveTeam = async () => {
    await onUpdatePartners(
      { ...partnerA, name: nameA, color: colorA, avatar: avatarA },
      { ...partnerB, name: nameB, color: colorB, avatar: avatarB }
    );
    setIsTeamSaved(true);
    setTimeout(() => setIsTeamSaved(false), 2000);
  };

  // Add category action
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newCatLimit) || 100;
    if (!newCatName) return;

    await onAddCategory({
      name: newCatName,
      limit: limitNum,
      color: newCatColor,
      icon: newCatIcon
    });

    setNewCatName("");
    setNewCatLimit("");
  };

  // CSV Report Export Trigger
  const handleExportCSV = () => {
    // Generate CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Title,Amount,Category,Date,Paid Upfront By,Split Type,Alex Share ($),Taylor Share ($)\r\n";

    // Format expenses
    expenses.forEach((exp) => {
      const payer = exp.paidById === "user_a" ? partnerA.name : partnerB.name;
      const row = [
        exp.id,
        `"${exp.title.replace(/"/g, '""')}"`, // escape quotes
        exp.amount,
        `"${exp.category}"`,
        exp.date,
        payer,
        exp.splitType,
        exp.splitDetails.user_a.toFixed(2),
        exp.splitDetails.user_b.toFixed(2)
      ].join(",");
      csvContent += row + "\r\n";
    });

    // Create Download Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    // Formatted filename based on date
    const dateStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    link.setAttribute("download", `budget_splitting_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customize Partners Card */}
        <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
          <h3 className="serif text-lg italic font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            Customize Roommates / Couples Profiles
          </h3>

          <div className="space-y-4">
            {/* Partner A */}
            <div className="p-3 bg-gray-50 dark:bg-neutral-900/30 border border-gray-300 dark:border-subtle rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <img src={avatarA} alt="A" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: colorA }} referrerPolicy="no-referrer" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-gray-700 dark:text-neutral-500 font-bold">Partner A Profile</span>
                  <button
                    type="button"
                    onClick={() => setShowAvatarA(!showAvatarA)}
                    className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-emerald-600 dark:text-accent-emerald hover:underline text-left"
                  >
                    {showAvatarA ? "Hide Avatar Options" : "Change Picture / Camera Shot"}
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {showAvatarA && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-gray-200/50 dark:border-subtle pt-2"
                  >
                    <AvatarSelector
                      currentAvatar={avatarA}
                      onSelectAvatar={(url) => setAvatarA(url)}
                      themeColor={colorA}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-700 dark:text-neutral-500 font-mono mb-1 font-bold">Display Name</label>
                  <input
                    type="text"
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-subtle rounded-md text-xs font-bold text-gray-950 dark:text-[#e0d8d0]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-700 dark:text-neutral-500 font-mono mb-1 font-bold">Theme Color</label>
                  <input
                    type="color"
                    value={colorA}
                    onChange={(e) => setColorA(e.target.value)}
                    className="w-full h-8 px-1 py-0.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-subtle rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Partner B */}
            <div className="p-3 bg-gray-50 dark:bg-neutral-900/30 border border-gray-300 dark:border-subtle rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <img src={avatarB} alt="B" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: colorB }} referrerPolicy="no-referrer" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-gray-700 dark:text-neutral-500 font-bold">Partner B Profile</span>
                  <button
                    type="button"
                    onClick={() => setShowAvatarB(!showAvatarB)}
                    className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-emerald-600 dark:text-accent-emerald hover:underline text-left"
                  >
                    {showAvatarB ? "Hide Avatar Options" : "Change Picture / Camera Shot"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAvatarB && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-gray-200/50 dark:border-subtle pt-2"
                  >
                    <AvatarSelector
                      currentAvatar={avatarB}
                      onSelectAvatar={(url) => setAvatarB(url)}
                      themeColor={colorB}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-700 dark:text-neutral-500 font-mono mb-1 font-bold">Display Name</label>
                  <input
                    type="text"
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-subtle rounded-md text-xs font-bold text-gray-950 dark:text-[#e0d8d0]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-700 dark:text-neutral-500 font-mono mb-1 font-bold">Theme Color</label>
                  <input
                    type="color"
                    value={colorB}
                    onChange={(e) => setColorB(e.target.value)}
                    className="w-full h-8 px-1 py-0.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-subtle rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveTeam}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] uppercase tracking-wider font-semibold flex justify-center items-center gap-1.5 transition-all cursor-pointer"
            >
              {isTeamSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Profiles Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Profiles
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security Panel */}
          <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
            <h3 className="serif text-lg italic font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Security Settings
            </h3>

            <div className="p-4 bg-gray-50 dark:bg-neutral-900/30 border border-gray-300 dark:border-subtle rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 dark:text-gray-200">Simulate Biometric lock</h4>
                    <p className="text-[10px] text-gray-600 dark:text-neutral-500 mt-0.5 font-medium">Require Fingerprint/FaceID to unlock accounts</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isBiometricEnabled}
                    onChange={(e) => onToggleBiometric(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-neutral-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#faf8f5] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#faf8f5] after:border-gray-300 dark:after:border-neutral-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Export monthly Spending reports */}
          <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
            <h3 className="serif text-lg italic font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              Generate Monthly Spend Report
            </h3>

            <p className="text-xs text-gray-700 dark:text-neutral-400 mb-4 leading-relaxed font-medium">
              Export all logged roommate transactions, split ratios, and payments into a fully formatted CSV Excel report. Ideal for long-term monthly financial reviews and budget planning.
            </p>

            <button
              onClick={handleExportCSV}
              className="w-full py-2.5 px-4 border border-emerald-500/30 dark:border-emerald-500/30 text-emerald-600 dark:text-accent-emerald bg-transparent hover:bg-emerald-500/5 dark:hover:bg-emerald-500/5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer flex justify-center items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download CSV spending report
            </button>
          </div>
        </div>

      </div>

      {/* Category Manager */}
      <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
        <h3 className="serif text-lg italic font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-500" />
          Manage Custom Budget Categories & Limits
        </h3>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {categories.map((cat) => (
            <div key={cat.id} className="p-3 border border-gray-300 dark:border-subtle rounded-lg bg-gray-50 dark:bg-neutral-900/30 space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-600 dark:text-neutral-500 font-bold">Category name</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-black text-gray-950 dark:text-white truncate">{cat.name}</span>
              </div>
              <div className="pt-2">
                <span className="text-[9px] uppercase font-mono text-gray-600 dark:text-neutral-500 block font-bold">Monthly Limit</span>
                <span className="text-xs font-bold text-gray-900 dark:text-neutral-400 font-mono">${cat.limit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleAddCategorySubmit} className="border-t border-gray-300 dark:border-subtle pt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">New Category Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Fitness, Subscriptions"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Monthly Limit ($)</label>
            <input
              type="number"
              required
              placeholder="100"
              value={newCatLimit}
              onChange={(e) => setNewCatLimit(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Accent Accent</label>
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-full h-[30px] px-1 py-0.5 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg cursor-pointer"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Select Icon</label>
            <select
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {availableIcons.map((ic) => (
                <option key={ic} value={ic}>{ic}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="sm:col-span-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs uppercase tracking-wider font-semibold flex justify-center items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category
          </button>
        </form>
      </div>

    </div>
  );
}
