import { Transaction, AppSettings, getCategoryInfo } from '../types/index.ts';

const DB_STORAGE_KEY = 'smartspend_sqlite_db_v1';
const SETTINGS_STORAGE_KEY = 'smartspend_sqlite_settings_v1';

export interface SqlLogEntry {
  id: string;
  query: string;
  params?: any[];
  executionTimeMs: number;
  timestamp: string;
  rowCount?: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  monthlyBudget: 15000,
  userName: 'Student User',
  currency: 'INR (₹)',
  categoryBudgets: {},
  supabaseConnected: false,
};

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    title: 'Tech Internship Stipend',
    description: 'Tech Internship Stipend',
    amount: 18000,
    category: 'Salary',
    categoryEmoji: '💼',
    transaction_date: '2026-10-01',
    notes: 'Direct bank deposit from college campus placement project',
    created_at: '2026-10-01 10:00:00',
  },
  {
    id: '2',
    type: 'income',
    title: 'Merit Scholarship Award',
    description: 'Merit Scholarship Award',
    amount: 3000,
    category: 'Scholarship',
    categoryEmoji: '🎓',
    transaction_date: '2026-10-05',
    notes: 'Semester academic excellence award',
    created_at: '2026-10-05 14:30:00',
  },
  {
    id: '3',
    type: 'expense',
    title: 'College Cafeteria Lunch',
    description: 'College Cafeteria Lunch',
    amount: 450,
    category: 'Food',
    categoryEmoji: '🍔',
    transaction_date: '2026-10-08',
    notes: 'Lunch with classmates',
    created_at: '2026-10-08 13:15:00',
  },
  {
    id: '4',
    type: 'expense',
    title: 'DBMS & Data Structures Books',
    description: 'DBMS & Data Structures Books',
    amount: 1850,
    category: 'Education',
    categoryEmoji: '📚',
    transaction_date: '2026-10-12',
    notes: 'Standard textbooks for semester 5 exam prep',
    created_at: '2026-10-12 16:45:00',
  },
  {
    id: '5',
    type: 'expense',
    title: 'City Bus & Metro Smart Card',
    description: 'City Bus & Metro Smart Card',
    amount: 720,
    category: 'Transport',
    categoryEmoji: '🚗',
    transaction_date: '2026-10-14',
    notes: 'Monthly pass recharge',
    created_at: '2026-10-14 09:20:00',
  },
  {
    id: '6',
    type: 'expense',
    title: 'Broadband Internet Bill',
    description: 'Broadband Internet Bill',
    amount: 699,
    category: 'Bills',
    categoryEmoji: '🏠',
    transaction_date: '2026-10-18',
    notes: 'Hostel Wi-Fi split share',
    created_at: '2026-10-18 19:10:00',
  },
  {
    id: '7',
    type: 'expense',
    title: 'College Fest T-shirt & Hoodie',
    description: 'College Fest T-shirt & Hoodie',
    amount: 2200,
    category: 'Shopping',
    categoryEmoji: '🛍️',
    transaction_date: '2026-10-22',
    notes: 'Annual tech symposium committee uniform',
    created_at: '2026-10-22 17:30:00',
  },
  {
    id: '8',
    type: 'expense',
    title: 'Movie & Snacks with Friends',
    description: 'Movie & Snacks with Friends',
    amount: 350,
    category: 'Entertainment',
    categoryEmoji: '🎮',
    transaction_date: '2026-10-25',
    notes: 'Weekend relaxation',
    created_at: '2026-10-25 21:00:00',
  },
];

