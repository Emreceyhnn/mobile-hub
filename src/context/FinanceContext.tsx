import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '../components/ui/Toast'
import {
  getFinanceData,
  saveFinanceData,
  Transaction,
  Bill,
  SavingsGoal,
  Debt,
  FinanceData
} from '../services/financeFirestore'

interface FinanceContextType extends FinanceData {
  loading: boolean;
  error: string | null;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id'>) => Promise<void>;
  toggleBillPaid: (id: string) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
  updateSavingsAmount: (id: string, amount: number) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'paid'>) => Promise<void>;
  toggleDebtPaid: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const showToast = useToast()
  const [data, setData] = useState<FinanceData>({
    transactions: [],
    bills: [],
    savings: [],
    debts: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCacheKey = useCallback(() => {
    return user ? `fintrack_cache_data_${user.uid}` : 'fintrack_local_data'
  }, [user])

  // Load finance data (Optimistic UI & Local Cache sync)
  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const cacheKey = getCacheKey()
    
    // 1. Optimistic Load from LocalStorage Cache
    const cached = localStorage.getItem(cacheKey)
    let hasCache = false
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setData(parsed)
        hasCache = true
      } catch {
        // ignore parsing errors
      }
    }

    // 2. Demo User Fallback
    if (user.uid === 'demo_user_123') {
      if (!hasCache) {
        const dummy: FinanceData = {
          transactions: [
            { id: '1', type: 'income', amount: 45000, category: 'Maaş', description: 'Aylık net maaş ödemesi', date: '2026-05-15', time: '09:00', createdAt: new Date().toISOString() },
            { id: '2', type: 'expense', amount: 3500, category: 'Market', description: 'Haftalık mutfak alışverişi', date: '2026-05-20', time: '18:30', createdAt: new Date().toISOString() },
            { id: '3', type: 'expense', amount: 1200, category: 'Fatura', description: 'Elektrik faturası', date: '2026-05-22', time: '14:15', createdAt: new Date().toISOString() },
            { id: '4', type: 'expense', amount: 800, category: 'Yemek', description: 'Dışarıda akşam yemeği', date: '2026-05-23', time: '20:00', createdAt: new Date().toISOString() },
            { id: '5', type: 'income', amount: 2500, category: 'Yatırım', description: 'Hisse senedi temettü geliri', date: '2026-05-24', time: '11:00', createdAt: new Date().toISOString() }
          ],
          bills: [
            { id: '1', name: 'Elektrik Faturası', amount: 1200, dueDate: '2026-05-28', paid: true, category: 'Elektrik' },
            { id: '2', name: 'İnternet Faturası', amount: 450, dueDate: '2026-06-05', paid: false, category: 'İnternet' },
            { id: '3', name: 'Kira Ödemesi', amount: 15000, dueDate: '2026-06-01', paid: false, category: 'Kira' }
          ],
          savings: [
            { id: '1', title: 'Acil Durum Fonu', targetAmount: 50000, currentAmount: 15000, category: 'Birikim' },
            { id: '2', title: 'Yeni Laptop Alımı', targetAmount: 60000, currentAmount: 40000, category: 'Teknoloji' }
          ],
          debts: [
            { id: '1', person: 'Ahmet Yılmaz', amount: 5000, type: 'borrowed', dueDate: '2026-06-15', paid: false, description: 'Borç alınan miktar' },
            { id: '2', person: 'Mehmet Kaya', amount: 2000, type: 'lent', dueDate: '2026-05-30', paid: false, description: 'Borç verilen miktar' }
          ]
        }
        setData(dummy)
        localStorage.setItem(cacheKey, JSON.stringify(dummy))
      }
      setLoading(false)
      return
    }

    // 3. Network Fetch from Firestore
    try {
      const fbData = await getFinanceData(user.uid)
      setData(fbData)
      localStorage.setItem(cacheKey, JSON.stringify(fbData))
    } catch (e: unknown) {
      console.error("Firestore loading error:", e)
      if (hasCache) {
        showToast('Verileriniz yerel hafızadan yüklendi (Çevrimdışı mod). 📶', 'info')
      } else {
        setError('Veriler yüklenirken hata oluştu. Lütfen bağlantınızı kontrol edin.')
      }
    } finally {
      setLoading(false)
    }
  }, [user, getCacheKey, showToast])

  useEffect(() => {
    loadData()
  }, [user, loadData])

  // Helper to persist data updates
  const updateData = async (updater: (prev: FinanceData) => FinanceData) => {
    if (!user) return
    const nextData = updater(data)
    setData(nextData)

    const cacheKey = getCacheKey()
    localStorage.setItem(cacheKey, JSON.stringify(nextData))

    if (user.uid === 'demo_user_123') {
      return
    }

    try {
      await saveFinanceData(user.uid, nextData)
    } catch (err) {
      console.error("Firestore sync failed:", err)
      showToast('Değişiklikler yerel olarak kaydedildi. İnternet bağlandığında eşitlenecek.', 'info')
    }
  }

  // --- Actions ---

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    await updateData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }))
  }

  const deleteTransaction = async (id: string) => {
    await updateData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }))
  }

  const addBill = async (bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString()
    }
    await updateData(prev => ({
      ...prev,
      bills: [...prev.bills, newBill]
    }))
  }

  const toggleBillPaid = async (id: string) => {
    const billToUpdate = data.bills.find(b => b.id === id)
    if (!billToUpdate) return

    const isNowPaid = !billToUpdate.paid

    await updateData(prev => {
      let nextTx = [...prev.transactions]
      if (isNowPaid) {
        // Auto-add an expense transaction when a bill is paid
        const newTx: Transaction = {
          id: `bill-tx-${id}-${Date.now()}`,
          type: 'expense',
          amount: billToUpdate.amount,
          category: 'Fatura',
          description: `Fatura Ödemesi: ${billToUpdate.name}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          createdAt: new Date().toISOString()
        }
        nextTx = [newTx, ...nextTx]
      } else {
        // Auto-remove the associated transaction when marked unpaid
        nextTx = nextTx.filter(t => !t.id.startsWith(`bill-tx-${id}`))
      }

      return {
        ...prev,
        bills: prev.bills.map(b => b.id === id ? { ...b, paid: isNowPaid } : b),
        transactions: nextTx
      }
    })
  }

  const deleteBill = async (id: string) => {
    await updateData(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id),
      // Clean up any temporary transaction if they deleted the bill
      transactions: prev.transactions.filter(t => !t.id.startsWith(`bill-tx-${id}`))
    }))
  }

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      currentAmount: 0
    }
    await updateData(prev => ({
      ...prev,
      savings: [...prev.savings, newGoal]
    }))
  }

  const updateSavingsAmount = async (id: string, amount: number) => {
    const goal = data.savings.find(s => s.id === id)
    if (!goal) return

    await updateData(prev => {
      // Auto-add transaction history entry for savings
      const newTx: Transaction = {
        id: `savings-tx-${id}-${Date.now()}`,
        type: amount > 0 ? 'expense' : 'income', // savings deposit acts as a cash expense out of wallet, withdraw is income
        amount: Math.abs(amount),
        category: 'Birikim',
        description: amount > 0 
          ? `Birikime Eklendi: ${goal.title}`
          : `Birikimden Çekildi: ${goal.title}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        createdAt: new Date().toISOString()
      }

      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        savings: prev.savings.map(s => {
          if (s.id === id) {
            const next = Math.max(0, s.currentAmount + amount)
            return { ...s, currentAmount: next }
          }
          return s
        })
      }
    })
  }

  const deleteSavingsGoal = async (id: string) => {
    await updateData(prev => ({
      ...prev,
      savings: prev.savings.filter(s => s.id !== id)
    }))
  }

  const addDebt = async (debt: Omit<Debt, 'id' | 'paid'>) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString(),
      paid: false
    }
    await updateData(prev => ({
      ...prev,
      debts: [...prev.debts, newDebt]
    }))
  }

  const toggleDebtPaid = async (id: string) => {
    const debtToUpdate = data.debts.find(d => d.id === id)
    if (!debtToUpdate) return

    const isNowPaid = !debtToUpdate.paid

    await updateData(prev => {
      let nextTx = [...prev.transactions]
      if (isNowPaid) {
        // Auto-log a transaction when debt is settled
        // Borrowed settled -> payment (expense), Lent settled -> receive cash (income)
        const isBorrowed = debtToUpdate.type === 'borrowed'
        const newTx: Transaction = {
          id: `debt-tx-${id}-${Date.now()}`,
          type: isBorrowed ? 'expense' : 'income',
          amount: debtToUpdate.amount,
          category: 'Borç',
          description: isBorrowed 
            ? `Borç Kapatıldı (${debtToUpdate.person})`
            : `Alacak Tahsil Edildi (${debtToUpdate.person})`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          createdAt: new Date().toISOString()
        }
        nextTx = [newTx, ...nextTx]
      } else {
        nextTx = nextTx.filter(t => !t.id.startsWith(`debt-tx-${id}`))
      }

      return {
        ...prev,
        debts: prev.debts.map(d => d.id === id ? { ...d, paid: isNowPaid } : d),
        transactions: nextTx
      }
    })
  }

  const deleteDebt = async (id: string) => {
    await updateData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id),
      transactions: prev.transactions.filter(t => !t.id.startsWith(`debt-tx-${id}`))
    }))
  }

  return (
    <FinanceContext.Provider value={{
      ...data,
      loading,
      error,
      addTransaction,
      deleteTransaction,
      addBill,
      toggleBillPaid,
      deleteBill,
      addSavingsGoal,
      updateSavingsAmount,
      deleteSavingsGoal,
      addDebt,
      toggleDebtPaid,
      deleteDebt,
      refresh: loadData
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be inside FinanceProvider')
  return ctx
}
