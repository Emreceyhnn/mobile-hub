import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { db } from './firebase'

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  createdAt: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  category: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  type: 'borrowed' | 'lent';
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  description: string;
}

export interface FinanceData {
  transactions: Transaction[];
  bills: Bill[];
  savings: SavingsGoal[];
  debts: Debt[];
}

export async function getFinanceData(uid: string): Promise<FinanceData> {
  const ref = doc(db, 'finance', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return {
      transactions: [],
      bills: [],
      savings: [],
      debts: []
    }
  }
  const data = snap.data()
  return {
    transactions: data.transactions || [],
    bills: data.bills || [],
    savings: data.savings || [],
    debts: data.debts || []
  }
}

export async function saveFinanceData(uid: string, data: Partial<FinanceData>): Promise<void> {
  const ref = doc(db, 'finance', uid)
  await setDoc(ref, data, { merge: true })
}
