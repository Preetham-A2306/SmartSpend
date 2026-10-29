import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Settings as SettingsIcon,
  PlusCircle,
  Sparkles,
  TrendingUp,
  X,
  FolderArchive,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'transactions' | 'analytics' | 'budget' | 'files' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
    { id: 'transactions' as NavTab, label: 'All Transactions', icon: Receipt, emoji: '💳' },
    { id: 'analytics' as NavTab, label: 'Analytics & Reports', icon: PieChart, emoji: '📊' },
    { id: 'budget' as NavTab, label: 'Budget Planner', icon: Target, emoji: '🎯' },
    { id: 'files' as NavTab, label: 'Project Files (.ZIP)', icon: FolderArchive, emoji: '📁' },
    { id: 'settings' as NavTab, label: 'Settings', icon: SettingsIcon, emoji: '⚙️' },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 p-5 select-none justify-between">
      {/* Top Branding */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-xl shadow-xs">
              💸
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-800 text-lg tracking-tight">SmartSpend</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Personal Expense Tracker</span>
            </div>
          </div>
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quick Add Button in Sidebar */}
        <button
          onClick={() => {
            onOpenAddModal();
            if (isMobileOpen) onCloseMobile();
          }}
          className="w-full bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] font-bold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 border border-[#C4B5FD]/60 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <PlusCircle size={18} className="text-[#7C3AED]" />
          <span className="text-sm font-semibold">+ Add Transaction</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isMobileOpen) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#F3E8FF] text-[#6D28D9] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Motivational Pastel Card */}
      <div className="pt-4 border-t border-slate-100 mt-auto">
        <div className="bg-gradient-to-br from-[#FEF9C3]/70 to-[#FEF08A]/40 border border-[#FEF08A] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#854D0E] mb-1">
            <span className="text-sm">🌱</span>
            <span>Money Mindset</span>
          </div>
          <p className="text-xs text-[#713F12] font-medium leading-relaxed">
            &ldquo;Small savings today, big freedom tomorrow!&rdquo;
          </p>
          <div className="mt-2.5 flex items-center text-[11px] font-semibold text-[#854D0E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
            <span>Smart Budgeting Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 h-full bg-white shadow-2xl transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
