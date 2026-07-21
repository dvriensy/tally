import { useState, useEffect, useCallback } from "react";
import { 
  db, 
  isFirebaseAvailable, 
  DEFAULT_CATEGORIES 
} from "./firebase";
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from "firebase/firestore";
import { 
  Person, 
  Expense, 
  BudgetCategory, 
  Goal, 
  PaymentReminder, 
  ActivityLog 
} from "./types";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to recursively remove undefined properties (Firestore does not support undefined values)
const cleanData = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanData);
  }
  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanData(val);
    }
  });
  return cleaned;
};

// Mock initial data to seed if empty
const INITIAL_PARTNERS: Record<string, Person> = {
  user_a: { id: "user_a", name: "Alex", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", color: "#6366f1" },
  user_b: { id: "user_b", name: "Taylor", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80", color: "#f59e0b" }
};

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp_1",
    title: "Whole Foods Grocery Run",
    amount: 142.50,
    category: "Groceries",
    date: "2026-07-18",
    paidById: "user_a",
    splitType: "equal",
    splitDetails: { user_a: 71.25, user_b: 71.25 },
    createdAt: new Date("2026-07-18T10:30:00Z").toISOString()
  },
  {
    id: "exp_2",
    title: "July Electricity Bill",
    amount: 88.20,
    category: "Utilities",
    date: "2026-07-15",
    paidById: "user_b",
    splitType: "equal",
    splitDetails: { user_a: 44.10, user_b: 44.10 },
    createdAt: new Date("2026-07-15T15:45:00Z").toISOString()
  },
  {
    id: "exp_3",
    title: "Cozy Ramen Dinner",
    amount: 45.00,
    category: "Dining Out",
    date: "2026-07-20",
    paidById: "user_a",
    splitType: "custom",
    splitDetails: { user_a: 15.00, user_b: 30.00 }, // Taylor ordered more
    createdAt: new Date("2026-07-20T20:15:00Z").toISOString()
  }
];

const INITIAL_REMINDERS: PaymentReminder[] = [
  {
    id: "rem_1",
    title: "Apartment Rent Payment",
    amount: 2200,
    dueDate: "2026-08-01",
    frequency: "monthly",
    assignedTo: "both",
    isPaid: false,
    category: "Rent"
  },
  {
    id: "rem_2",
    title: "High-Speed Internet Bill",
    amount: 75,
    dueDate: "2026-08-05",
    frequency: "monthly",
    assignedTo: "user_b",
    isPaid: false,
    category: "Utilities"
  },
  {
    id: "rem_3",
    title: "Netflix Premium Split",
    amount: 22.99,
    dueDate: "2026-07-28",
    frequency: "monthly",
    assignedTo: "user_a",
    isPaid: false,
    category: "Entertainment"
  }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: "goal_1",
    title: "Hawaii Winter Vacation",
    targetAmount: 3500,
    currentAmount: 1850,
    targetDate: "2026-12-15",
    notes: "Save up for beach resort, flights, and scuba diving sessions.",
    createdAt: new Date("2026-06-01").toISOString()
  },
  {
    id: "goal_2",
    title: "New Sectional Living Room Sofa",
    targetAmount: 1200,
    currentAmount: 400,
    targetDate: "2026-09-30",
    notes: "Splitting equally for the cozy living room renovation.",
    createdAt: new Date("2026-07-01").toISOString()
  }
];

