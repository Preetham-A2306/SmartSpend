/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { BudgetView } from './components/BudgetView.tsx';
import { ProjectFilesView } from './components/ProjectFilesView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { DeleteModal } from './components/DeleteModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { StorageService } from './services/storage.ts';
import { Transaction, AppSettings } from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Month & Year selection (Defaults to current date)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: 2026, month: 10 };
  });

  // Persistent data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  const loadData = () => {
    const tx = StorageService.getTransactions();
    const st = StorageService.getSettings();
    setTransactions(tx);
    setSettings(st);
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD Handlers
  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'created_at'>,
    existingId?: string
  ) => {
    if (existingId) {
      // UPDATE
      StorageService.updateTransaction({
        ...data,
        id: existingId,
        created_at: editingTransaction?.created_at || new Date().toISOString(),
      });
      showToast('Transaction updated successfully! ✨', 'success');
    } else {
      // CREATE
      StorageService.addTransaction(data);
      showToast('New transaction recorded! 💸', 'success');
    }

    setIsModalOpen(false);
    setEditingTransaction(null);
    loadData();
  };

  const handleStartDelete = (tx: Transaction) => {
    setDeletingTransaction(tx);
  };

  const handleConfirmDelete = () => {
    if (!deletingTransaction) return;
    StorageService.deleteTransaction(deletingTransaction.id);
    showToast('Transaction deleted successfully.', 'info');
    setDeletingTransaction(null);
    loadData();
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    StorageService.saveSettings(updated);
    setSettings(updated);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Restore original demo transactions? Current records will be replaced with demo entries.')) {
      StorageService.resetToDemoData();
      loadData();
      showToast('Sample demo transactions restored! 🌟', 'info');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you completely sure you want to delete ALL transactions? This cannot be undone.')) {
      StorageService.clearAllTransactions();
      loadData();
      showToast('All transaction records cleared.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row antialiased selection:bg-[#C4B5FD]/40">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={handleOpenAdd}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          userName={settings.userName}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenAddModal={handleOpenAdd}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              settings={settings}
              selectedMonth={selectedMonth}
              onNavigateTab={setCurrentTab}
              onOpenAddModal={handleOpenAdd}
              onEditTransaction={handleEdit}
              onDeleteTransaction={handleStartDelete}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onOpenAddModal={handleOpenAdd}
              onEditTransaction={handleEdit}
              onDeleteTransaction={handleStartDelete}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              selectedMonth={selectedMonth}
            />
          )}

          {currentTab === 'budget' && (
            <BudgetView
              transactions={transactions}
              settings={settings}
              selectedMonth={selectedMonth}
              onUpdateSettings={handleUpdateSettings}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'files' && (
            <ProjectFilesView onShowToast={showToast} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              transactions={transactions}
              onUpdateSettings={handleUpdateSettings}
              onResetDemoData={handleResetDemoData}
              onClearAllData={handleClearAllData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Unified Add/Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialTransaction={editingTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteModal
        isOpen={!!deletingTransaction}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
