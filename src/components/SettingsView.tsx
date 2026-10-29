import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Wallet,
  Download,
  Trash2,
  RotateCcw,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  FolderArchive,
} from 'lucide-react';
import { AppSettings, Transaction } from '../types/index.ts';
import { StorageService } from '../services/storage.ts';
import { generateMasterBundleZip, triggerBlobDownload } from '../services/projectZipExporter.ts';

interface SettingsViewProps {
  settings: AppSettings;
  transactions: Transaction[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  transactions,
  onUpdateSettings,
  onResetDemoData,
  onClearAllData,
  onShowToast,
}) => {
  const [userNameInput, setUserNameInput] = useState<string>(settings.userName);
  const [budgetInput, setBudgetInput] = useState<string>(settings.monthlyBudget.toString());
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = userNameInput.trim();
    const cleanBudget = parseFloat(budgetInput);

    if (!cleanName) {
      onShowToast('User name cannot be blank.', 'error');
      return;
    }
    if (isNaN(cleanBudget) || cleanBudget <= 0) {
      onShowToast('Budget must be a positive number.', 'error');
      return;
    }

    onUpdateSettings({
      userName: cleanName,
      monthlyBudget: cleanBudget,
    });
    onShowToast('Preferences updated successfully! ✨', 'success');
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'SmartSpend',
      exportedAt: new Date().toISOString(),
      settings,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartspend_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Complete JSON backup downloaded!', 'success');
  };

  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  const handleDownloadProjectZip = async () => {
    setIsDownloadingZip(true);
    try {
      const blob = await generateMasterBundleZip();
      triggerBlobDownload(blob, 'smartspend_complete_project_folder.zip');
      onShowToast('Complete project folder (.zip) downloaded! 📦', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to download project zip.', 'error');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const supabaseSchemaSql = `-- SmartSpend Supabase PostgreSQL Schema
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  category_emoji TEXT NOT NULL DEFAULT '💸',
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read and write their own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);`;

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(supabaseSchemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    onShowToast('Supabase SQL Schema copied to clipboard!', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
          <span>⚙️</span>
          <span>Settings & Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure currency, user name, data backups, and database connections
        </p>
      </div>

      {/* Profile & Monthly Target Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
          <User size={16} className="text-[#8B5CF6]" />
          <span>User Profile & Budget Target</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="e.g. Priya"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monthly Budget (₹)
            </label>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#C4B5FD]/20"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <span>Currency:</span>
              <span className="font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                Indian Rupee (₹ INR)
              </span>
            </div>
            <button
              type="submit"
              className="bg-[#C4B5FD] hover:bg-[#B49EFA] text-[#4C1D95] font-extrabold px-5 py-2.5 rounded-2xl text-xs transition-all shadow-xs border border-[#A78BFA]/40"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Data Management Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
          <Database size={16} className="text-[#8B5CF6]" />
          <span>Data Storage & Management</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Backup */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-extrabold text-slate-800 text-xs block mb-1">
                Export JSON Backup
              </span>
              <p className="text-[11px] text-slate-400">
                Download all {transactions.length} records in standardized JSON.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Download size={13} />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-extrabold text-slate-800 text-xs block mb-1">
                Reset Demo Data
              </span>
              <p className="text-[11px] text-slate-400">
                Restore the 10 standard college & student sample transactions.
              </p>
            </div>
            <button
              onClick={onResetDemoData}
              className="w-full bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw size={13} />
              <span>Restore Demo</span>
            </button>
          </div>

          {/* Clear Everything */}
          <div className="bg-[#FEF2F2]/60 border border-[#FECACA] rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-extrabold text-[#7F1D1D] text-xs block mb-1">
                Danger: Clear All
              </span>
              <p className="text-[11px] text-[#991B1B]">
                Permanently wipes all transactions from local storage.
              </p>
            </div>
            <button
              onClick={onClearAllData}
              className="w-full bg-[#FEE2E2] hover:bg-[#FECACA] text-[#B91C1C] font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Trash2 size={13} />
              <span>Clear Everything</span>
            </button>
          </div>
        </div>

        {/* 1-Click Complete Project Folder ZIP */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#EDE9FE]/60 via-[#E0F2FE]/60 to-[#DCFCE7]/60 border border-[#DDD6FE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-xs text-lg shrink-0">
              📁
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Download Full Project as One Folder (.ZIP)</h4>
              <p className="text-[11px] text-slate-500">
                Includes Flutter Mobile App + React Web App + College Viva Report & Schema in one archive.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadProjectZip}
            disabled={isDownloadingZip}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            <FolderArchive size={14} className="text-purple-300" />
            <span>{isDownloadingZip ? 'Packaging ZIP...' : 'Download Project Folder'}</span>
          </button>
        </div>
      </div>

      {/* Supabase Cloud Connection Guide */}
      <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-3xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h3 className="font-extrabold text-slate-800 text-sm">
              Connecting Supabase for Cloud Multi-Device Sync
            </h3>
          </div>
          <button
            onClick={handleCopySql}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            {copiedSql ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          SmartSpend currently uses high-speed persistent browser storage (Offline First). To enable multi-device sync, add your Supabase project credentials in your environment (<code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px]">VITE_SUPABASE_ANON_KEY</code>) and execute the schema above in the Supabase SQL editor.
        </p>

        <pre className="bg-white p-3.5 rounded-2xl border border-slate-200 text-slate-700 font-mono text-[11px] overflow-x-auto leading-relaxed">
          {supabaseSchemaSql}
        </pre>
      </div>
    </div>
  );
};
