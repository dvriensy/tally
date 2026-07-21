import React from "react";
import { motion } from "motion/react";
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  PiggyBank,
  CheckCircle,
  HelpCircle,
  Home,
  Droplet,
  ShoppingCart,
  Utensils,
  Sparkles,
  Car,
  ShoppingBag
} from "lucide-react";
import { Expense, BudgetCategory, ActivityLog, Person } from "../types";

interface DashboardViewProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  logs: ActivityLog[];
  partnerA: Person;
  partnerB: Person;
  currentUser: "user_a" | "user_b";
  summary: {
    totalSpent: number;
    spentByA: number;
    spentByB: number;
    shareA: number;
    shareB: number;
    netBalance: number;
    whoOwesWho: string;
    oweAmount: number;
  };
  onSettleUp: () => void;
  onNavigateToExpenses: () => void;
}

// Icon mapper for Lucide icons
export const iconMap: Record<string, React.ComponentType<any>> = {
  Home,
  Droplet,
  ShoppingCart,
  Utensils,
  Sparkles,
  Car,
  ShoppingBag,
  HelpCircle
};

export function DashboardView({
  expenses,
  categories,
  logs,
  partnerA,
  partnerB,
  currentUser,
  summary,
  onSettleUp,
  onNavigateToExpenses
}: DashboardViewProps) {
  
  // Calculate spend per category
  const categorySpend = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      ...cat,
      spent: total,
      percent: cat.limit > 0 ? (total / cat.limit) * 100 : 0
    };
  });

  // Calculate SVG Pie/Donut Chart details for Spend by Category
  const activeCategoriesWithSpend = categorySpend.filter((c) => c.spent > 0);
  const totalCategorySpend = activeCategoriesWithSpend.reduce((sum, c) => sum + c.spent, 0);

  // SVG parameters for donut chart
  let cumulativePercent = 0;
  const donutSlices = activeCategoriesWithSpend.map((cat) => {
    const percent = cat.spent / totalCategorySpend;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    // SVG coordinate math
    const getCoordinatesForPercent = (p: number) => {
      const x = Math.cos(2 * Math.PI * p);
      const y = Math.sin(2 * Math.PI * p);
      return [x, y];
    };

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    // Path command
    const pathData = [
      `M ${startX} ${startY}`, // Move to starting radius coordinate
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc to end coordinate
      `L 0 0` // Line back to center
    ].join(" ");

    return {
      pathData,
      color: cat.color,
      name: cat.name,
      spent: cat.spent,
      percent: percent * 100
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Overview Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Real-time Balance Split Sheet */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-neutral-500">Shared Ledger Balance</p>
              <h3 className="serif text-3xl italic tracking-tight text-gray-900 dark:text-white mt-1">
                ${summary.oweAmount.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-accent-emerald">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-[#e0d8d0] font-medium mb-5">
            {summary.netBalance === 0 ? (
              <span className="text-emerald-500 font-mono text-xs uppercase tracking-wider">🎉 Fully Settled</span>
            ) : (
              <span className="leading-relaxed">
                {summary.netBalance > 0 ? (
                  <>
                    <strong style={{ color: partnerB.color }}>{partnerB.name}</strong> owes <strong style={{ color: partnerA.color }}>{partnerA.name}</strong> ${summary.oweAmount.toFixed(2)}
                  </>
                ) : (
                  <>
                    <strong style={{ color: partnerA.color }}>{partnerA.name}</strong> owes <strong style={{ color: partnerB.color }}>{partnerB.name}</strong> ${summary.oweAmount.toFixed(2)}
                  </>
                )}
              </span>
            )}
          </p>

          {summary.oweAmount > 0 && (
            <button
              onClick={onSettleUp}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium text-xs uppercase tracking-wider rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex justify-center items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Settle Shared Balance
            </button>
          )}
        </motion.div>

        {/* User A Spent Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: partnerA.color }} />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-neutral-500">Paid upfront by {partnerA.name}</p>
              <h3 className="serif text-3xl italic tracking-tight text-gray-900 dark:text-white mt-1">
                ${summary.spentByA.toFixed(2)}
              </h3>
            </div>
            <img 
              src={partnerA.avatar} 
              alt={partnerA.name} 
              className="w-10 h-10 rounded-full object-cover border-2"
              style={{ borderColor: partnerA.color }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-2.5 mt-4 text-xs text-gray-700 dark:text-neutral-400">
            <div className="flex justify-between font-mono">
              <span>Required Fair Share:</span>
              <span className="font-bold text-gray-950 dark:text-[#e0d8d0]">${summary.shareA.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  backgroundColor: partnerA.color,
                  width: `${summary.totalSpent > 0 ? (summary.spentByA / summary.totalSpent) * 100 : 50}%` 
                }}
              />
            </div>
            <p className="text-[10px] text-right italic font-mono text-gray-600 dark:text-neutral-500">
              Paid {summary.totalSpent > 0 ? ((summary.spentByA / summary.totalSpent) * 100).toFixed(0) : 0}% of expenses
            </p>
          </div>
        </motion.div>

        {/* User B Spent Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: partnerB.color }} />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray-600 dark:text-neutral-500">Paid upfront by {partnerB.name}</p>
              <h3 className="serif text-3xl italic tracking-tight text-gray-900 dark:text-white mt-1">
                ${summary.spentByB.toFixed(2)}
              </h3>
            </div>
            <img 
              src={partnerB.avatar} 
              alt={partnerB.name} 
              className="w-10 h-10 rounded-full object-cover border-2"
              style={{ borderColor: partnerB.color }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-2.5 mt-4 text-xs text-gray-700 dark:text-neutral-400">
            <div className="flex justify-between font-mono">
              <span>Required Fair Share:</span>
              <span className="font-bold text-gray-950 dark:text-[#e0d8d0]">${summary.shareB.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  backgroundColor: partnerB.color,
                  width: `${summary.totalSpent > 0 ? (summary.spentByB / summary.totalSpent) * 100 : 50}%` 
                }}
              />
            </div>
            <p className="text-[10px] text-right italic font-mono text-gray-600 dark:text-neutral-500">
              Paid {summary.totalSpent > 0 ? ((summary.spentByB / summary.totalSpent) * 100).toFixed(0) : 0}% of expenses
            </p>
          </div>
        </motion.div>

      </div>

      {/* Analytics Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spend distribution SVG Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="serif text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Category Breakdown
            </h3>
            <span className="text-[10px] font-mono bg-gray-200 dark:bg-neutral-900 px-2.5 py-1 rounded-md text-gray-700 dark:text-neutral-400 border border-gray-300 dark:border-subtle">
              Total: ${totalCategorySpend.toFixed(2)}
            </span>
          </div>

          {activeCategoriesWithSpend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-neutral-500 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 dark:text-neutral-800 mb-2" />
              <p className="text-sm">No recorded expenses to show analytics.</p>
              <button 
                onClick={onNavigateToExpenses}
                className="mt-3 text-xs text-emerald-500 hover:underline cursor-pointer"
              >
                Log your first expense
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stunning Responsive Donut Chart */}
              <div className="flex justify-center py-2 relative">
                <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-44 h-44 transform -rotate-90">
                  {donutSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      className="transition-all duration-300 hover:scale-105 origin-center cursor-pointer"
                    >
                      <title>{slice.name}: ${slice.spent.toFixed(2)} ({slice.percent.toFixed(1)}%)</title>
                    </path>
                  ))}
                  {/* Center cutout to make it a donut */}
                  <circle cx="0" cy="0" r="0.65" className="fill-white dark:fill-sophisticated-card" />
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono tracking-wider text-gray-600 dark:text-neutral-500 uppercase">Monthly</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${totalCategorySpend.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Categorized Legend Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {activeCategoriesWithSpend.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-800 dark:text-[#e0d8d0] truncate font-bold">{cat.name}</span>
                    <span className="text-gray-600 dark:text-neutral-400 ml-auto font-mono font-semibold">
                      ${cat.spent.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget Limit Monitors */}
        <div className="lg:col-span-7 bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
          <h3 className="serif text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Budget Limit Indicators
          </h3>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
            {categorySpend.map((cat) => {
              const Icon = iconMap[cat.icon] || HelpCircle;
              const isOver = cat.spent > cat.limit;

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-1.5 rounded-lg border text-white" 
                        style={{ backgroundColor: cat.color, borderColor: `${cat.color}30` }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-gray-800 dark:text-[#e0d8d0]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-950 dark:text-white font-mono">${cat.spent.toFixed(2)}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-600 dark:text-neutral-500 font-mono">${cat.limit}</span>
                      {isOver && (
                        <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-accent-rose p-0.5 rounded-full border border-rose-100 dark:border-rose-900/30">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-neutral-900 h-1 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(cat.percent, 100)}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${
                        isOver ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ 
                        backgroundColor: isOver ? undefined : cat.color 
                      }}
                    />
                  </div>

                  {isOver && (
                    <p className="text-[10px] text-rose-500 dark:text-accent-rose flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3" />
                      Over monthly limit by ${(cat.spent - cat.limit).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Audit/Activity Log Feed */}
      <div className="bg-white dark:bg-sophisticated-card border border-gray-300 dark:border-subtle rounded-2xl p-6 shadow-xs">
        <h3 className="serif text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Real-time Audit Ledger
        </h3>

        <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No system activities logged yet.</p>
          ) : (
            logs.map((log) => {
              const isUserA = log.userId === "user_a";
              return (
                <div key={log.id} className="flex justify-between items-start p-2.5 hover:bg-gray-100 dark:hover:bg-neutral-900/60 rounded-xl transition-all border border-transparent hover:border-gray-300 dark:hover:border-subtle text-xs">
                  <div className="flex gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: isUserA ? partnerA.color : partnerB.color }} />
                    <div>
                      <p className="text-gray-950 dark:text-[#e0d8d0]">
                        <strong className="font-bold">{log.userName}</strong>: <span className="text-gray-800 dark:text-neutral-300">{log.details}</span>
                      </p>
                      <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-500">
                        {log.action}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
