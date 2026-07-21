import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  FileText, 
  Camera, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  TrendingDown,
  ChevronDown,
  Info,
  DollarSign
} from "lucide-react";
import { Expense, BudgetCategory, Person } from "../types";
import { iconMap } from "./DashboardView";

interface ExpensesViewProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  partnerA: Person;
  partnerB: Person;
  currentUser: "user_a" | "user_b";
  onAddExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  scanReceiptOCR: (base64Image: string, mimeType: string) => Promise<any>;
}

export function ExpensesView({
  expenses,
  categories,
  partnerA,
  partnerB,
  currentUser,
  onAddExpense,
  onDeleteExpense,
  scanReceiptOCR
}: ExpensesViewProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPayer, setSelectedPayer] = useState("All");

  // Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "Groceries");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidBy, setPaidBy] = useState<"user_a" | "user_b">("user_a");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  
  // Custom split values
  const [shareA, setShareA] = useState("");
  const [shareB, setShareB] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || exp.category === selectedCategory;
    const matchesPayer = 
      selectedPayer === "All" || 
      (selectedPayer === "user_a" && exp.paidById === "user_a") ||
      (selectedPayer === "user_b" && exp.paidById === "user_b");
    return matchesSearch && matchesCategory && matchesPayer;
  });

  // Calculate default split details when values change
  const currentAmountNum = parseFloat(amount) || 0;
  
  // Form submission validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || isNaN(currentAmountNum) || currentAmountNum <= 0) return;

    let finalShareA = 0;
    let finalShareB = 0;

    if (splitType === "equal") {
      finalShareA = currentAmountNum / 2;
      finalShareB = currentAmountNum / 2;
    } else {
      const sANum = parseFloat(shareA) || 0;
      const sBNum = parseFloat(shareB) || 0;
      
      // Let's validate the sum. If they don't match, we force correct the other or alert!
      if (Math.abs(sANum + sBNum - currentAmountNum) > 0.01) {
        alert(`The custom shares ($${sANum} + $${sBNum} = $${(sANum + sBNum).toFixed(2)}) must sum to the total amount of $${currentAmountNum}`);
        return;
      }
      finalShareA = sANum;
      finalShareB = sBNum;
    }

    await onAddExpense({
      title,
      amount: currentAmountNum,
      category,
      date,
      paidById: paidBy,
      splitType,
      splitDetails: {
        user_a: finalShareA,
        user_b: finalShareB
      }
    });

    // Reset Form
    setTitle("");
    setAmount("");
    setShareA("");
    setShareB("");
    setIsAddOpen(false);
  };

  // Convert image to Base64 and run OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      try {
        const parsed = await scanReceiptOCR(base64String, file.type);
        if (parsed) {
          setTitle(parsed.merchant || "Receipt Store");
          setAmount(String(parsed.amount || ""));
          if (parsed.category) {
            // Find matched category or default
            const match = categories.find((c) => c.name.toLowerCase() === parsed.category.toLowerCase());
            if (match) setCategory(match.name);
          }
          if (parsed.date) setDate(parsed.date);
        }
      } catch (err: any) {
        setScanError(err.message || "Failed to scan receipt image.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Simulated Mock Receipt for Instant Demo
  const triggerMockScan = async (presetType: "costco" | "utilities" | "cafe") => {
    setIsScanning(true);
    setScanError(null);

    // Create simple base64 placeholder (Gemini handles even placeholder image with instructions, but to make it foolproof
    // we'll simulate the response with actual API or direct parsing)
    // Here, let's trigger the actual api with a mini base64 payload to let the Gemini model process it!
    // We'll use a valid tiny 1x1 green pixel png as the base64 payload.
    const tinyPngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    try {
      // Send the tiny base64 to the server with preset directives or mock it nicely
      // If the API key isn't configured yet, we will gracefully mock the output so the client never crashes
      // Let's call our endpoint! If it fails due to API key, we will catch it and populate beautiful mock values.
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: tinyPngBase64, mimeType: "image/png" })
      }).catch(() => null);

      let parsed;
      if (response && response.ok) {
        parsed = await response.json();
      } else {
        // Fallback to high-quality preset values so the demo works seamlessly
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate loading spinner
        if (presetType === "costco") {
          parsed = { merchant: "Costco Wholesale", amount: 154.20, category: "Groceries", date: "2026-07-21" };
        } else if (presetType === "utilities") {
          parsed = { merchant: "Comcast Cable", amount: 79.99, category: "Utilities", date: "2026-07-19" };
        } else {
          parsed = { merchant: "Blue Bottle Coffee", amount: 16.50, category: "Dining Out", date: "2026-07-20" };
        }
      }

      if (parsed) {
        setTitle(parsed.merchant || "Costco");
        setAmount(String(parsed.amount || ""));
        const match = categories.find((c) => c.name.toLowerCase() === parsed.category?.toLowerCase());
        if (match) setCategory(match.name);
        if (parsed.date) setDate(parsed.date);
      }
    } catch (e: any) {
      setScanError("Failed to parse. Showing fallback data.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h2 className="serif text-2xl italic text-gray-900 dark:text-white">Shared Expense Register</h2>
          <p className="text-xs text-gray-500 dark:text-[#e0d8d0] opacity-80">Track and split bills in real-time</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Shared Expense
        </button>
      </div>

      {/* Filters card */}
      <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 appearance-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 top-3.5 pointer-events-none" />
        </div>

        {/* Payer Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 appearance-none cursor-pointer"
          >
            <option value="All">All Payers</option>
            <option value="user_a">Paid by {partnerA.name}</option>
            <option value="user_b">Paid by {partnerB.name}</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Expense ledger list */}
      <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-neutral-900/40 border-b border-gray-300 dark:border-subtle text-[10px] font-mono uppercase tracking-wider text-gray-700 dark:text-neutral-500">
                <th className="py-3 px-6">Transaction Details</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Paid Upfront</th>
                <th className="py-3 px-6">Splits Breakdown</th>
                <th className="py-3 px-6 text-right">Amount</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-subtle text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-neutral-500">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isA = exp.paidById === "user_a";
                  const categoryObj = categories.find((c) => c.name === exp.category);
                  const Icon = categoryObj ? (iconMap[categoryObj.icon] || FileText) : FileText;

                  return (
                    <motion.tr 
                      key={exp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-100/30 dark:hover:bg-neutral-900/40 transition-all group border-b border-gray-200/60 dark:border-subtle"
                    >
                      {/* Name and Date */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-950 dark:text-white text-sm">{exp.title}</div>
                        <div className="text-xs text-gray-600 dark:text-neutral-500 mt-1 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.date}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span 
                          className="px-2.5 py-1 rounded-sm text-xs font-medium flex items-center w-fit gap-1 text-white uppercase tracking-wider"
                          style={{ backgroundColor: categoryObj?.color || "#6b7280" }}
                        >
                          <Icon className="w-3 h-3" />
                          {exp.category}
                        </span>
                      </td>

                      {/* Paid By */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <img 
                            src={isA ? partnerA.avatar : partnerB.avatar} 
                            alt={isA ? partnerA.name : partnerB.name} 
                            className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-subtle"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs text-gray-800 dark:text-[#e0d8d0] font-bold">
                            {isA ? partnerA.name : partnerB.name}
                          </span>
                        </div>
                      </td>

                      {/* Splits Breakdown */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between max-w-[120px]">
                            <span className="text-gray-600 dark:text-neutral-500 font-medium">{partnerA.name}:</span>
                            <span className="font-mono text-gray-800 dark:text-neutral-400 font-semibold">${exp.splitDetails.user_a.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between max-w-[120px]">
                            <span className="text-gray-600 dark:text-neutral-500 font-medium">{partnerB.name}:</span>
                            <span className="font-mono text-gray-800 dark:text-neutral-400 font-semibold">${exp.splitDetails.user_b.toFixed(2)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white font-mono text-base">
                        ${exp.amount.toFixed(2)}
                      </td>

                      {/* Trash action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Dialog Drawer */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative scrollbar-thin"
            >
              <div className="flex justify-between items-start mb-6 border-b border-gray-200/50 dark:border-subtle pb-4">
                <div>
                  <h3 className="serif text-xl italic text-gray-900 dark:text-white font-medium">Record Shared Expense</h3>
                  <p className="text-xs text-gray-400 mt-1">Fill in manually or utilize Gemini OCR to scan a receipt</p>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Receipt OCR Panel */}
              <div className="mb-6 p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/15 dark:border-emerald-900/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-accent-emerald flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini AI Receipt OCR Scanner
                  </h4>
                  {isScanning && (
                    <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing receipt...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex-1 py-2 px-3 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-200 dark:border-subtle rounded-lg text-xs font-medium text-gray-700 dark:text-[#e0d8d0] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload Receipt Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Mock instant scan presets for quick demonstrations */}
                  <button
                    onClick={() => triggerMockScan("costco")}
                    disabled={isScanning}
                    className="py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-accent-emerald border border-emerald-500/20 dark:border-emerald-900/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Costco
                  </button>
                  <button
                    onClick={() => triggerMockScan("utilities")}
                    disabled={isScanning}
                    className="py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-accent-emerald border border-emerald-500/20 dark:border-emerald-900/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Comcast
                  </button>
                  <button
                    onClick={() => triggerMockScan("cafe")}
                    disabled={isScanning}
                    className="py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-accent-emerald border border-emerald-500/20 dark:border-emerald-900/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Blue Bottle
                  </button>
                </div>

                {scanError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 font-medium bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {scanError}
                  </p>
                )}
              </div>

              {/* Form details */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Expense Title / Merchant</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Electricity Bill, Costco Groceries"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Total Amount ($)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                      />
                      <DollarSign className="w-3.5 h-3.5 text-gray-700 absolute left-2.5 top-3.5" />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Budget Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Paid By */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Who Paid Upfront?</label>
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="user_a">{partnerA.name}</option>
                      <option value="user_b">{partnerB.name}</option>
                    </select>
                  </div>
                </div>

                {/* Split Configuration */}
                <div className="border-t border-gray-300 dark:border-subtle pt-4 mt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-neutral-400">Expense Splitting Formula</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSplitType("equal")}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                          splitType === "equal" 
                            ? "bg-emerald-600 text-white" 
                            : "bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-[#e0d8d0] border border-gray-200 dark:border-subtle"
                        }`}
                      >
                        Split Equally
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSplitType("custom");
                          // prefill equal share values to start with
                          if (!shareA || !shareB) {
                            setShareA(String(currentAmountNum / 2));
                            setShareB(String(currentAmountNum / 2));
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                          splitType === "custom" 
                            ? "bg-emerald-600 text-white" 
                            : "bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-[#e0d8d0] border border-gray-200 dark:border-subtle"
                        }`}
                      >
                        Custom Shares
                      </button>
                    </div>
                  </div>

                  {splitType === "equal" ? (
                    <div className="p-3 bg-gray-100 dark:bg-neutral-900/40 border border-gray-300 dark:border-subtle rounded-lg flex justify-between items-center text-xs">
                      <span className="text-gray-700 dark:text-neutral-400 flex items-center gap-1 font-medium">
                        <Info className="w-3.5 h-3.5 text-emerald-500" />
                        Each partner is assigned a fair 50% split.
                      </span>
                      <strong className="text-gray-900 dark:text-white font-mono font-bold text-sm">
                        ${(currentAmountNum / 2).toFixed(2)} / each
                      </strong>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-100/50 dark:bg-neutral-900/40 border border-gray-200 dark:border-subtle rounded-lg grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-gray-400 dark:text-neutral-500 mb-1">{partnerA.name}'s Share ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={shareA}
                          onChange={(e) => setShareA(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-subtle rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-gray-400 dark:text-neutral-500 mb-1">{partnerB.name}'s Share ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={shareB}
                          onChange={(e) => setShareB(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-subtle rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      
                      {/* Check validation sum */}
                      <div className="col-span-2 text-right">
                        <span className={`text-[10px] font-mono font-medium ${
                          Math.abs((parseFloat(shareA) || 0) + (parseFloat(shareB) || 0) - currentAmountNum) < 0.01
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}>
                          Sum: ${((parseFloat(shareA) || 0) + (parseFloat(shareB) || 0)).toFixed(2)} / ${currentAmountNum.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full mt-4 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-600/10"
                >
                  Confirm Shared Expense
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
