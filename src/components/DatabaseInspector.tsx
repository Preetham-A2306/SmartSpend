import React, { useState, useEffect } from 'react';
import { Database, Play, RotateCcw, Table, Terminal, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { sqliteDb, SqlLogEntry } from '../database/sqlite_engine.ts';
import { Transaction } from '../types/index.ts';
import { formatINR } from '../utils/finance.ts';

interface DatabaseInspectorProps {
  onDataChanged?: () => void;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({ onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'sql' | 'logs' | 'schema'>('table');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sqlLogs, setSqlLogs] = useState<SqlLogEntry[]>([]);
  const [customQuery, setCustomQuery] = useState<string>('SELECT * FROM transactions WHERE type = \'expense\' ORDER BY amount DESC;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[]; message: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const reloadData = async () => {
    const list = await sqliteDb.getAllTransactions();
    setTransactions(list);
    setSqlLogs(sqliteDb.getSqlLogs());
    onDataChanged?.();
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleRunQuery = async (queryToRun?: string) => {
    const query = queryToRun || customQuery;
    setIsExecuting(true);
    try {
      const result = await sqliteDb.executeRawQuery(query);
      setQueryResult(result);
      await reloadData();
    } catch (err: any) {
      setQueryResult({
        columns: ['error'],
        rows: [{ error: err.message || 'Execution error' }],
        message: 'Query failed with syntax or execution error.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const sampleQueries = [
    { label: 'All Expenses', sql: "SELECT * FROM transactions WHERE type = 'expense' ORDER BY amount DESC;" },
    { label: 'All Income', sql: "SELECT * FROM transactions WHERE type = 'income' ORDER BY amount DESC;" },
    { label: 'Transactions > ₹1,000', sql: "SELECT * FROM transactions WHERE amount > 1000 ORDER BY amount DESC;" },
    { label: 'Recent Transactions', sql: "SELECT * FROM transactions ORDER BY transaction_date DESC;" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Bar */}
      <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">smartspend.db Inspector</span>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                SQLite v3.x (sqflite)
              </span>
            </div>
            <p className="text-xs text-slate-400">Live inspection of SQLite database tables, rows, and raw queries</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table size={14} />
            <span>Table Viewer</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'sql' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} />
            <span>SQL Console</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'schema' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>DDL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={14} />
            <span>Query Logs ({sqlLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-5 overflow-auto">
        {/* TAB: TABLE VIEWER */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <div className="text-slate-300">
                Table: <span className="font-mono font-bold text-indigo-400">transactions</span> (
                <span className="text-emerald-400 font-bold">{transactions.length} rows</span>)
              </div>
              <button
                onClick={reloadData}
                className="flex items-center space-x-1 text-slate-400 hover:text-indigo-400 font-semibold"
              >
                <RotateCcw size={14} />
                <span>Refresh Rows</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300 font-mono text-[11px] border-b border-slate-800">
                    <th className="p-3 font-semibold text-slate-400">id</th>
                    <th className="p-3 font-semibold text-slate-400">type</th>
                    <th className="p-3 font-semibold text-slate-400 text-right">amount</th>
                    <th className="p-3 font-semibold text-slate-400">description</th>
                    <th className="p-3 font-semibold text-slate-400">category</th>
                    <th className="p-3 font-semibold text-slate-400">transaction_date</th>
                    <th className="p-3 font-semibold text-slate-400">notes</th>
                    <th className="p-3 font-semibold text-slate-400">created_at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                        No rows present in table <code className="text-indigo-400 font-mono">transactions</code>.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 text-indigo-400 font-bold">{t.id}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                              t.type === 'expense'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${
                            t.type === 'expense' ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatINR(t.amount)}
                        </td>
                        <td className="p-3 font-sans text-white max-w-xs truncate">{t.description}</td>
                        <td className="p-3 font-sans text-slate-300">{t.category}</td>
                        <td className="p-3 text-slate-400">{t.transaction_date}</td>
                        <td className="p-3 text-slate-500 italic font-sans max-w-xs truncate">{t.notes || 'NULL'}</td>
                        <td className="p-3 text-slate-500 text-[10px]">{t.created_at || 'CURRENT_TIMESTAMP'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SQL CONSOLE */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Execute Custom SQL Query on <code className="text-indigo-400">smartspend.db</code>:
              </label>
              <div className="flex space-x-2">
                <textarea
                  rows={3}
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="w-full bg-slate-950 font-mono text-xs text-indigo-300 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Sample Query Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] text-slate-500 font-semibold self-center">Templates:</span>
                {sampleQueries.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => {
                      setCustomQuery(q.sql);
                      handleRunQuery(q.sql);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
                <button
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting}
                  className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Play size={14} />
                  <span>{isExecuting ? 'Running...' : 'Execute Query'}</span>
                </button>
              </div>
            </div>

            {/* Query Results */}
            {queryResult && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle size={14} />
                    <span>{queryResult.message}</span>
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">{queryResult.rows.length} rows returned</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-300 font-mono text-[11px] border-b border-slate-800">
                        {queryResult.columns.map((col) => (
                          <th key={col} className="p-3 font-semibold text-slate-400">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60">
                          {queryResult.columns.map((col) => (
                            <td key={col} className="p-3 text-slate-200">
                              {row[col] !== undefined ? String(row[col]) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: DDL SCHEMA */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-4">
              <div>
                <span className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1">
                  Table 1: Transactions Schema
                </span>
                <pre className="text-indigo-300 leading-relaxed whitespace-pre">
{`CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date TEXT NOT NULL, -- Stored as ISO YYYY-MM-DD
  notes TEXT,                     -- Optional notes
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <span className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1">
                  Table 2: Settings Schema (Local Key-Value Storage)
                </span>
                <pre className="text-emerald-300 leading-relaxed whitespace-pre">
{`CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);`}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <div className="font-bold text-slate-200 mb-1">Parameterized Queries (Security)</div>
                <p className="text-slate-400 text-[11px]">
                  All operations use <code className="text-indigo-400">whereArgs: [id]</code> and prepared statements to guarantee complete immunity against SQL injection vulnerabilities.
                </p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <div className="font-bold text-slate-200 mb-1">ACID Reliability & WAL Mode</div>
                <p className="text-slate-400 text-[11px]">
                  Configured with SQLite Write-Ahead Logging (WAL) ensuring atomic commit integrity and multi-thread reading safety during UI navigation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: QUERY LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span>Real-time SQLite Operation Audit Log (Newest first)</span>
              <button
                onClick={() => {
                  sqliteDb.clearLogs();
                  setSqlLogs([]);
                }}
                className="text-[11px] hover:text-red-400 text-slate-500"
              >
                Clear Audit History
              </button>
            </div>

            <div className="space-y-2">
              {sqlLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1"
                >
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="text-indigo-400 font-bold">{log.timestamp}</span>
                    <span className="text-emerald-400 font-semibold">{log.executionTimeMs} ms</span>
                  </div>
                  <div className="text-slate-200 font-semibold break-all">{log.query}</div>
                  {log.params && log.params.length > 0 && (
                    <div className="text-[10px] text-slate-400">
                      Params: [{log.params.map((p) => JSON.stringify(p)).join(', ')}]
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
