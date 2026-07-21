import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  TrendingDown
} from "lucide-react";
import { PaymentReminder, BudgetCategory, Person } from "../types";

interface CalendarViewProps {
  reminders: PaymentReminder[];
  categories: BudgetCategory[];
  partnerA: Person;
  partnerB: Person;
  onAddReminder: (reminder: Omit<PaymentReminder, "id">) => Promise<void>;
  onToggleReminderPaid: (id: string) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
}

export function CalendarView({
  reminders,
  categories,
  partnerA,
  partnerB,
  onAddReminder,
  onToggleReminderPaid,
  onDeleteReminder
}: CalendarViewProps) {
  
  // Calendar Month selection (starting July 2026 as per system metadata)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 is July)

  // Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("2026-07-25");
  const [frequency, setFrequency] = useState<"monthly" | "weekly" | "one-time">("monthly");
  const [assignedTo, setAssignedTo] = useState<"user_a" | "user_b" | "both">("both");
  const [category, setCategory] = useState("Utilities");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper: Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month index (0-6)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filter reminders for the active month
  const getRemindersForDay = (day: number) => {
    return reminders.filter((rem) => {
      const dateObj = new Date(rem.dueDate);
      return (
        dateObj.getFullYear() === currentYear &&
        dateObj.getMonth() === currentMonth &&
        dateObj.getDate() === day
      );
    });
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!title || isNaN(amountNum) || amountNum <= 0) return;

    await onAddReminder({
      title,
      amount: amountNum,
      dueDate,
      frequency,
      assignedTo,
      isPaid: false,
      category
    });

    setTitle("");
    setAmount("");
    setIsAddOpen(false);
  };

  // Calendar render grid array
  const calendarCells = [];
  // Fill preceding empty cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, key: `empty-${i}` });
  }
  // Fill actual month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ day: i, key: `day-${i}` });
  }

  // Calculate upcoming alert notifications
  const upcomingReminders = reminders
    .filter((rem) => !rem.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Due date reminders notifications */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Scheduled upcoming bills feed */}
        <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-subtle">
            <h3 className="serif italic text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              Due Reminders
            </h3>
            <button
              onClick={() => setIsAddOpen(true)}
              className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-accent-emerald cursor-pointer hover:bg-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-neutral-500 text-xs">
                🎉 All reminders are paid up!
              </div>
            ) : (
              upcomingReminders.map((rem) => {
                const isBoth = rem.assignedTo === "both";
                const isA = rem.assignedTo === "user_a";
                const catObj = categories.find((c) => c.name === rem.category);

                return (
                  <div key={rem.id} className="p-3 bg-gray-50 dark:bg-neutral-900/40 border border-gray-300 dark:border-subtle rounded-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 h-full w-1" style={{ backgroundColor: catObj?.color || "#cbd5e1" }} />
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <h4 className="font-bold text-gray-950 dark:text-white text-xs">{rem.title}</h4>
                        <p className="text-[10px] text-gray-600 dark:text-neutral-500 mt-0.5 font-mono font-medium">{rem.dueDate} ({rem.frequency})</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-500 font-semibold">Responsible:</span>
                          <div className="flex -space-x-1">
                            {(isBoth || isA) && (
                              <img src={partnerA.avatar} alt={partnerA.name} className="w-4.5 h-4.5 rounded-full border border-white dark:border-neutral-950 object-cover" title={partnerA.name} referrerPolicy="no-referrer" />
                            )}
                            {(isBoth || !isA) && (
                              <img src={partnerB.avatar} alt={partnerB.name} className="w-4.5 h-4.5 rounded-full border border-white dark:border-neutral-950 object-cover" title={partnerB.name} referrerPolicy="no-referrer" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">${rem.amount.toFixed(2)}</div>
                        <div className="flex gap-1 mt-2.5">
                          <button
                            onClick={() => onToggleReminderPaid(rem.id)}
                            className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-accent-emerald hover:bg-emerald-500/20 transition-all cursor-pointer"
                            title="Mark as Paid"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteReminder(rem.id)}
                            className="p-1 rounded-md bg-gray-100 dark:bg-neutral-800 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Delete Reminder"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Calendar legend / general reminders list */}
        <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/15 dark:border-emerald-900/30 rounded-2xl p-4 flex gap-3 text-xs text-emerald-700 dark:text-[#e0d8d0] opacity-90">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <div>
            <span className="font-semibold serif italic text-sm text-emerald-600 dark:text-accent-emerald">Reminders Split Automatic Log</span>
            <p className="mt-1 leading-relaxed text-gray-500 dark:text-neutral-400">
              Paying standard reminders generates a dual ledger transaction on its due date automatically splitting utilities and internet.
            </p>
          </div>
        </div>

      </div>

      {/* Calendar monthly schedule grid */}
      <div className="lg:col-span-8 bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
        
        {/* Month Selector header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="serif text-xl italic font-medium text-gray-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-subtle hover:bg-gray-100/40 dark:hover:bg-neutral-800 text-gray-500 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-subtle hover:bg-gray-100/40 dark:hover:bg-neutral-800 text-gray-500 cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day abbreviations */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-gray-700 dark:text-neutral-500 uppercase tracking-wider font-bold border-b border-gray-300 dark:border-subtle pb-3 mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            if (cell.day === null) {
              return <div key={cell.key} className="h-20 bg-gray-50/10 dark:bg-neutral-900/10 rounded-lg" />;
            }

            const dayReminders = getRemindersForDay(cell.day);

            return (
              <div 
                key={cell.key} 
                onClick={() => {
                  setDueDate(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`);
                  setIsAddOpen(true);
                }}
                className="h-20 p-1.5 bg-gray-50 dark:bg-neutral-900/30 border border-gray-300 dark:border-subtle rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500/80 transition-all cursor-pointer flex flex-col justify-between"
              >
                <span className="text-xs font-bold text-gray-700 dark:text-neutral-500 ml-1 font-mono">{cell.day}</span>
                
                {/* Due dates miniature indicators */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayReminders.slice(0, 2).map((rem) => {
                    const catObj = categories.find((c) => c.name === rem.category);
                    return (
                      <div 
                        key={rem.id} 
                        className={`text-[8px] px-1 py-0.5 rounded-sm truncate text-white uppercase tracking-wider font-medium ${
                          rem.isPaid ? "opacity-30 line-through" : ""
                        }`}
                        style={{ backgroundColor: catObj?.color || "#6b7280" }}
                        title={`${rem.title} - $${rem.amount}`}
                      >
                        {rem.title}
                      </div>
                    );
                  })}
                  {dayReminders.length > 2 && (
                    <div className="text-[7px] text-center text-gray-400 dark:text-neutral-500 font-mono">
                      +{dayReminders.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Add Payment Reminder Dialog Drawer */}
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
                <h3 className="serif text-xl italic font-medium text-gray-900 dark:text-white">Schedule Payment Reminder</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-neutral-500 text-xl font-bold cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Bill / Expense Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly Rent, Comcast Internet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Total Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm font-bold text-gray-950 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Billing Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="one-time">One-Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">Assigned Partner</label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-neutral-900/60 border border-gray-300 dark:border-subtle rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="both">Both Partners (50/50)</option>
                      <option value="user_a">{partnerA.name}</option>
                      <option value="user_b">{partnerB.name}</option>
                    </select>
                  </div>

                  <div className="col-span-2">
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
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-600/10"
                >
                  Confirm Scheduled Bill
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