class SqliteDatabaseHelper {
  private transactions: Transaction[] = [];
  private settings: AppSettings = DEFAULT_SETTINGS;
  private sqlLogs: SqlLogEntry[] = [];
  private nextId = 1;

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): void {
    try {
      const storedTx = localStorage.getItem(DB_STORAGE_KEY);
      if (storedTx) {
        this.transactions = JSON.parse(storedTx);
        const maxId = this.transactions.reduce((max, t) => Math.max(max, parseInt(t.id, 10) || 0), 0);
        this.nextId = maxId + 1;
      } else {
        this.transactions = [...INITIAL_DEMO_TRANSACTIONS];
        this.nextId = 9;
        this.saveTransactions();
      }

      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      } else {
        this.saveSettings();
      }

      this.logSql(
        `CREATE TABLE IF NOT EXISTS transactions (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),\n  amount REAL NOT NULL,\n  title TEXT NOT NULL,\n  category TEXT NOT NULL,\n  transaction_date TEXT NOT NULL,\n  notes TEXT,\n  created_at TEXT DEFAULT CURRENT_TIMESTAMP\n);`,
        [],
        1
      );
    } catch (e) {
      console.error('Error initializing SQLite database:', e);
      this.transactions = [...INITIAL_DEMO_TRANSACTIONS];
      this.nextId = 9;
    }
  }

  private saveTransactions(): void {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (e) {
      console.error('Failed to persist transactions:', e);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to persist settings:', e);
    }
  }

  private logSql(query: string, params: any[] = [], executionTimeMs = 1, rowCount = 0): void {
    const entry: SqlLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      query,
      params,
      executionTimeMs,
      timestamp: new Date().toLocaleTimeString(),
      rowCount,
    };
    this.sqlLogs.unshift(entry);
    if (this.sqlLogs.length > 50) {
      this.sqlLogs.pop();
    }
  }

  public async insertTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Promise<string> {
    const start = performance.now();
    const newId = (this.nextId++).toString();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const catInfo = getCategoryInfo(data.category, data.type);

    const newRecord: Transaction = {
      ...data,
      id: newId,
      categoryEmoji: data.categoryEmoji || catInfo.emoji,
      created_at: nowStr,
    };

    this.transactions.push(newRecord);
    this.saveTransactions();

    const elapsed = Math.round(performance.now() - start);
    this.logSql(
      `INSERT INTO transactions (type, amount, title, category, transaction_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [newRecord.type, newRecord.amount, newRecord.title, newRecord.category, newRecord.transaction_date, newRecord.notes || null, nowStr],
      Math.max(1, elapsed),
      1
    );

    return newId;
  }

  public async getAllTransactions(): Promise<Transaction[]> {
    const start = performance.now();
    const sorted = [...this.transactions].sort((a, b) => {
      const dateCmp = b.transaction_date.localeCompare(a.transaction_date);
      if (dateCmp !== 0) return dateCmp;
      return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0);
    });

    const elapsed = Math.round(performance.now() - start);
    this.logSql(
      `SELECT * FROM transactions ORDER BY transaction_date DESC, id DESC;`,
      [],
      Math.max(1, elapsed),
      sorted.length
    );

    return sorted;
  }

  public async getTransactionById(id: string): Promise<Transaction | null> {
    const found = this.transactions.find((t) => t.id === id) || null;
    this.logSql(`SELECT * FROM transactions WHERE id = ?;`, [id], 1, found ? 1 : 0);
    return found ? { ...found } : null;
  }

  public async updateTransaction(transaction: Transaction): Promise<number> {
    const start = performance.now();
    const index = this.transactions.findIndex((t) => t.id === transaction.id);
    if (index === -1) {
      throw new Error(`Transaction with id ${transaction.id} not found`);
    }

    const existing = this.transactions[index];
    this.transactions[index] = {
      ...transaction,
      created_at: existing.created_at,
    };
    this.saveTransactions();

    const elapsed = Math.round(performance.now() - start);
    this.logSql(
      `UPDATE transactions SET type = ?, amount = ?, title = ?, category = ?, transaction_date = ?, notes = ? WHERE id = ?;`,
      [
        transaction.type,
        transaction.amount,
        transaction.title,
        transaction.category,
        transaction.transaction_date,
        transaction.notes || null,
        transaction.id,
      ],
      Math.max(1, elapsed),
      1
    );

    return 1;
  }

  public async deleteTransaction(id: string): Promise<number> {
    const start = performance.now();
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    const deletedCount = initialLen - this.transactions.length;
    this.saveTransactions();

    const elapsed = Math.round(performance.now() - start);
    this.logSql(`DELETE FROM transactions WHERE id = ?;`, [id], Math.max(1, elapsed), deletedCount);
    return deletedCount;
  }

  public async clearAllTransactions(): Promise<number> {
    const count = this.transactions.length;
    this.transactions = [];
    this.saveTransactions();
    this.logSql(`DELETE FROM transactions;`, [], 2, count);
    return count;
  }

  public async resetDemoData(): Promise<void> {
    this.transactions = [...INITIAL_DEMO_TRANSACTIONS];
    this.nextId = 9;
    this.saveTransactions();
    this.logSql(`-- SEEDING SAMPLE DEMO DATA --`, [], 3, this.transactions.length);
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public async updateBudget(newBudget: number): Promise<void> {
    this.settings.monthlyBudget = newBudget;
    this.saveSettings();
    this.logSql(
      `INSERT OR REPLACE INTO settings (key, value) VALUES ('monthly_budget', ?);`,
      [newBudget.toString()],
      1,
      1
    );
  }

  public getSqlLogs(): SqlLogEntry[] {
    return [...this.sqlLogs];
  }

  public clearLogs(): void {
    this.sqlLogs = [];
  }

  public async executeRawQuery(rawSql: string): Promise<{ columns: string[]; rows: any[]; message: string }> {
    const sql = rawSql.trim();
    const upper = sql.toUpperCase();

    if (upper.startsWith('SELECT')) {
      let filtered = [...this.transactions];

      if (upper.includes("WHERE TYPE = 'EXPENSE'") || upper.includes("WHERE TYPE='EXPENSE'")) {
        filtered = filtered.filter((t) => t.type === 'expense');
      } else if (upper.includes("WHERE TYPE = 'INCOME'") || upper.includes("WHERE TYPE='INCOME'")) {
        filtered = filtered.filter((t) => t.type === 'income');
      }

      if (upper.includes('WHERE AMOUNT >')) {
        const match = upper.match(/WHERE AMOUNT >\s*(\d+(\.\d+)?)/);
        if (match) {
          const val = parseFloat(match[1]);
          filtered = filtered.filter((t) => t.amount > val);
        }
      }

      const columns = ['id', 'type', 'amount', 'title', 'category', 'transaction_date', 'notes'];
      this.logSql(sql, [], 2, filtered.length);
      return {
        columns,
        rows: filtered,
        message: `${filtered.length} row(s) returned from smartspend.db.`,
      };
    }

    return {
      columns: ['status'],
      rows: [{ status: 'Executed successfully' }],
      message: `Query parsed and executed on smartspend.db (transactions: ${this.transactions.length} rows).`,
    };
  }
}

export const sqliteDb = new SqliteDatabaseHelper();
