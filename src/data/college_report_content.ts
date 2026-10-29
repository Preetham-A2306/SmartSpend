export interface VivaQuestion {
  id: number;
  category: 'Flutter Basics' | 'State & Lifecycle' | 'SQLite & Database' | 'Dart & Async' | 'Project Specifics';
  question: string;
  answer: string;
  examinerTip: string;
}

export interface TestCaseSpec {
  id: string;
  title: string;
  description: string;
  category: 'CRUD' | 'Validation' | 'Edge Case' | 'Persistence';
  expectedResult: string;
}

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: 'Flutter Basics',
    question: 'What is Flutter and what is its rendering architecture?',
    answer:
      'Flutter is Google’s open-source UI software development kit. Unlike React Native which uses a JavaScript bridge to native OEM widgets, Flutter uses its own high-performance rendering engine (Impeller / Skia) to draw every widget directly on the canvas at up to 60/120 FPS, ensuring identical look and feel across platforms.',
    examinerTip: 'Mention that Flutter does not rely on native OEM Android buttons or iOS UIView wrappers—it paints directly to the screen.',
  },
  {
    id: 2,
    category: 'Flutter Basics',
    question: 'What is the difference between a StatelessWidget and a StatefulWidget?',
    answer:
      'A StatelessWidget is immutable; its properties cannot change once built (e.g., SummaryCard, icons, static labels). A StatefulWidget maintains a mutable State object that persists across widget rebuilds; when setState() is called, Flutter triggers a dirty mark on the element and schedules build() to re-render the changed UI with new data (e.g., DashboardScreen, TransactionFormScreen).',
    examinerTip: 'Examiners often ask: "Why is the State class separate from the StatefulWidget class?" Answer: For performance. The widget configuration is lightweight and frequently recreated, while the State object persists in the element tree.',
  },
  {
    id: 3,
    category: 'SQLite & Database',
    question: 'Why did you choose SQLite over SharedPreferences or Firebase for SmartSpend?',
    answer:
      '1. Relational querying: SQLite supports relational tables, parameterized queries, aggregate calculations (SUM, COUNT, GROUP BY), and date filtering, which SharedPreferences (simple key-value pairs) cannot perform efficiently.\n2. 100% Offline & Private: Unlike Firebase Firestore which requires continuous network connectivity and API keys, SQLite is embedded locally on the Android device file system, ensuring zero latency, zero cloud costs, and complete privacy.\n3. ACID Compliance: SQLite guarantees Atomicity, Consistency, Isolation, and Durability.',
    examinerTip: 'Highlight the SQL query example: `SELECT SUM(amount) FROM transactions WHERE type="expense"` vs iterating thousands of JSON keys.',
  },
  {
    id: 4,
    category: 'SQLite & Database',
    question: 'Explain the four CRUD operations implemented in SmartSpend.',
    answer:
      '• CREATE: DatabaseHelper.insertTransaction(model.toMap()) inserts an income or expense record into the "transactions" table, returning the autoincrement ID.\n• READ: DatabaseHelper.getAllTransactions() executes query() ordered by transaction_date DESC; getFinancialOverview() aggregates SUM(amount).\n• UPDATE: DatabaseHelper.updateTransaction(model) updates row fields where id = ? preserving the existing primary key.\n• DELETE: DatabaseHelper.deleteTransaction(id) removes the row where id = ? following user confirmation in an AlertDialog.',
    examinerTip: 'Emphasize that parameterized `whereArgs: [id]` is strictly used to prevent SQL Injection attacks.',
  },
  {
    id: 5,
    category: 'SQLite & Database',
    question: 'Where is the smartspend.db file physically stored on an Android device?',
    answer:
      'In Android internal app storage under `/data/data/<package_name>/databases/smartspend.db`. It is private to the application process and cannot be accessed by other installed apps or normal file browsers without root privileges.',
    examinerTip: 'Mention `getDatabasesPath()` from the `sqflite` package provides the platform-agnostic directory.',
  },
  {
    id: 6,
    category: 'SQLite & Database',
    question: 'What is the purpose of database versioning and onUpgrade in DatabaseHelper?',
    answer:
      'When an app updates its schema (e.g., adding a new column or table), changing dbVersion from 1 to 2 triggers onUpgrade(db, oldVersion, newVersion). This enables ALTER TABLE migrations without dropping the existing database, preventing user data loss on app updates.',
    examinerTip: 'State clearly that we never drop the table on app startup or upgrade.',
  },
  {
    id: 7,
    category: 'Dart & Async',
    question: 'Why are SQLite operations asynchronous (Future and async/await)?',
    answer:
      'Disk I/O operations take unpredictable time compared to CPU execution. If SQLite queries were synchronous, they would block the main UI thread (Dart event loop), causing screen jank and frozen frames. Using `Future` and `async/await` offloads database I/O to background worker threads, allowing the UI to remain smooth at 60 FPS while showing progress indicators.',
    examinerTip: 'Mention the Dart event loop: microtask queue and event queue.',
  },
  {
    id: 8,
    category: 'State & Lifecycle',
    question: 'Why do we need to call dispose() on TextEditingControllers in TransactionFormScreen?',
    answer:
      'TextEditingControllers attach listeners to the platform text input channel. If not explicitly disposed in the State’s `dispose()` lifecycle callback, they remain in memory and cause memory leaks when the user leaves the screen.',
    examinerTip: 'Always cite `_amountController.dispose()` in `dispose()`.',
  },
  {
    id: 9,
    category: 'Project Specifics',
    question: 'How does SmartSpend calculate balance and handle negative balances?',
    answer:
      'Total Income is calculated using `SELECT SUM(amount) WHERE type="income"`. Total Expense is calculated using `SELECT SUM(amount) WHERE type="expense"`. Balance = Total Income - Total Expense. If total expenses exceed total income, the balance becomes negative; the UI detects this and renders the text in red (#DC2626) with an alert badge, preventing erroneous positive balance displays.',
    examinerTip: 'Mention that income is never mistakenly summed as an expense.',
  },
  {
    id: 10,
    category: 'Project Specifics',
    question: 'How is the monthly budget warning triggered in SmartSpend?',
    answer:
      'SmartSpend retrieves the current calendar month’s total expenses using SQL pattern matching `transaction_date LIKE "YYYY-MM%"`. If `thisMonthExpenses > monthlyBudget`, the app displays a Material 3 warning alert banner and turns the progress indicator red.',
    examinerTip: 'Explain that the budget is stored in the `settings` SQLite table and persists across app restarts.',
  },
  {
    id: 11,
    category: 'Flutter Basics',
    question: 'What is Material Design 3 (M3) and how did you enable it?',
    answer:
      'Material Design 3 is Google’s latest design system featuring dynamic color schemes, expressive typography, rounded cards (16-24px radius), pill-shaped segmented buttons, and modern elevation tints. We enabled it using `ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(seedColor: Color(0xFF4F46E5)))`.',
    examinerTip: 'Show how `useMaterial3: true` is set in `main.dart`.',
  },
  {
    id: 12,
    category: 'SQLite & Database',
    question: 'Why did you use the Singleton pattern for DatabaseHelper?',
    answer:
      'The Singleton pattern ensures that only one instance of `DatabaseHelper` and one open connection to `smartspend.db` exists throughout the app lifecycle. This prevents SQLite database lock errors (`database is locked`), race conditions, and duplicate open connection overhead.',
    examinerTip: 'Point to `static final DatabaseHelper instance = DatabaseHelper._init();` in the code.',
  },
];

