export interface Person {
  id: "user_a" | "user_b";
  name: string;
  avatar: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paidById: "user_a" | "user_b"; // Who paid
  splitType: "equal" | "custom" | "percentage";
  splitDetails: {
    user_a: number; // Share for A
    user_b: number; // Share for B
  };
  receiptImg?: string;
  scannedItems?: Array<{ name: string; price: number }>;
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  icon: string; // Lucide icon name
  limit: number; // Monthly limit
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  frequency: "monthly" | "weekly" | "one-time";
  assignedTo: "user_a" | "user_b" | "both";
  isPaid: boolean;
  category: string;
}

export interface ActivityLog {
  id: string;
  userId: "user_a" | "user_b";
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  houseId: string | null;
  roleInHouse: "user_a" | "user_b" | null;
}

export interface House {
  id: string;
  name: string;
  joinPassword?: string; // secure keyword/password to join
  createdAt: string;
  creatorUid: string;
  partnerA_uid: string | null;
  partnerB_uid: string | null;
  partnerA: Person;
  partnerB: Person;
}
