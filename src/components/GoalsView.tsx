import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Sparkles,
  Info
} from "lucide-react";
import { Goal } from "../types";

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, "id" | "createdAt">) => Promise<void>;
  onUpdateGoalProgress: (id: string, amount: number) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export function GoalsView({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal
}: GoalsViewProps) {
  
  // Add Goal Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("2026-12-31");
  const [notes, setNotes] = useState("");

  // Manage Progress State
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [addFundAmount, setAddFundAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tAmt = parseFloat(targetAmount);
    const cAmt = parseFloat(currentAmount) || 0;
    if (!title || isNaN(tAmt) || tAmt <= 0) return;

    await onAddGoal({
      title,
      targetAmount: tAmt,
      currentAmount: cAmt,
      targetDate,
      notes: notes || undefined
    });

    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setNotes("");
    setIsAddOpen(false);
  };

  const handleAddFunds = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const topUp = parseFloat(addFundAmount);
    if (isNaN(topUp) || topUp <= 0) return;

    const nextAmt = Math.min(goal.currentAmount + topUp, goal.targetAmount);
    await onUpdateGoalProgress(id, nextAmt);
    
    setAddFundAmount("");
    setSelectedGoalId(null);
  };

  // Quick top-up helpers
  const handleQuickAdd = async (id: string, topUp: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const nextAmt = Math.min(goal.currentAmount + topUp, goal.targetAmount);
    await onUpdateGoalProgress(id, nextAmt);
  };

  // Calculate high-level savings stats
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Top action header and stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total savings metric */}
        <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs relative overflow-hidden md:col-span-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-gray-600 dark:text-neutral-500">Shared Savings Portfolio</p>
              <h3 className="serif text-3xl italic font-bold text-gray-900 dark:text-white mt-1">
                ${totalSaved.toFixed(2)}
              </h3>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Savings Target
            </button>
          </div>

          <div className="space-y-2 mt-4 text-xs text-gray-700 dark:text-neutral-400">
            <div className="flex justify-between">
              <span>Overall Goal Target Portfolio:</span>
              <span className="font-bold text-gray-950 dark:text-white font-mono">${totalTarget.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-neutral-900 h-2.5 rounded-full">
              <div 
                className="h-2.5 rounded-full bg-emerald-500" 
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 dark:text-neutral-500 font-mono font-semibold">
              <span>{overallPercent.toFixed(1)}% Completed</span>
              <span>Need ${Math.max(0, totalTarget - totalSaved).toFixed(2)} more</span>
            </div>
          </div>
        </div>

        {/* Informative tips box */}
        <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/15 dark:border-emerald-900/30 text-gray-800 dark:text-[#e0d8d0] rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <h4 className="serif italic text-base text-gray-900 dark:text-white font-medium">Save Together</h4>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Achieve mutual milestones! Saving for trips, living room furniture, or security deposits keeps roommate finances transparent.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Savings Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl py-12 text-center text-gray-600 dark:text-neutral-500">
            <PiggyBank className="w-12 h-12 text-gray-300 dark:text-neutral-700 mx-auto mb-2" />
            <p className="text-sm">No savings goals created yet.</p>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="mt-3 text-xs text-emerald-500 hover:underline cursor-pointer"
            >
              Add a goal target
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="serif text-base text-gray-950 dark:text-white font-bold">{goal.title}</h4>
                      {goal.notes && (
                        <p className="text-xs text-gray-700 dark:text-neutral-400 mt-1 leading-relaxed font-medium">{goal.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Target progression */}
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-neutral-500 font-mono font-medium">
                        ${goal.currentAmount.toFixed(0)} saved
                      </span>
                      <span className="text-gray-950 dark:text-white font-bold font-mono">
                        Target: ${goal.targetAmount.toFixed(0)}
                      </span>
                    </div>

                    <div className="w-full bg-gray-300 dark:bg-neutral-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-emerald-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-600 dark:text-neutral-500 font-mono font-semibold">
                      <span>{pct.toFixed(0)}% Completed</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {daysLeft > 0 ? `${daysLeft} days remaining` : "Target Date reached"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Savings progression quick tools */}
                <div className="border-t border-gray-300 dark:border-subtle pt-4 mt-6">
                  {isCompleted ? (
                    <div className="py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-600 dark:text-accent-emerald font-bold flex justify-center items-center gap-1">
                      🎉 Goal Fully Completed!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 dark:text-neutral-400 font-bold">Quick Deposit Fund:</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleQuickAdd(goal.id, 25)}
                            className="px-2 py-1 bg-white dark:bg-neutral-800 hover:bg-emerald-500/10 text-gray-800 dark:text-gray-300 font-bold border border-gray-300 dark:border-subtle rounded text-xs cursor-pointer transition-all"
                          >
                            +$25
                          </button>
                          <button 
                            onClick={() => handleQuickAdd(goal.id, 50)}
                            className="px-2 py-1 bg-white dark:bg-neutral-800 hover:bg-emerald-500/10 text-gray-800 dark:text-gray-300 font-bold border border-gray-300 dark:border-subtle rounded text-xs cursor-pointer transition-all"
                          >
                            +$50
                          </button>
                          <button 
                            onClick={() => handleQuickAdd(goal.id, 100)}
                            className="px-2 py-1 bg-white dark:bg-neutral-800 hover:bg-emerald-500/10 text-gray-800 dark:text-gray-300 font-bold border border-gray-300 dark:border-subtle rounded text-xs cursor-pointer transition-all"
                          >
                            +$100
                          </button>
                        </div>
                      </div>

                      {/* Custom Deposit Field */}
                      {selectedGoalId === goal.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Amount ($)"
                            value={addFundAmount}
                            onChange={(e) => setAddFundAmount(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-xs"
                          />
                          <button
                            onClick={() => handleAddFunds(goal.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setSelectedGoalId(null)}
                            className="px-2.5 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-400 rounded-lg text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedGoalId(goal.id)}
                          className="w-full py-2 bg-white hover:bg-gray-50 dark:bg-neutral-900/40 hover:dark:bg-neutral-800 border border-gray-300 dark:border-subtle rounded-lg text-xs font-bold text-gray-800 dark:text-gray-300 cursor-pointer flex justify-center items-center gap-1 transition-all"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                          Add Custom Funds
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Savings Goal Target Dialog Drawer */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl max-w-md w-full shadow-2xl p-6 relative"
            >
              <div className="flex justify-between items-start mb-6 border-b border-gray-200/50 dark:border-subtle pb-4">
                <h3 className="serif text-xl italic font-medium text-gray-900 dark:text-white">New Savings Target</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-neutral-500 text-xl font-bold cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Savings Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hawaii Winter Vacation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Target Amount ($)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 3000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Current Balance ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Target Date</label>
                    <input
                      type="date"
                      required
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Notes / Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details about what you're saving for..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-600/10"
                >
                  Create Savings Target
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