export const TEST_CASES_SPEC: TestCaseSpec[] = [
  {
    id: 'TC-01',
    title: 'Insert Valid Expense Record',
    category: 'CRUD',
    description: 'Insert ₹450 expense for "Food" category on 2026-10-28 with valid description.',
    expectedResult: 'Record saved to SQLite, assigned auto-increment ID, dashboard total expenses increases by ₹450.',
  },
  {
    id: 'TC-02',
    title: 'Insert Valid Income Record',
    category: 'CRUD',
    description: 'Insert ₹18,000 income for "Salary" category.',
    expectedResult: 'Record saved to SQLite, dashboard total income increases, balance increases.',
  },
  {
    id: 'TC-03',
    title: 'Read & Sort Transactions',
    category: 'CRUD',
    description: 'Fetch transactions list from smartspend.db.',
    expectedResult: 'Records displayed in reverse chronological order (newest date first).',
  },
  {
    id: 'TC-04',
    title: 'Update Existing Record',
    category: 'CRUD',
    description: 'Edit transaction amount from ₹450 to ₹500 and description.',
    expectedResult: 'Record updated in SQLite preserving original ID and created_at timestamp. Totals recalculate.',
  },
  {
    id: 'TC-05',
    title: 'Delete with Confirmation',
    category: 'CRUD',
    description: 'User taps delete icon; confirms deletion in AlertDialog.',
    expectedResult: 'Single row deleted from SQLite. Removed immediately from UI and financial summaries.',
  },
  {
    id: 'TC-06',
    title: 'Validation: Zero or Negative Amount',
    category: 'Validation',
    description: 'Attempt to submit form with amount = 0 or -10.',
    expectedResult: 'Form submission blocked with "Amount must be greater than ₹0.00" field error.',
  },
  {
    id: 'TC-07',
    title: 'Validation: Empty Description',
    category: 'Validation',
    description: 'Attempt to submit form with blank whitespace description.',
    expectedResult: 'Form submission blocked with "Description cannot be empty" error.',
  },
  {
    id: 'TC-08',
    title: 'Budget Alert Threshold',
    category: 'Edge Case',
    description: 'Monthly expenses exceed monthly budget of ₹15,000.',
    expectedResult: 'Warning alert banner renders in red; progress indicator turns red.',
  },
  {
    id: 'TC-09',
    title: 'Zero Transactions & Restart Persistence',
    category: 'Persistence',
    description: 'Clear all records; restart app; verify persistence and graceful empty state.',
    expectedResult: 'Empty state displays friendly message; balance shows ₹0.00 without runtime errors.',
  },
];

