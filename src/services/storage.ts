import { Transaction, AppSettings, getCategoryInfo } from '../types/index.ts';

const TRANSACTIONS_KEY = 'smartspend_v2_transactions';
const SETTINGS_KEY = 'smartspend_v2_settings';

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    title: 'Internship Stipend',
    amount: 5000,
    category: 'Salary',
    categoryEmoji: '💼',
    transaction_date: '2026-10-01',
    notes: 'Monthly tech stipend direct deposit',
    created_at: '2026-10-01 10:00:00',
  },
  {
    id: 'tx-2',
    type: 'income',
    title: 'Gift Received',
    amount: 1000,
    category: 'Gift',
    categoryEmoji: '🎁',
    transaction_date: '2026-10-04',
    notes: 'Festive gift from grandparents',
    created_at: '2026-10-04 14:30:00',
  },
  {
    id: 'tx-3',
    type: 'expense',
    title: 'Lunch with College Friends',
    amount: 250,
    category: 'Food',
    categoryEmoji: '🍔',
    transaction_date: '2026-10-06',
    notes: 'College cafeteria meal & drinks',
    created_at: '2026-10-06 13:15:00',
  },
  {
    id: 'tx-4',
    type: 'expense',
    title: 'Semester Reference Books',
    amount: 600,
    category: 'Education',
    categoryEmoji: '📚',
    transaction_date: '2026-10-10',
    notes: 'Algorithms & Computer Networks notes',
    created_at: '2026-10-10 16:20:00',
  },
  {
    id: 'tx-5',
    type: 'expense',
    title: 'Petrol & Scooter Service',
    amount: 800,
    category: 'Transport',
    categoryEmoji: '🚗',
    transaction_date: '2026-10-14',
    notes: 'Fuel tank full for college commute',
    created_at: '2026-10-14 09:45:00',
  },
  {
    id: 'tx-6',
    type: 'expense',
    title: 'Weekend Clothing & Footwear Shopping',
    amount: 1200,
    category: 'Shopping',
    categoryEmoji: '🛍️',
    transaction_date: '2026-10-18',
    notes: 'Autumn hoodie & accessories',
    created_at: '2026-10-18 18:30:00',
  },
  {
    id: 'tx-7',
    type: 'income',
    title: 'Freelance Web Page Design',
    amount: 4500,
    category: 'Freelance',
    categoryEmoji: '🧑‍💻',
    transaction_date: '2026-10-21',
    notes: 'Client UI redesign milestone payment',
    created_at: '2026-10-21 20:00:00',
  },
  {
    id: 'tx-8',
    type: 'expense',
    title: 'Broadband Wifi & Electricity Bill',
    amount: 750,
    category: 'Bills',
    categoryEmoji: '🏠',
    transaction_date: '2026-10-23',
    notes: 'Hostel room split utility bills',
    created_at: '2026-10-23 11:10:00',
  },
  {
    id: 'tx-9',
    type: 'expense',
    title: 'Movie Tickets & Popcorn',
    amount: 399,
    category: 'Entertainment',
    categoryEmoji: '🎮',
    transaction_date: '2026-10-25',
    notes: 'Weekend movie outing',
    created_at: '2026-10-25 21:15:00',
  },
  {
    id: 'tx-10',
    type: 'expense',
    title: 'Health Checkup & Vitamins',
    amount: 450,
    category: 'Healthcare',
    categoryEmoji: '🏥',
    transaction_date: '2026-10-27',
    notes: 'Pharmacy prescription',
    created_at: '2026-10-27 10:30:00',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  monthlyBudget: 8000,
  userName: 'Priya',
  currency: 'INR (₹)',
  categoryBudgets: {
    Food: 2500,
    Transport: 1500,
    Shopping: 2000,
    Education: 1000,
    Entertainment: 800,
    Bills: 1200,
    Healthcare: 1000,
    Travel: 1500,
    Other: 500,
  },
  supabaseConnected: false,
};

export class StorageService {
  /**
   * Retrieves all transactions from localStorage.
   */
  public static getTransactions(): Transaction[] {
    try {
      const raw = localStorage.getItem(TRANSACTIONS_KEY);
      if (!raw) {
        this.saveTransactions(INITIAL_DEMO_TRANSACTIONS);
        return [...INITIAL_DEMO_TRANSACTIONS];
      }
      const parsed: any[] = JSON.parse(raw);
      // Ensure backwards compatibility with title vs description
      return parsed.map((item) => ({
        ...item,
        title: item.title || item.description || 'Transaction',
        categoryEmoji: item.categoryEmoji || getCategoryInfo(item.category, item.type).emoji,
      }));
    } catch (e) {
      console.error('Error reading transactions from storage:', e);
      return [...INITIAL_DEMO_TRANSACTIONS];
    }
  }

  /**
   * Saves transactions to localStorage.
   */
  public static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  }

  /**
   * Adds a new transaction.
   */
  public static addTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Transaction {
    const transactions = this.getTransactions();
    const info = getCategoryInfo(data.category, data.type);
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoryEmoji: data.categoryEmoji || info.emoji,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    transactions.unshift(newTx);
    this.saveTransactions(transactions);
    return newTx;
  }

  /**
   * Updates an existing transaction.
   */
  public static updateTransaction(tx: Transaction): Transaction {
    const transactions = this.getTransactions();
    const index = transactions.findIndex((t) => t.id === tx.id);
    if (index === -1) {
      throw new Error(`Transaction #${tx.id} not found.`);
    }

    const info = getCategoryInfo(tx.category, tx.type);
    const updated: Transaction = {
      ...transactions[index],
      ...tx,
      categoryEmoji: tx.categoryEmoji || info.emoji,
    };

    transactions[index] = updated;
    this.saveTransactions(transactions);
    return updated;
  }

  /**
   * Deletes a transaction by ID.
   */
  public static deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    if (filtered.length === transactions.length) return false;
    this.saveTransactions(filtered);
    return true;
  }

  /**
   * Clears all transactions.
   */
  public static clearAllTransactions(): void {
    this.saveTransactions([]);
  }

  /**
   * Resets data to initial demo transactions.
   */
  public static resetToDemoData(): void {
    this.saveTransactions([...INITIAL_DEMO_TRANSACTIONS]);
  }

  /**
   * Retrieves application settings.
   */
  public static getSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        this.saveSettings(DEFAULT_SETTINGS);
        return { ...DEFAULT_SETTINGS };
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Updates application settings.
   */
  public static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  /**
   * Exports transactions to CSV file for download.
   */
  public static exportToCsv(transactions: Transaction[]): void {
    const headers = ['ID', 'Type', 'Title', 'Amount (INR)', 'Category', 'Date', 'Notes', 'Created At'];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.type}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${t.category}"`,
      `"${t.transaction_date}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${t.created_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smartspend_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
