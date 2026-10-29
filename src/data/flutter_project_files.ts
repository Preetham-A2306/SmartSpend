/**
 * Complete Flutter & Dart source files for "SmartSpend – Personal Expense Tracker"
 * Ready for copy/pasting into VS Code, downloading as ZIP, or inspecting in the web studio.
 */

export interface FlutterFile {
  path: string;
  category: 'core' | 'model' | 'database' | 'repository' | 'screen' | 'widget' | 'util' | 'config';
  description: string;
  content: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    category: 'config',
    description: 'Project metadata, assets configuration, and compatible package dependencies',
    content: `name: smartspend
description: SmartSpend - Personal Expense Tracker Flutter SQLite College Mini-Project.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # Local SQLite database engine for Android/iOS
  sqflite: ^2.3.2

  # Cross-platform file path resolution for SQLite database files
  path: ^1.9.0

  # Date, time, and Indian currency (INR) formatting
  intl: ^0.19.0

  # Modern Material Design 3 and Cupertino icons
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    path: 'lib/main.dart',
    category: 'core',
    description: 'Application entry point, Material Design 3 theme configuration, and root navigation scaffold',
    content: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/dashboard_screen.dart';
import 'screens/transactions_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/transaction_form_screen.dart';

void main() async {
  // Ensure Flutter engine bindings are initialized prior to calling native SQLite
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style for transparent modern status bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const SmartSpendApp());
}

class SmartSpendApp extends StatelessWidget {
  const SmartSpendApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartSpend',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5), // Indigo Accent
          primary: const Color(0xFF4F46E5),
          secondary: const Color(0xFF06B6D4),
          surface: const Color(0xFFF8FAFC),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF1E293B),
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF0F172A),
          ),
        ),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
          color: Colors.white,
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(
          backgroundColor: const Color(0xFF4F46E5),
          foregroundColor: Colors.white,
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFFEEF2FF),
          elevation: 3,
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF4F46E5),
              );
            }
            return TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade600,
            );
          }),
        ),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  // Key to trigger refresh when returning from transaction form
  final GlobalKey<DashboardScreenState> _dashboardKey = GlobalKey<DashboardScreenState>();
  final GlobalKey<TransactionsScreenState> _transactionsKey = GlobalKey<TransactionsScreenState>();
  final GlobalKey<ReportsScreenState> _reportsKey = GlobalKey<ReportsScreenState>();

  void _onDestinationSelected(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _refreshAllScreens() {
    _dashboardKey.currentState?.loadData();
    _transactionsKey.currentState?.loadTransactions();
    _reportsKey.currentState?.loadReportData();
  }

  Future<void> _openAddTransactionScreen() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const TransactionFormScreen(),
      ),
    );

    if (result == true) {
      _refreshAllScreens();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Transaction saved successfully!'),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      DashboardScreen(
        key: _dashboardKey,
        onNavigateToTransactions: () => _onDestinationSelected(1),
        onNavigateToReports: () => _onDestinationSelected(2),
      ),
      TransactionsScreen(
        key: _transactionsKey,
        onDataChanged: _refreshAllScreens,
      ),
      ReportsScreen(key: _reportsKey),
      SettingsScreen(onDataReset: _refreshAllScreens),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      floatingActionButton: _currentIndex == 0 || _currentIndex == 1
          ? FloatingActionButton.extended(
              onPressed: _openAddTransactionScreen,
              icon: const Icon(Icons.add),
              label: const Text(
                'Add',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: _onDestinationSelected,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: Color(0xFF4F46E5)),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long, color: Color(0xFF4F46E5)),
            label: 'Transactions',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart, color: Color(0xFF4F46E5)),
            label: 'Reports',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: Color(0xFF4F46E5)),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/models/transaction_model.dart',
    category: 'model',
    description: 'Data model with serialization/deserialization for SQLite records (toMap & fromMap)',
    content: `class TransactionModel {
  final int? id;
  final String type; // 'income' or 'expense'
  final double amount;
  final String description;
  final String category;
  final String transactionDate; // ISO format 'YYYY-MM-DD'
  final String? notes;
  final String? createdAt;

  TransactionModel({
    this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.category,
    required this.transactionDate,
    this.notes,
    this.createdAt,
  });

  // Check if current record represents an expense
  bool get isExpense => type == 'expense';

  // Check if current record represents an income
  bool get isIncome => type == 'income';

  // Convert TransactionModel into a Map for SQLite insertion and update
  Map<String, dynamic> toMap() {
    final map = <String, dynamic>{
      'type': type,
      'amount': amount,
      'description': description,
      'category': category,
      'transaction_date': transactionDate,
      'notes': notes,
    };
    if (id != null) {
      map['id'] = id;
    }
    if (createdAt != null) {
      map['created_at'] = createdAt;
    }
    return map;
  }

  // Construct a TransactionModel from an SQLite query Map
  factory TransactionModel.fromMap(Map<String, dynamic> map) {
    return TransactionModel(
      id: map['id'] as int?,
      type: map['type'] as String,
      amount: (map['amount'] as num).toDouble(),
      description: map['description'] as String,
      category: map['category'] as String,
      transactionDate: map['transaction_date'] as String,
      notes: map['notes'] as String?,
      createdAt: map['created_at'] as String?,
    );
  }

  // Helper copyWith method for immutable state updates
  TransactionModel copyWith({
    int? id,
    String? type,
    double? amount,
    String? description,
    String? category,
    String? transactionDate,
    String? notes,
    String? createdAt,
  }) {
    return TransactionModel(
      id: id ?? this.id,
      type: type ?? this.type,
      amount: amount ?? this.amount,
      description: description ?? this.description,
      category: category ?? this.category,
      transactionDate: transactionDate ?? this.transactionDate,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
`,
  },
  {
    path: 'lib/database/database_helper.dart',
    category: 'database',
    description: 'Singleton SQLite helper managing connection, smartspend.db file, table creation, and migrations',
    content: `import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import '../models/transaction_model.dart';

class DatabaseHelper {
  // Singleton pattern to ensure only a single instance of the database exists
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  static const String dbName = 'smartspend.db';
  static const int dbVersion = 1;

  // Table and column names
  static const String tableTransactions = 'transactions';
  static const String colId = 'id';
  static const String colType = 'type';
  static const String colAmount = 'amount';
  static const String colDescription = 'description';
  static const String colCategory = 'category';
  static const String colDate = 'transaction_date';
  static const String colNotes = 'notes';
  static const String colCreatedAt = 'created_at';

  static const String tableSettings = 'settings';
  static const String colKey = 'key';
  static const String colValue = 'value';

  DatabaseHelper._init();

  // Asynchronously get or initialize the SQLite database
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB(dbName);
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    // Get default databases directory for Android
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: dbVersion,
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );
  }

  // Schema creation
  Future<void> _createDB(Database db, int version) async {
    // 1. Transactions Table
    await db.execute('''
      CREATE TABLE $tableTransactions (
        $colId INTEGER PRIMARY KEY AUTOINCREMENT,
        $colType TEXT NOT NULL CHECK($colType IN ('income', 'expense')),
        $colAmount REAL NOT NULL,
        $colDescription TEXT NOT NULL,
        $colCategory TEXT NOT NULL,
        $colDate TEXT NOT NULL,
        $colNotes TEXT,
        $colCreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    ''');

    // 2. Settings Table for local key-value persistence (e.g. monthly budget)
    await db.execute('''
      CREATE TABLE $tableSettings (
        $colKey TEXT PRIMARY KEY,
        $colValue TEXT NOT NULL
      )
    ''');

    // Seed default monthly budget of ₹15,000 for convenience
    await db.insert(tableSettings, {
      colKey: 'monthly_budget',
      colValue: '15000.0',
    });
  }

  Future<void> _upgradeDB(Database db, int oldVersion, int newVersion) async {
    // Handle schema migrations for future updates without dropping user data
    if (oldVersion < 2) {
      // Future migration example:
      // await db.execute('ALTER TABLE $tableTransactions ADD COLUMN tags TEXT;');
    }
  }

  // --- CRUD OPERATIONS FOR TRANSACTIONS ---

  // CREATE: Insert a new transaction
  Future<int> insertTransaction(TransactionModel transaction) async {
    final db = await instance.database;
    return await db.insert(
      tableTransactions,
      transaction.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // READ: Fetch all transactions ordered by date descending
  Future<List<TransactionModel>> getAllTransactions() async {
    final db = await instance.database;
    final result = await db.query(
      tableTransactions,
      orderBy: '$colDate DESC, $colId DESC',
    );
    return result.map((json) => TransactionModel.fromMap(json)).toList();
  }

  // READ: Fetch a single transaction by ID
  Future<TransactionModel?> getTransactionById(int id) async {
    final db = await instance.database;
    final maps = await db.query(
      tableTransactions,
      where: '$colId = ?',
      whereArgs: [id],
    );

    if (maps.isNotEmpty) {
      return TransactionModel.fromMap(maps.first);
    }
    return null;
  }

  // UPDATE: Update an existing transaction record by ID
  Future<int> updateTransaction(TransactionModel transaction) async {
    final db = await instance.database;
    return await db.update(
      tableTransactions,
      transaction.toMap(),
      where: '$colId = ?',
      whereArgs: [transaction.id],
    );
  }

  // DELETE: Remove a single transaction by ID
  Future<int> deleteTransaction(int id) async {
    final db = await instance.database;
    return await db.delete(
      tableTransactions,
      where: '$colId = ?',
      whereArgs: [id],
    );
  }

  // DELETE ALL: Clear all records for settings reset
  Future<int> deleteAllTransactions() async {
    final db = await instance.database;
    return await db.delete(tableTransactions);
  }

  // --- AGGREGATIONS & SUMMARY QUERIES ---

  // Sum total income
  Future<double> getTotalIncome() async {
    final db = await instance.database;
    final result = await db.rawQuery(
      'SELECT SUM($colAmount) as total FROM $tableTransactions WHERE $colType = ?',
      ['income'],
    );
    final val = result.first['total'];
    return val != null ? (val as num).toDouble() : 0.0;
  }

  // Sum total expenses
  Future<double> getTotalExpenses() async {
    final db = await instance.database;
    final result = await db.rawQuery(
      'SELECT SUM($colAmount) as total FROM $tableTransactions WHERE $colType = ?',
      ['expense'],
    );
    final val = result.first['total'];
    return val != null ? (val as num).toDouble() : 0.0;
  }

  // Sum monthly expenses for a given year and month (format: YYYY-MM)
  Future<double> getMonthlyExpenses(int year, int month) async {
    final db = await instance.database;
    final monthStr = month.toString().padLeft(2, '0');
    final pattern = '$year-$monthStr%';

    final result = await db.rawQuery(
      'SELECT SUM($colAmount) as total FROM $tableTransactions WHERE $colType = ? AND $colDate LIKE ?',
      ['expense', pattern],
    );
    final val = result.first['total'];
    return val != null ? (val as num).toDouble() : 0.0;
  }

  // Sum monthly income for a given year and month
  Future<double> getMonthlyIncome(int year, int month) async {
    final db = await instance.database;
    final monthStr = month.toString().padLeft(2, '0');
    final pattern = '$year-$monthStr%';

    final result = await db.rawQuery(
      'SELECT SUM($colAmount) as total FROM $tableTransactions WHERE $colType = ? AND $colDate LIKE ?',
      ['income', pattern],
    );
    final val = result.first['total'];
    return val != null ? (val as num).toDouble() : 0.0;
  }

  // Get category breakdown for expenses in a given month
  Future<List<Map<String, dynamic>>> getCategoryWiseExpenses(int year, int month) async {
    final db = await instance.database;
    final monthStr = month.toString().padLeft(2, '0');
    final pattern = '$year-$monthStr%';

    return await db.rawQuery('''
      SELECT $colCategory, SUM($colAmount) as total_amount, COUNT($colId) as count
      FROM $tableTransactions
      WHERE $colType = 'expense' AND $colDate LIKE ?
      GROUP BY $colCategory
      ORDER BY total_amount DESC
    ''', [pattern]);
  }

  // --- SETTINGS STORAGE (BUDGET) ---

  Future<double> getMonthlyBudget() async {
    final db = await instance.database;
    final result = await db.query(
      tableSettings,
      where: '$colKey = ?',
      whereArgs: ['monthly_budget'],
    );
    if (result.isNotEmpty) {
      final valStr = result.first[colValue] as String?;
      return double.tryParse(valStr ?? '15000') ?? 15000.0;
    }
    return 15000.0;
  }

  Future<void> setMonthlyBudget(double budget) async {
    final db = await instance.database;
    await db.insert(
      tableSettings,
      {
        colKey: 'monthly_budget',
        colValue: budget.toString(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Close database connection cleanly when app terminates
  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}
`,
  },
  {
    path: 'lib/repositories/transaction_repository.dart',
    category: 'repository',
    description: 'Repository layer decoupling UI presentation from SQLite raw queries and business rules',
    content: `import '../database/database_helper.dart';
import '../models/transaction_model.dart';

class TransactionRepository {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  // Insert transaction
  Future<int> addTransaction(TransactionModel transaction) {
    return _dbHelper.insertTransaction(transaction);
  }

  // Get all transactions
  Future<List<TransactionModel>> getTransactions() {
    return _dbHelper.getAllTransactions();
  }

  // Get single transaction
  Future<TransactionModel?> getTransaction(int id) {
    return _dbHelper.getTransactionById(id);
  }

  // Update transaction
  Future<int> updateTransaction(TransactionModel transaction) {
    return _dbHelper.updateTransaction(transaction);
  }

  // Delete transaction
  Future<int> deleteTransaction(int id) {
    return _dbHelper.deleteTransaction(id);
  }

  // Clear all records
  Future<int> clearAllTransactions() {
    return _dbHelper.deleteAllTransactions();
  }

  // Get financial overview
  Future<FinancialOverview> getFinancialOverview(int year, int month) async {
    final totalIncome = await _dbHelper.getTotalIncome();
    final totalExpenses = await _dbHelper.getTotalExpenses();
    final currentBalance = totalIncome - totalExpenses;
    final monthlyExpenses = await _dbHelper.getMonthlyExpenses(year, month);
    final monthlyIncome = await _dbHelper.getMonthlyIncome(year, month);
    final budget = await _dbHelper.getMonthlyBudget();

    return FinancialOverview(
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      currentBalance: currentBalance,
      thisMonthExpenses: monthlyExpenses,
      thisMonthIncome: monthlyIncome,
      monthlyBudget: budget,
    );
  }

  // Get category breakdown
  Future<List<Map<String, dynamic>>> getMonthlyCategoryBreakdown(int year, int month) {
    return _dbHelper.getCategoryWiseExpenses(year, month);
  }

  // Budget settings
  Future<double> getBudget() => _dbHelper.getMonthlyBudget();
  Future<void> saveBudget(double budget) => _dbHelper.setMonthlyBudget(budget);
}

class FinancialOverview {
  final double totalIncome;
  final double totalExpenses;
  final double currentBalance;
  final double thisMonthExpenses;
  final double thisMonthIncome;
  final double monthlyBudget;

  FinancialOverview({
    required this.totalIncome,
    required this.totalExpenses,
    required this.currentBalance,
    required this.thisMonthExpenses,
    required this.thisMonthIncome,
    required this.monthlyBudget,
  });

  bool get isBudgetExceeded => monthlyBudget > 0 && thisMonthExpenses > monthlyBudget;

  double get budgetProgress {
    if (monthlyBudget <= 0) return 0.0;
    return (thisMonthExpenses / monthlyBudget).clamp(0.0, 1.0);
  }
}
`,
  },
  {
    path: 'lib/utils/formatters.dart',
    category: 'util',
    description: 'Currency, date formatting helpers, and category visual mappings for Material 3',
    content: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Formatters {
  // Format numbers to Indian Rupee currency standard
  static String formatCurrency(double amount) {
    final format = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );
    return format.format(amount);
  }

  // Format ISO date (YYYY-MM-DD) to friendly format '28 Oct 2026'
  static String formatDate(String isoDateString) {
    try {
      final date = DateTime.parse(isoDateString);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (e) {
      return isoDateString;
    }
  }

  // Format month and year e.g., 'October 2026'
  static String formatMonthYear(DateTime date) {
    return DateFormat('MMMM yyyy').format(date);
  }

  // Categories list
  static const List<String> expenseCategories = [
    'Food',
    'Transport',
    'Shopping',
    'Education',
    'Entertainment',
    'Bills',
    'Healthcare',
    'Travel',
    'Other',
  ];

  static const List<String> incomeCategories = [
    'Salary',
    'Allowance',
    'Scholarship',
    'Freelance',
    'Gift',
    'Other',
  ];

  // Category Icon resolver
  static IconData getCategoryIcon(String category) {
    switch (category) {
      case 'Food':
        return Icons.restaurant;
      case 'Transport':
        return Icons.directions_bus;
      case 'Shopping':
        return Icons.shopping_bag;
      case 'Education':
        return Icons.school;
      case 'Entertainment':
        return Icons.movie;
      case 'Bills':
        return Icons.receipt_long;
      case 'Healthcare':
        return Icons.medical_services;
      case 'Travel':
        return Icons.flight_takeoff;
      case 'Salary':
        return Icons.work;
      case 'Allowance':
        return Icons.savings;
      case 'Scholarship':
        return Icons.military_tech;
      case 'Freelance':
        return Icons.laptop_mac;
      case 'Gift':
        return Icons.card_giftcard;
      default:
        return Icons.category;
    }
  }

  // Category Color resolver
  static Color getCategoryColor(String category) {
    switch (category) {
      case 'Food':
        return const Color(0xFFEF4444);
      case 'Transport':
        return const Color(0xFFF97316);
      case 'Shopping':
        return const Color(0xFFEC4899);
      case 'Education':
        return const Color(0xFF8B5CF6);
      case 'Entertainment':
        return const Color(0xFFA855F7);
      case 'Bills':
        return const Color(0xFFEAB308);
      case 'Healthcare':
        return const Color(0xFF06B6D4);
      case 'Travel':
        return const Color(0xFF3B82F6);
      case 'Salary':
        return const Color(0xFF10B981);
      case 'Allowance':
        return const Color(0xFF14B8A6);
      case 'Scholarship':
        return const Color(0xFF6366F1);
      case 'Freelance':
        return const Color(0xFF22C55E);
      case 'Gift':
        return const Color(0xFFF43F5E);
      default:
        return const Color(0xFF64748B);
    }
  }
}
`,
  },
  {
    path: 'lib/widgets/summary_card.dart',
    category: 'widget',
    description: 'Material 3 financial metric card displaying balance, income, and expense stats',
    content: `import 'package:flutter/material.dart';
import '../utils/formatters.dart';

class SummaryCard extends StatelessWidget {
  final double balance;
  final double totalIncome;
  final double totalExpenses;
  final double thisMonthExpenses;
  final double monthlyBudget;
  final bool isBudgetExceeded;

  const SummaryCard({
    super.key,
    required this.balance,
    required this.totalIncome,
    required this.totalExpenses,
    required this.thisMonthExpenses,
    required this.monthlyBudget,
    required this.isBudgetExceeded,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3730A3), Color(0xFF4F46E5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4F46E5).withOpacity(0.3),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total Balance',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'Offline SQLite',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            Formatters.formatCurrency(balance),
            style: TextStyle(
              color: balance < 0 ? const Color(0xFFFCA5A5) : Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.3),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.arrow_downward, color: Color(0xFF34D399), size: 14),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Income',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        Formatters.formatCurrency(totalIncome),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  height: 36,
                  width: 1,
                  color: Colors.white.withOpacity(0.2),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444).withOpacity(0.3),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.arrow_upward, color: Color(0xFFF87171), size: 14),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Expenses',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        Formatters.formatCurrency(totalExpenses),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (isBudgetExceeded) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withOpacity(0.9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Budget Alert! Spent \${Formatters.formatCurrency(thisMonthExpenses)} of \${Formatters.formatCurrency(monthlyBudget)} budget.',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/widgets/transaction_tile.dart',
    category: 'widget',
    description: 'Reusable list item widget with color-coded category avatar, amount styling, and tap actions',
    content: `import 'package:flutter/material.dart';
import '../models/transaction_model.dart';
import '../utils/formatters.dart';

class TransactionTile extends StatelessWidget {
  final TransactionModel transaction;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const TransactionTile({
    super.key,
    required this.transaction,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isExpense = transaction.isExpense;
    final categoryColor = Formatters.getCategoryColor(transaction.category);
    final categoryIcon = Formatters.getCategoryIcon(transaction.category);

    return Dismissible(
      key: ValueKey(transaction.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red.shade400,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white, size: 28),
      ),
      confirmDismiss: (direction) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Delete Transaction'),
            content: Text('Are you sure you want to delete "\${transaction.description}"?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                style: FilledButton.styleFrom(backgroundColor: Colors.red),
                child: const Text('Delete'),
              ),
            ],
          ),
        );
      },
      onDismissed: (_) => onDelete(),
      child: Card(
        margin: const EdgeInsets.only(bottom: 10),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                // Category Icon Avatar
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: categoryColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(categoryIcon, color: categoryColor, size: 24),
                ),
                const SizedBox(width: 14),
                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        transaction.description,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              transaction.category,
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            Formatters.formatDate(transaction.transactionDate),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Amount
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\${isExpense ? '-' : '+'}\${Formatters.formatCurrency(transaction.amount)}',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: isExpense ? const Color(0xFFDC2626) : const Color(0xFF16A34A),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.more_vert, size: 18, color: Colors.grey),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () {
                        _showOptionsBottomSheet(context);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showOptionsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.edit_outlined, color: Color(0xFF4F46E5)),
              title: const Text('Edit Transaction'),
              onTap: () {
                Navigator.pop(ctx);
                onTap();
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Colors.red),
              title: const Text('Delete Transaction', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(ctx);
                onDelete();
              },
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/dashboard_screen.dart',
    category: 'screen',
    description: 'Dashboard screen displaying total balance, monthly summary, quick expense chart, and recent items',
    content: `import 'package:flutter/material.dart';
import '../repositories/transaction_repository.dart';
import '../models/transaction_model.dart';
import '../widgets/summary_card.dart';
import '../widgets/transaction_tile.dart';
import '../utils/formatters.dart';
import 'transaction_form_screen.dart';

class DashboardScreen extends StatefulWidget {
  final VoidCallback onNavigateToTransactions;
  final VoidCallback onNavigateToReports;

  const DashboardScreen({
    super.key,
    required this.onNavigateToTransactions,
    required this.onNavigateToReports,
  });

  @override
  State<DashboardScreen> createState() => DashboardScreenState();
}

class DashboardScreenState extends State<DashboardScreen> {
  final TransactionRepository _repository = TransactionRepository();

  bool _isLoading = true;
  FinancialOverview? _overview;
  List<TransactionModel> _recentTransactions = [];
  List<Map<String, dynamic>> _categoryBreakdown = [];

  @override
  void initState() {
    super.initState();
    loadData();
  }

  Future<void> loadData() async {
    setState(() => _isLoading = true);
    final now = DateTime.now();

    try {
      final overview = await _repository.getFinancialOverview(now.year, now.month);
      final allTransactions = await _repository.getTransactions();
      final breakdown = await _repository.getMonthlyCategoryBreakdown(now.year, now.month);

      setState(() {
        _overview = overview;
        _recentTransactions = allTransactions.take(5).toList();
        _categoryBreakdown = breakdown;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading dashboard: \$e')),
        );
      }
    }
  }

  Future<void> _deleteTransaction(TransactionModel item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Transaction'),
        content: Text('Do you want to permanently delete "\${item.description}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true && item.id != null) {
      await _repository.deleteTransaction(item.id!);
      loadData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Transaction deleted'),
            backgroundColor: Colors.black87,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _editTransaction(TransactionModel item) async {
    final updated = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) => TransactionFormScreen(existingTransaction: item),
      ),
    );

    if (updated == true) {
      loadData();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final overview = _overview!;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SmartSpend',
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.w800,
                fontSize: 22,
              ),
            ),
            const Text(
              'Personal Expense Tracker',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: loadData,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // Hero Financial Card
            SummaryCard(
              balance: overview.currentBalance,
              totalIncome: overview.totalIncome,
              totalExpenses: overview.totalExpenses,
              thisMonthExpenses: overview.thisMonthExpenses,
              monthlyBudget: overview.monthlyBudget,
              isBudgetExceeded: overview.isBudgetExceeded,
            ),
            const SizedBox(height: 20),

            // Monthly Budget Progress Bar
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "This Month's Spending",
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        Text(
                          '\${Formatters.formatCurrency(overview.thisMonthExpenses)} / \${Formatters.formatCurrency(overview.monthlyBudget)}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: overview.isBudgetExceeded ? Colors.red : Colors.grey.shade700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: overview.budgetProgress,
                        minHeight: 10,
                        backgroundColor: Colors.grey.shade200,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          overview.isBudgetExceeded ? Colors.red : const Color(0xFF4F46E5),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Category Expense Breakdown preview
            if (_categoryBreakdown.isNotEmpty) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Top Spending Categories',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: widget.onNavigateToReports,
                    child: const Text('View Report'),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: _categoryBreakdown.take(3).map((item) {
                      final category = item['category'] as String;
                      final amount = (item['total_amount'] as num).toDouble();
                      final total = overview.thisMonthExpenses > 0 ? overview.thisMonthExpenses : 1.0;
                      final percentage = (amount / total) * 100;
                      final color = Formatters.getCategoryColor(category);

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(Formatters.getCategoryIcon(category), size: 16, color: color),
                                    const SizedBox(width: 8),
                                    Text(category, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                                  ],
                                ),
                                Text(
                                  '\${Formatters.formatCurrency(amount)} (\${percentage.toStringAsFixed(0)}%)',
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: (percentage / 100).clamp(0.0, 1.0),
                                minHeight: 6,
                                backgroundColor: Colors.grey.shade100,
                                valueColor: AlwaysStoppedAnimation<Color>(color),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Recent Transactions Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Transactions',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: widget.onNavigateToTransactions,
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 8),

            if (_recentTransactions.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.account_balance_wallet_outlined, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text(
                        'No transactions recorded yet',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Tap the "+ Add" button below to add your first income or expense record.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _recentTransactions.length,
                itemBuilder: (context, index) {
                  final item = _recentTransactions[index];
                  return TransactionTile(
                    transaction: item,
                    onTap: () => _editTransaction(item),
                    onDelete: () => _deleteTransaction(item),
                  );
                },
              ),
            const SizedBox(height: 60), // Spacing for FAB
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/transactions_screen.dart',
    category: 'screen',
    description: 'Transactions list view with live search, type filter tabs (All/Income/Expense), category dropdown, and delete confirmation',
    content: `import 'package:flutter/material.dart';
import '../repositories/transaction_repository.dart';
import '../models/transaction_model.dart';
import '../widgets/transaction_tile.dart';
import 'transaction_form_screen.dart';

class TransactionsScreen extends StatefulWidget {
  final VoidCallback onDataChanged;

  const TransactionsScreen({
    super.key,
    required this.onDataChanged,
  });

  @override
  State<TransactionsScreen> createState() => TransactionsScreenState();
}

class TransactionsScreenState extends State<TransactionsScreen> {
  final TransactionRepository _repository = TransactionRepository();

  bool _isLoading = true;
  List<TransactionModel> _allTransactions = [];
  List<TransactionModel> _filteredTransactions = [];

  String _searchQuery = '';
  String _selectedType = 'all'; // 'all', 'income', 'expense'
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    loadTransactions();
  }

  Future<void> loadTransactions() async {
    setState(() => _isLoading = true);
    try {
      final items = await _repository.getTransactions();
      setState(() {
        _allTransactions = items;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _applyFilters() {
    List<TransactionModel> list = [..._allTransactions];

    // Filter by type
    if (_selectedType != 'all') {
      list = list.where((t) => t.type == _selectedType).toList();
    }

    // Filter by category
    if (_selectedCategory != 'all') {
      list = list.where((t) => t.category == _selectedCategory).toList();
    }

    // Filter by search query (description or notes)
    if (_searchQuery.trim().isNotEmpty) {
      final query = _searchQuery.toLowerCase().trim();
      list = list.where((t) {
        final descMatch = t.description.toLowerCase().contains(query);
        final notesMatch = t.notes?.toLowerCase().contains(query) ?? false;
        final catMatch = t.category.toLowerCase().contains(query);
        return descMatch || notesMatch || catMatch;
      }).toList();
    }

    _filteredTransactions = list;
  }

  Future<void> _deleteTransaction(TransactionModel item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Transaction'),
        content: Text('Are you sure you want to permanently delete "\${item.description}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true && item.id != null) {
      await _repository.deleteTransaction(item.id!);
      loadTransactions();
      widget.onDataChanged();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Transaction deleted successfully'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _editTransaction(TransactionModel item) async {
    final updated = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) => TransactionFormScreen(existingTransaction: item),
      ),
    );

    if (updated == true) {
      loadTransactions();
      widget.onDataChanged();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('All Transactions'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SearchBar(
              hintText: 'Search by description or category...',
              leading: const Icon(Icons.search, size: 20),
              trailing: _searchQuery.isNotEmpty
                  ? [
                      IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          setState(() {
                            _searchQuery = '';
                            _applyFilters();
                          });
                        },
                      ),
                    ]
                  : null,
              elevation: const WidgetStatePropertyAll(0),
              backgroundColor: WidgetStatePropertyAll(Colors.grey.shade100),
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                  _applyFilters();
                });
              },
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('All'),
                  selected: _selectedType == 'all',
                  onSelected: (selected) {
                    setState(() {
                      _selectedType = 'all';
                      _applyFilters();
                    });
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Expenses Only'),
                  selected: _selectedType == 'expense',
                  selectedColor: Colors.red.shade100,
                  onSelected: (selected) {
                    setState(() {
                      _selectedType = selected ? 'expense' : 'all';
                      _applyFilters();
                    });
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Income Only'),
                  selected: _selectedType == 'income',
                  selectedColor: Colors.green.shade100,
                  onSelected: (selected) {
                    setState(() {
                      _selectedType = selected ? 'income' : 'all';
                      _applyFilters();
                    });
                  },
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Transactions List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredTransactions.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off_rounded, size: 54, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            const Text(
                              'No matching transactions found',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _searchQuery.isNotEmpty
                                  ? 'Try adjusting your search or filters'
                                  : 'No records exist in the SQLite database',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        itemCount: _filteredTransactions.length,
                        itemBuilder: (context, index) {
                          final item = _filteredTransactions[index];
                          return TransactionTile(
                            transaction: item,
                            onTap: () => _editTransaction(item),
                            onDelete: () => _deleteTransaction(item),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/transaction_form_screen.dart',
    category: 'screen',
    description: 'Unified Add/Edit transaction form with validation, type toggle, category selector, and date picker',
    content: `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../repositories/transaction_repository.dart';
import '../models/transaction_model.dart';
import '../utils/formatters.dart';

class TransactionFormScreen extends StatefulWidget {
  final TransactionModel? existingTransaction;

  const TransactionFormScreen({
    super.key,
    this.existingTransaction,
  });

  @override
  State<TransactionFormScreen> createState() => _TransactionFormScreenState();
}

class _TransactionFormScreenState extends State<TransactionFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final TransactionRepository _repository = TransactionRepository();

  late String _type; // 'expense' or 'income'
  late TextEditingController _amountController;
  late TextEditingController _descriptionController;
  late TextEditingController _notesController;
  late DateTime _selectedDate;
  String? _selectedCategory;

  bool _isSaving = false;

  bool get isEditMode => widget.existingTransaction != null;

  @override
  void initState() {
    super.initState();
    final existing = widget.existingTransaction;

    _type = existing?.type ?? 'expense';
    _amountController = TextEditingController(
      text: existing != null ? existing.amount.toStringAsFixed(2) : '',
    );
    _descriptionController = TextEditingController(text: existing?.description ?? '');
    _notesController = TextEditingController(text: existing?.notes ?? '');

    if (existing != null) {
      try {
        _selectedDate = DateTime.parse(existing.transactionDate);
      } catch (_) {
        _selectedDate = DateTime.now();
      }
      _selectedCategory = existing.category;
    } else {
      _selectedDate = DateTime.now();
      _selectedCategory = Formatters.expenseCategories.first;
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  List<String> get availableCategories =>
      _type == 'expense' ? Formatters.expenseCategories : Formatters.incomeCategories;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a category')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final amount = double.parse(_amountController.text.trim());
    final description = _descriptionController.text.trim();
    final notes = _notesController.text.trim().isEmpty ? null : _notesController.text.trim();
    final dateIso = DateFormat('yyyy-MM-dd').format(_selectedDate);

    try {
      if (isEditMode) {
        // UPDATE existing record in SQLite preserving ID
        final updatedModel = widget.existingTransaction!.copyWith(
          type: _type,
          amount: amount,
          description: description,
          category: _selectedCategory!,
          transactionDate: dateIso,
          notes: notes,
        );
        await _repository.updateTransaction(updatedModel);
      } else {
        // CREATE new record in SQLite
        final newModel = TransactionModel(
          type: _type,
          amount: amount,
          description: description,
          category: _selectedCategory!,
          transactionDate: dateIso,
          notes: notes,
        );
        await _repository.addTransaction(newModel);
      }

      if (mounted) {
        Navigator.pop(context, true); // Return success signal
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Database error: \$e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEditMode ? 'Edit Transaction' : 'Add Transaction'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Segmented Button: Expense vs Income
              Center(
                child: SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(
                      value: 'expense',
                      label: Text('Expense'),
                      icon: Icon(Icons.arrow_upward, color: Color(0xFFEF4444)),
                    ),
                    ButtonSegment(
                      value: 'income',
                      label: Text('Income'),
                      icon: Icon(Icons.arrow_downward, color: Color(0xFF10B981)),
                    ),
                  ],
                  selected: {_type},
                  onSelectionChanged: (newSelection) {
                    setState(() {
                      _type = newSelection.first;
                      // Reset category to first available in new type
                      _selectedCategory = availableCategories.first;
                    });
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Amount Input
              TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  labelText: 'Amount (₹) *',
                  prefixText: '₹ ',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: Colors.white,
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Please enter the transaction amount';
                  }
                  final parsed = double.tryParse(val.trim());
                  if (parsed == null || parsed <= 0) {
                    return 'Amount must be greater than ₹0.00';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Description Input
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description / Title *',
                  hintText: 'e.g. Lunch with friends, Course fees',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: Colors.white,
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Description cannot be empty';
                  }
                  if (val.trim().length > 100) {
                    return 'Description must be under 100 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Category Dropdown
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: InputDecoration(
                  labelText: 'Category *',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: Colors.white,
                ),
                items: availableCategories.map((cat) {
                  return DropdownMenuItem(
                    value: cat,
                    child: Row(
                      children: [
                        Icon(
                          Formatters.getCategoryIcon(cat),
                          size: 20,
                          color: Formatters.getCategoryColor(cat),
                        ),
                        const SizedBox(width: 10),
                        Text(cat),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedCategory = val;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Date Picker Field
              InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: _pickDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Date *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: Colors.white,
                    suffixIcon: const Icon(Icons.calendar_month),
                  ),
                  child: Text(
                    DateFormat('dd MMMM yyyy').format(_selectedDate),
                    style: const TextStyle(fontSize: 15),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Notes Input (Optional)
              TextFormField(
                controller: _notesController,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Notes (Optional)',
                  hintText: 'Add payment method, invoice number, or reminder',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),
              const SizedBox(height: 28),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _isSaving ? null : () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: _isSaving ? null : _submitForm,
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        backgroundColor: const Color(0xFF4F46E5),
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(isEditMode ? 'Update' : 'Save Record'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/reports_screen.dart',
    category: 'screen',
    description: 'Monthly financial reports with month selector, income vs expense totals, and category breakdown',
    content: `import 'package:flutter/material.dart';
import '../repositories/transaction_repository.dart';
import '../utils/formatters.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => ReportsScreenState();
}

class ReportsScreenState extends State<ReportsScreen> {
  final TransactionRepository _repository = TransactionRepository();

  DateTime _selectedMonth = DateTime.now();
  bool _isLoading = true;
  double _monthlyIncome = 0.0;
  double _monthlyExpenses = 0.0;
  List<Map<String, dynamic>> _categoryData = [];

  @override
  void initState() {
    super.initState();
    loadReportData();
  }

  Future<void> loadReportData() async {
    setState(() => _isLoading = true);
    try {
      final overview = await _repository.getFinancialOverview(_selectedMonth.year, _selectedMonth.month);
      final categories = await _repository.getMonthlyCategoryBreakdown(_selectedMonth.year, _selectedMonth.month);

      setState(() {
        _monthlyIncome = overview.thisMonthIncome;
        _monthlyExpenses = overview.thisMonthExpenses;
        _categoryData = categories;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _previousMonth() {
    setState(() {
      _selectedMonth = DateTime(_selectedMonth.year, _selectedMonth.month - 1);
    });
    loadReportData();
  }

  void _nextMonth() {
    setState(() {
      _selectedMonth = DateTime(_selectedMonth.year, _selectedMonth.month + 1);
    });
    loadReportData();
  }

  @override
  Widget build(BuildContext context) {
    final netSavings = _monthlyIncome - _monthlyExpenses;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Monthly Reports'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Month Selector Bar
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left),
                      onPressed: _previousMonth,
                    ),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 18, color: Color(0xFF4F46E5)),
                        const SizedBox(width: 8),
                        Text(
                          Formatters.formatMonthYear(_selectedMonth),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right),
                      onPressed: _nextMonth,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Summary Totals Card
            Row(
              children: [
                Expanded(
                  child: Card(
                    color: Colors.green.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Income', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 6),
                          Text(
                            Formatters.formatCurrency(_monthlyIncome),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Card(
                    color: Colors.red.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Expenses', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 6),
                          Text(
                            Formatters.formatCurrency(_monthlyExpenses),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Net Savings Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Net Savings (Income - Expense)', style: TextStyle(fontWeight: FontWeight.w500)),
                    Text(
                      Formatters.formatCurrency(netSavings),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: netSavings >= 0 ? const Color(0xFF10B981) : Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Category Breakdown Section
            Row(
              children: [
                const Icon(Icons.pie_chart_outline, color: Color(0xFF4F46E5), size: 20),
                const SizedBox(width: 8),
                Text(
                  'Expense Breakdown by Category (\${Formatters.formatMonthYear(_selectedMonth)})',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (_isLoading)
              const Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(),
              )
            else if (_categoryData.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.insert_chart_outlined, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text(
                        'No expenses recorded for this month',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Select another month or record new expenses to view analytics.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              )
            else
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: _categoryData.map((item) {
                      final category = item['category'] as String;
                      final amount = (item['total_amount'] as num).toDouble();
                      final count = item['count'] as int;
                      final percentage = _monthlyExpenses > 0 ? (amount / _monthlyExpenses) * 100 : 0.0;
                      final color = Formatters.getCategoryColor(category);

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 12,
                                      backgroundColor: color.withOpacity(0.15),
                                      child: Icon(Formatters.getCategoryIcon(category), size: 14, color: color),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(category, style: const TextStyle(fontWeight: FontWeight.w600)),
                                    const SizedBox(width: 6),
                                    Text('(\$count trans.)', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
                                  ],
                                ),
                                Text(
                                  '\${Formatters.formatCurrency(amount)} (\${percentage.toStringAsFixed(1)}%)',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: (percentage / 100).clamp(0.0, 1.0),
                                minHeight: 8,
                                backgroundColor: Colors.grey.shade100,
                                valueColor: AlwaysStoppedAnimation<Color>(color),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/settings_screen.dart',
    category: 'screen',
    description: 'Settings screen for setting monthly budget, viewing SQLite database metadata, and clear data dialog',
    content: `import 'package:flutter/material.dart';
import '../repositories/transaction_repository.dart';
import '../utils/formatters.dart';

class SettingsScreen extends StatefulWidget {
  final VoidCallback onDataReset;

  const SettingsScreen({
    super.key,
    required this.onDataReset,
  });

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final TransactionRepository _repository = TransactionRepository();
  final TextEditingController _budgetController = TextEditingController();

  double _currentBudget = 15000.0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBudget();
  }

  @override
  void dispose() {
    _budgetController.dispose();
    super.dispose();
  }

  Future<void> _loadBudget() async {
    final b = await _repository.getBudget();
    setState(() {
      _currentBudget = b;
      _budgetController.text = b.toStringAsFixed(0);
      _isLoading = false;
    });
  }

  Future<void> _saveBudget() async {
    final val = double.tryParse(_budgetController.text.trim());
    if (val == null || val <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid budget greater than ₹0')),
      );
      return;
    }

    await _repository.saveBudget(val);
    setState(() {
      _currentBudget = val;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Monthly budget updated to \${Formatters.formatCurrency(val)}'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  Future<void> _clearAllData() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clear All Data?'),
        content: const Text(
          'This will permanently delete all recorded transactions from the SQLite database (smartspend.db). This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear Everything'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _repository.clearAllTransactions();
      widget.onDataReset();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All transactions deleted from SQLite database'),
            backgroundColor: Colors.black87,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings & Configuration'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Monthly Budget Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.savings_outlined, color: Color(0xFF4F46E5)),
                      SizedBox(width: 8),
                      Text(
                        'Monthly Spending Budget',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Set your monthly expense limit. SmartSpend alerts you when spending exceeds this amount.',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _budgetController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            prefixText: '₹ ',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      FilledButton(
                        onPressed: _saveBudget,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF4F46E5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Update'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Database & Storage Info
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.storage_outlined, color: Color(0xFF4F46E5)),
                      SizedBox(width: 8),
                      Text(
                        'SQLite Database Details',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                    title: Text('Database File'),
                    subtitle: Text('smartspend.db (Android /data/data/.../databases/)'),
                  ),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                    title: Text('SQLite Engine'),
                    subtitle: Text('sqflite 2.3.2 with WAL mode'),
                  ),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                    title: Text('Data Privacy'),
                    subtitle: Text('100% Offline. No internet permissions required.'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Danger Zone
          Card(
            color: Colors.red.shade50,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, color: Colors.red.shade700),
                      const SizedBox(width: 8),
                      Text(
                        'Data Management',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.red.shade700),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Clear all transaction records while keeping table structure and budget settings intact.',
                    style: TextStyle(fontSize: 12, color: Colors.red.shade900),
                  ),
                  const SizedBox(height: 14),
                  FilledButton.icon(
                    onPressed: _clearAllData,
                    icon: const Icon(Icons.delete_forever),
                    label: const Text('Clear All Transactions'),
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.red.shade600,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    category: 'config',
    description: 'Android manifest configuration with application label and launcher properties',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="SmartSpend"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
`,
  },
  {
    path: 'test/transaction_model_test.dart',
    category: 'core',
    description: 'Unit test verifying TransactionModel serialization and calculation assertions',
    content: `import 'package:flutter_test/flutter_test.dart';
import 'package:smartspend/models/transaction_model.dart';

void main() {
  group('TransactionModel Tests', () {
    test('toMap and fromMap preserves all fields correctly', () {
      final model = TransactionModel(
        id: 101,
        type: 'expense',
        amount: 850.50,
        description: 'Semester Exam Fee',
        category: 'Education',
        transactionDate: '2026-10-28',
        notes: 'Paid via UPI',
      );

      final map = model.toMap();
      final reconstructed = TransactionModel.fromMap(map);

      expect(reconstructed.id, 101);
      expect(reconstructed.type, 'expense');
      expect(reconstructed.amount, 850.50);
      expect(reconstructed.description, 'Semester Exam Fee');
      expect(reconstructed.category, 'Education');
      expect(reconstructed.transactionDate, '2026-10-28');
      expect(reconstructed.notes, 'Paid via UPI');
      expect(reconstructed.isExpense, true);
      expect(reconstructed.isIncome, false);
    });

    test('copyWith modifies only targeted properties', () {
      final original = TransactionModel(
        id: 1,
        type: 'income',
        amount: 5000,
        description: 'Freelance',
        category: 'Freelance',
        transactionDate: '2026-10-01',
      );

      final updated = original.copyWith(amount: 6500, description: 'Freelance Mobile App');

      expect(updated.id, 1);
      expect(updated.amount, 6500);
      expect(updated.description, 'Freelance Mobile App');
      expect(updated.category, 'Freelance');
    });
  });
}
`,
  },
  {
    path: 'README.md',
    category: 'config',
    description: 'Project README with terminal setup commands, run instructions, and college viva guide',
    content: `# SmartSpend – Personal Expense Tracker

A complete, beginner-friendly Flutter mobile application for tracking personal income, expenses, and monthly budgets using a local SQLite database (\`sqflite\`).

## Tech Stack
- **Framework**: Flutter (Dart 3.x)
- **Database**: SQLite (\`sqflite: ^2.3.2\`, \`path: ^1.9.0\`)
- **UI Design**: Material Design 3
- **Formatters**: \`intl: ^0.19.0\` for ₹ INR and Indian date formatting
- **Platform**: Android (Offline, zero network requirement)

## Quick Start (Terminal Commands)
\`\`\`bash
# 1. Create a new Flutter project
flutter create --org com.smartspend smartspend
cd smartspend

# 2. Add dependencies
flutter pub add sqflite path intl cupertino_icons

# 3. Verify Flutter setup
flutter doctor

# 4. Run on connected Android device or emulator
flutter run
\`\`\`
`,
  },
];