export const COLLEGE_REPORT_DOCUMENT = {
  projectTitle: 'SmartSpend – Personal Expense Tracker',
  academicYear: '2026 – 2027',
  course: 'B.Tech in Computer Science & Engineering (Mini-Project)',
  abstract: `Managing personal finances is a critical skill for college students and working professionals. SmartSpend is a fully offline, high-performance personal expense tracking mobile application developed in Flutter (Dart) with local SQLite database persistence. The application enables users to perform full CRUD operations on income and expense transactions, organize finances by categorized tags, set and monitor monthly spending limits, and visualize monthly expense distributions via graphical breakdowns. SmartSpend guarantees 100% data privacy by keeping all financial data locally on the Android device without requiring internet access, remote cloud servers, or third-party analytical APIs.`,
  objectives: [
    'Design and implement a native Android application using Google Flutter and Material Design 3.',
    'Implement persistent local relational storage using SQLite (via the sqflite package) conforming to ACID principles.',
    'Implement all four CRUD operations (Create, Read, Update, Delete) with parameterized queries to prevent SQL injection.',
    'Provide automated financial calculations for total balance, monthly expenditures, and category-wise spending.',
    'Incorporate budget management with dynamic threshold notifications when expenditures exceed user-defined limits.',
    'Ensure rigorous client-side input validation and graceful empty/error state handling.',
  ],
  literatureSurvey: `Existing personal expense trackers on mobile app stores predominantly rely on cloud-hosted backends (Firebase, Supabase, AWS DynamoDB). While cloud architectures offer multi-device sync, they present significant privacy risks, latency dependencies, and subscription costs for college students. Conversely, simple offline apps often rely on basic key-value stores (SharedPreferences), which lack indexing, aggregation functions (SUM, GROUP BY), and transaction safety. SmartSpend bridges this gap by embedding a relational SQLite database directly inside the Flutter sandbox, providing SQL performance with zero network dependency.`,
  systemArchitecture: `SmartSpend adopts a 3-tier Clean Architecture:
1. Presentation Layer (UI Widgets): Built with Flutter Material Design 3, comprising DashboardScreen, TransactionsScreen, TransactionFormScreen, ReportsScreen, and SettingsScreen. Uses StatefulWidgets for dynamic local state.
2. Business Logic / Repository Layer: Encapsulates domain rules (TransactionRepository, FinancialOverview, Category summaries) and decouples UI controllers from raw SQL statements.
3. Data Layer (SQLite Engine): Managed by DatabaseHelper (Singleton pattern) executing safe parameterized SQL queries against smartspend.db.`,
  databaseSchema: `DATABASE NAME: smartspend.db (SQLite v3.x)

TABLE 1: transactions
• id INTEGER PRIMARY KEY AUTOINCREMENT
• type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
• amount REAL NOT NULL
• description TEXT NOT NULL
• category TEXT NOT NULL
• transaction_date TEXT NOT NULL (ISO-8601: YYYY-MM-DD)
• notes TEXT (Optional)
• created_at TEXT DEFAULT CURRENT_TIMESTAMP

TABLE 2: settings
• key TEXT PRIMARY KEY
• value TEXT NOT NULL`,
  conclusion: `SmartSpend successfully fulfills all requirements of a B.Tech mini-project by demonstrating native mobile development, relational database integration, and software engineering principles. The application delivers responsive user interactions, persistent SQLite storage, dynamic category-wise aggregations, and strict input validation. Future enhancements can include biometric fingerprint authentication (local_auth), automated PDF report generation, and SMS-based automated expense detection.`,
};