export function useBudgetStore(houseId: string | null, initialRole: "user_a" | "user_b" = "user_a") {
  // Authentication & Simulation States
  const [currentUser, setCurrentUser] = useState<"user_a" | "user_b">(initialRole);
  const [partnerA, setPartnerA] = useState<Person>(INITIAL_PARTNERS.user_a);
  const [partnerB, setPartnerB] = useState<Person>(INITIAL_PARTNERS.user_b);
  
  // House profile states
  const [houseName, setHouseName] = useState<string>("Alex & Taylor's Nest");
  const [joinPassword, setJoinPassword] = useState<string>("nest123");
  const [partnerA_uid, setPartnerA_uid] = useState<string | null>(null);
  const [partnerB_uid, setPartnerB_uid] = useState<string | null>(null);
  
  // App States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Security Simulation States
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("budget_biometric_enabled");
    return saved === "true";
  });
  const [isBiometricLocked, setIsBiometricLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem("budget_biometric_enabled");
    return saved === "true"; // lock on start if enabled
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("budget_dark_mode");
    return saved === null ? true : saved === "true";
  });

  // Cloud Sync status
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline" | "error">("syncing");
  const [isOnlineState, setIsOnlineState] = useState<boolean>(navigator.onLine);

  // Sync initialRole
  useEffect(() => {
    setCurrentUser(initialRole);
  }, [initialRole]);

  // Read theme and biometric configs
  useEffect(() => {
    localStorage.setItem("budget_dark_mode", String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("budget_biometric_enabled", String(isBiometricEnabled));
  }, [isBiometricEnabled]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnlineState(true);
    const handleOffline = () => {
      setIsOnlineState(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Firebase Real-time listeners & Local Storage Fallback
  useEffect(() => {
    if (!isFirebaseAvailable || !db || !houseId) {
      // Local storage fallback
      loadFromLocalStorage();
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("syncing");

    // Establish multi-collection listener
    const unsubscribes: Array<() => void> = [];

    try {
      // 1. House Document (Partners names, avatars, and configs)
      const unsubHouse = onSnapshot(doc(db, "houses", houseId), (docSnap) => {
        if (docSnap.exists()) {
          const houseData = docSnap.data();
          if (houseData.name) setHouseName(houseData.name);
          if (houseData.joinPassword) setJoinPassword(houseData.joinPassword);
          setPartnerA_uid(houseData.partnerA_uid || null);
          setPartnerB_uid(houseData.partnerB_uid || null);
          if (houseData.partnerA) setPartnerA(houseData.partnerA as Person);
          if (houseData.partnerB) setPartnerB(houseData.partnerB as Person);
        } else {
          // Seed the house partners if they don't exist yet
          setDoc(doc(db, "houses", houseId), cleanData({
            name: "Alex & Taylor's Nest",
            partnerA: INITIAL_PARTNERS.user_a,
            partnerB: INITIAL_PARTNERS.user_b
          }), { merge: true });
        }
      }, () => setSyncStatus("error"));
      unsubscribes.push(unsubHouse);

      // 2. Categories
      const unsubCategories = onSnapshot(collection(db, "houses", houseId, "categories"), (snapshot) => {
        if (snapshot.empty) {
          // Seed Categories
          DEFAULT_CATEGORIES.forEach((cat) => {
            setDoc(doc(db, "houses", houseId, "categories", cat.id), cleanData(cat));
          });
        } else {
          const list: BudgetCategory[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as BudgetCategory));
          setCategories(list);
        }
      }, () => setSyncStatus("error"));
      unsubscribes.push(unsubCategories);

      // 3. Expenses
      const unsubExpenses = onSnapshot(collection(db, "houses", houseId, "expenses"), (snapshot) => {
        if (snapshot.empty) {
          if (houseId === "demo_house") {
            INITIAL_EXPENSES.forEach((exp) => {
              setDoc(doc(db, "houses", houseId, "expenses", exp.id), cleanData(exp));
            });
          } else {
            setExpenses([]);
          }
        } else {
          const list: Expense[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Expense));
          // Sort descending by date
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setExpenses(list);
        }
      }, () => setSyncStatus("error"));
      unsubscribes.push(unsubExpenses);

      // 4. Reminders
      const unsubReminders = onSnapshot(collection(db, "houses", houseId, "reminders"), (snapshot) => {
        if (snapshot.empty) {
          if (houseId === "demo_house") {
            INITIAL_REMINDERS.forEach((rem) => {
              setDoc(doc(db, "houses", houseId, "reminders", rem.id), cleanData(rem));
            });
          } else {
            setReminders([]);
          }
        } else {
          const list: PaymentReminder[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as PaymentReminder));
          setReminders(list);
        }
      }, () => setSyncStatus("error"));
      unsubscribes.push(unsubReminders);

      // 5. Goals
      const unsubGoals = onSnapshot(collection(db, "houses", houseId, "goals"), (snapshot) => {
        if (snapshot.empty) {
          if (houseId === "demo_house") {
            INITIAL_GOALS.forEach((g) => {
              setDoc(doc(db, "houses", houseId, "goals", g.id), cleanData(g));
            });
          } else {
            setGoals([]);
          }
        } else {
          const list: Goal[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Goal));
          setGoals(list);
        }
      }, () => setSyncStatus("error"));
      unsubscribes.push(unsubGoals);

      // 6. Activity Logs
      const unsubLogs = onSnapshot(collection(db, "houses", houseId, "logs"), (snapshot) => {
        const list: ActivityLog[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as ActivityLog));
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivityLogs(list.slice(0, 50)); // Limit to last 50 entries
        setSyncStatus("synced");
      }, () => setSyncStatus("error"));
      unsubscribes.push(unsubLogs);

    } catch (e) {
      console.error("Failed to connect to Firebase Firestore:", e);
      loadFromLocalStorage();
      setSyncStatus("error");
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [isFirebaseAvailable, houseId]);

  // Load from LocalStorage (Fallback)
  const loadFromLocalStorage = () => {
    const localExpenses = localStorage.getItem("budget_expenses");
    const localCategories = localStorage.getItem("budget_categories");
    const localReminders = localStorage.getItem("budget_reminders");
    const localGoals = localStorage.getItem("budget_goals");
    const localLogs = localStorage.getItem("budget_logs");
    const localPartnerA = localStorage.getItem("budget_partner_a");
    const localPartnerB = localStorage.getItem("budget_partner_b");

    const isDemoHouse = !houseId || houseId === "demo_house";

    if (localExpenses) setExpenses(JSON.parse(localExpenses));
    else setExpenses(isDemoHouse ? INITIAL_EXPENSES : []);

    const localHouseName = localStorage.getItem("budget_house_name");
    const localJoinPassword = localStorage.getItem("budget_join_password");
    if (localHouseName) setHouseName(localHouseName);
    if (localJoinPassword) setJoinPassword(localJoinPassword);

    if (localCategories) setCategories(JSON.parse(localCategories));
    else setCategories(DEFAULT_CATEGORIES);

    if (localReminders) setReminders(JSON.parse(localReminders));
    else setReminders(isDemoHouse ? INITIAL_REMINDERS : []);

    if (localGoals) setGoals(JSON.parse(localGoals));
    else setGoals(isDemoHouse ? INITIAL_GOALS : []);

    if (localLogs) setActivityLogs(JSON.parse(localLogs));
    else setActivityLogs([]);

    if (localPartnerA) setPartnerA(JSON.parse(localPartnerA));
    if (localPartnerB) setPartnerB(JSON.parse(localPartnerB));
  };

  // Save to LocalStorage (Fallback helper triggered on each modification)
  const saveToLocalStorageState = (
    updatedExpenses: Expense[],
    updatedCategories: BudgetCategory[],
    updatedReminders: PaymentReminder[],
    updatedGoals: Goal[],
    updatedLogs: ActivityLog[],
    pA = partnerA,
    pB = partnerB
  ) => {
    localStorage.setItem("budget_expenses", JSON.stringify(updatedExpenses));
    localStorage.setItem("budget_categories", JSON.stringify(updatedCategories));
    localStorage.setItem("budget_reminders", JSON.stringify(updatedReminders));
    localStorage.setItem("budget_goals", JSON.stringify(updatedGoals));
    localStorage.setItem("budget_logs", JSON.stringify(updatedLogs));
    localStorage.setItem("budget_partner_a", JSON.stringify(pA));
    localStorage.setItem("budget_partner_b", JSON.stringify(pB));
    localStorage.setItem("budget_house_name", houseName);
    localStorage.setItem("budget_join_password", joinPassword);
  };

  // Helper: Log actions
  const addLog = useCallback(async (action: string, details: string, updatedLogsState?: ActivityLog[]) => {
    const actor = currentUser === "user_a" ? partnerA : partnerB;
    const newLog: ActivityLog = {
      id: "log_" + generateId(),
      userId: currentUser,
      userName: actor.name,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseAvailable && db && houseId) {
      try {
        await setDoc(doc(db, "houses", houseId, "logs", newLog.id), cleanData(newLog));
      } catch (e) {
        console.error("Firebase log write error:", e);
      }
    } else {
      const nextLogs = [newLog, ...(updatedLogsState || activityLogs)].slice(0, 50);
      setActivityLogs(nextLogs);
      return nextLogs;
    }
  }, [currentUser, partnerA, partnerB, activityLogs, houseId]);

  // Actions: Current User Switcher
  const switchUser = (user: "user_a" | "user_b") => {
    setCurrentUser(user);
    addLog("User Switch", `Switched viewing profile to ${user === "user_a" ? partnerA.name : partnerB.name}`);
  };

  // Actions: Partners Update
  const updatePartners = async (pA: Person, pB: Person) => {
    setPartnerA(pA);
    setPartnerB(pB);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId), cleanData({
        partnerA: pA,
        partnerB: pB
      }), { merge: true });
    } else {
      saveToLocalStorageState(expenses, categories, reminders, goals, activityLogs, pA, pB);
    }
    addLog("Update Partners", `Renamed or customized member profiles.`);
  };

  // Actions: Expense Operations
  const addExpense = async (expenseInput: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...expenseInput,
      id: "exp_" + generateId(),
      createdAt: new Date().toISOString()
    };

    const nextExpenses = [newExpense, ...expenses];
    setExpenses(nextExpenses);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "expenses", newExpense.id), cleanData(newExpense));
    } else {
      const logs = await addLog("Add Expense", `Added shared expense of $${newExpense.amount.toFixed(2)} for "${newExpense.title}"`);
      saveToLocalStorageState(nextExpenses, categories, reminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Add Expense", `Added shared expense of $${newExpense.amount.toFixed(2)} for "${newExpense.title}"`);
    }
  };

  const updateExpense = async (id: string, updatedInput: Omit<Expense, "id" | "createdAt">) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    const updatedExpense: Expense = {
      ...target,
      ...updatedInput,
    };

    const nextExpenses = expenses.map((e) => e.id === id ? updatedExpense : e);
    setExpenses(nextExpenses);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "expenses", id), cleanData(updatedExpense));
    } else {
      const logs = await addLog("Update Expense", `Updated expense "${updatedExpense.title}" to $${updatedExpense.amount.toFixed(2)}`);
      saveToLocalStorageState(nextExpenses, categories, reminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Update Expense", `Updated expense "${updatedExpense.title}" to $${updatedExpense.amount.toFixed(2)}`);
    }
  };

  const deleteExpense = async (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    const nextExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(nextExpenses);

    if (isFirebaseAvailable && db && houseId) {
      await deleteDoc(doc(db, "houses", houseId, "expenses", id));
    } else {
      const logs = await addLog("Delete Expense", `Deleted expense "${target.title}" of $${target.amount.toFixed(2)}`);
      saveToLocalStorageState(nextExpenses, categories, reminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Delete Expense", `Deleted expense "${target.title}" of $${target.amount.toFixed(2)}`);
    }
  };

  // Actions: Category Operations
  const addCategory = async (catInput: Omit<BudgetCategory, "id">) => {
    const newCat: BudgetCategory = {
      ...catInput,
      id: "cat_" + generateId()
    };

    const nextCategories = [...categories, newCat];
    setCategories(nextCategories);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "categories", newCat.id), cleanData(newCat));
    } else {
      const logs = await addLog("Add Category", `Created custom budget category "${newCat.name}" with monthly limit of $${newCat.limit}`);
      saveToLocalStorageState(expenses, nextCategories, reminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Add Category", `Created custom budget category "${newCat.name}" with monthly limit of $${newCat.limit}`);
    }
  };

  const updateCategory = async (updated: BudgetCategory) => {
    const nextCategories = categories.map((c) => c.id === updated.id ? updated : c);
    setCategories(nextCategories);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "categories", updated.id), cleanData(updated));
    } else {
      const logs = await addLog("Update Category", `Updated budget limit for "${updated.name}" to $${updated.limit}`);
      saveToLocalStorageState(expenses, nextCategories, reminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Update Category", `Updated budget limit for "${updated.name}" to $${updated.limit}`);
    }
  };

  // Actions: Reminder Operations
  const addReminder = async (remInput: Omit<PaymentReminder, "id">) => {
    const newRem: PaymentReminder = {
      ...remInput,
      id: "rem_" + generateId()
    };

    const nextReminders = [...reminders, newRem];
    setReminders(nextReminders);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "reminders", newRem.id), cleanData(newRem));
    } else {
      const logs = await addLog("Add Reminder", `Scheduled monthly reminder: "${newRem.title}" ($${newRem.amount.toFixed(2)}) due ${newRem.dueDate}`);
      saveToLocalStorageState(expenses, categories, nextReminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Add Reminder", `Scheduled monthly reminder: "${newRem.title}" ($${newRem.amount.toFixed(2)}) due ${newRem.dueDate}`);
    }
  };

  const toggleReminderPaid = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;

    const updated = { ...target, isPaid: !target.isPaid };
    const nextReminders = reminders.map((r) => r.id === id ? updated : r);
    setReminders(nextReminders);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "reminders", id), cleanData(updated));
    } else {
      const logs = await addLog("Toggle Reminder", `Marked reminder "${target.title}" as ${updated.isPaid ? "PAID" : "UNPAID"}`);
      saveToLocalStorageState(expenses, categories, nextReminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Toggle Reminder", `Marked reminder "${target.title}" as ${updated.isPaid ? "PAID" : "UNPAID"}`);
    }
  };

  const deleteReminder = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;

    const nextReminders = reminders.filter((r) => r.id !== id);
    setReminders(nextReminders);

    if (isFirebaseAvailable && db && houseId) {
      await deleteDoc(doc(db, "houses", houseId, "reminders", id));
    } else {
      const logs = await addLog("Delete Reminder", `Deleted payment reminder "${target.title}"`);
      saveToLocalStorageState(expenses, categories, nextReminders, goals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Delete Reminder", `Deleted payment reminder "${target.title}"`);
    }
  };

  // Actions: Goal Operations
  const addGoal = async (goalInput: Omit<Goal, "id" | "createdAt">) => {
    const newGoal: Goal = {
      ...goalInput,
      id: "goal_" + generateId(),
      createdAt: new Date().toISOString()
    };

    const nextGoals = [...goals, newGoal];
    setGoals(nextGoals);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "goals", newGoal.id), cleanData(newGoal));
    } else {
      const logs = await addLog("Add Goal", `Created savings target "${newGoal.title}" of $${newGoal.targetAmount}`);
      saveToLocalStorageState(expenses, categories, reminders, nextGoals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Add Goal", `Created savings target "${newGoal.title}" of $${newGoal.targetAmount}`);
    }
  };

  const updateGoalProgress = async (id: string, amount: number) => {
    const target = goals.find((g) => g.id === id);
    if (!target) return;

    const updated = { ...target, currentAmount: amount };
    const nextGoals = goals.map((g) => g.id === id ? updated : g);
    setGoals(nextGoals);

    if (isFirebaseAvailable && db && houseId) {
      await setDoc(doc(db, "houses", houseId, "goals", id), cleanData(updated));
    } else {
      const logs = await addLog("Update Goal", `Updated progress for "${target.title}" to $${amount} / $${target.targetAmount}`);
      saveToLocalStorageState(expenses, categories, reminders, nextGoals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Update Goal", `Updated progress for "${target.title}" to $${amount} / $${target.targetAmount}`);
    }
  };

  const deleteGoal = async (id: string) => {
    const target = goals.find((g) => g.id === id);
    if (!target) return;

    const nextGoals = goals.filter((g) => g.id !== id);
    setGoals(nextGoals);

    if (isFirebaseAvailable && db && houseId) {
      await deleteDoc(doc(db, "houses", houseId, "goals", id));
    } else {
      const logs = await addLog("Delete Goal", `Deleted savings goal "${target.title}"`);
      saveToLocalStorageState(expenses, categories, reminders, nextGoals, logs || activityLogs);
    }

    if (isFirebaseAvailable && db && houseId) {
      await addLog("Delete Goal", `Deleted savings goal "${target.title}"`);
    }
  };

  // OCR Receipt Scan Action
  const scanReceiptOCR = async (base64Image: string, mimeType: string = "image/jpeg"): Promise<{
    amount: number;
    merchant: string;
    category: string;
    date: string;
    items?: Array<{ name: string; price: number }>;
  }> => {
    setSyncStatus("syncing");
    try {
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image, mimeType })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server failed to scan receipt");
      }

      const parsed = await response.json();
      setSyncStatus("synced");
      addLog("Receipt OCR", `Scanned receipt from ${parsed.merchant || "Unknown"} for $${parsed.amount?.toFixed(2) || "0.00"}`);
      return parsed;
    } catch (err: any) {
      setSyncStatus("error");
      console.error("Receipt Scanning Error:", err);
      throw err;
    }
  };

  // Calculated stats for balance and split calculations
  const getSplitsSummary = () => {
    let totalSpent = 0;
    let spentByA = 0;
    let spentByB = 0;
    let shareA = 0;
    let shareB = 0;

    expenses.forEach((exp) => {
      totalSpent += exp.amount;
      if (exp.paidById === "user_a") {
        spentByA += exp.amount;
      } else {
        spentByB += exp.amount;
      }
      shareA += exp.splitDetails?.user_a || 0;
      shareB += exp.splitDetails?.user_b || 0;
    });

    const netBalance = spentByA - shareA;

    return {
      totalSpent,
      spentByA,
      spentByB,
      shareA,
      shareB,
      netBalance, // Positive: B owes A. Negative: A owes B.
      whoOwesWho: netBalance > 0 ? `${partnerB.name} owes ${partnerA.name}` : netBalance < 0 ? `${partnerA.name} owes ${partnerB.name}` : "You are completely even!",
      oweAmount: Math.abs(netBalance)
    };
  };

  // Settlement Log Action: Creates an expense that offsets the balance exactly
  const settleUp = async () => {
    const summary = getSplitsSummary();
    if (Math.round(summary.oweAmount * 100) === 0) return;

    const payerId = summary.netBalance > 0 ? "user_b" : "user_a";
    const receiverId = payerId === "user_a" ? "user_b" : "user_a";
    const payerName = payerId === "user_a" ? partnerA.name : partnerB.name;
    const receiverName = receiverId === "user_a" ? partnerA.name : partnerB.name;

    await addExpense({
      title: `Debt Settlement: ${payerName} paid ${receiverName}`,
      amount: summary.oweAmount,
      category: "Miscellaneous",
      date: new Date().toISOString().split("T")[0],
      paidById: payerId,
      splitType: "custom",
      splitDetails: {
        user_a: payerId === "user_a" ? summary.oweAmount : 0,
        user_b: payerId === "user_b" ? summary.oweAmount : 0
      }
    });

    addLog("Settled Balance", `Settled accounts! ${payerName} paid ${receiverName} $${summary.oweAmount.toFixed(2)}`);
  };

  return {
    currentUser,
    partnerA,
    partnerB,
    houseName,
    joinPassword,
    partnerA_uid,
    partnerB_uid,
    expenses,
    categories,
    reminders,
    goals,
    activityLogs,
    isBiometricEnabled,
    setIsBiometricEnabled,
    isBiometricLocked,
    setIsBiometricLocked,
    isDarkMode,
    setIsDarkMode,
    syncStatus,
    isOnlineState,
    switchUser,
    updatePartners,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    addReminder,
    toggleReminderPaid,
    deleteReminder,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    scanReceiptOCR,
    getSplitsSummary,
    settleUp,
    addLog
  };
}
