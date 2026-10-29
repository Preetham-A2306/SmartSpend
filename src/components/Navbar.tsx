import React from 'react';
import { Calendar, Plus, Menu, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface NavbarProps {
  userName: string;
  selectedMonth: { year: number; month: number };
  onMonthChange: (month: { year: number; month: number }) => void;
  onOpenAddModal: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenMobileMenu,
}) => {
  // Determine greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! 👋';
    if (hour < 17) return 'Good afternoon! ☀️';
    return 'Good evening! 🌙';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const monthLabel = new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    const newM = selectedMonth.month === 1 ? 12 : selectedMonth.month - 1;
    const newY = selectedMonth.month === 1 ? selectedMonth.year - 1 : selectedMonth.year;
    onMonthChange({ year: newY, month: newM });
  };

  const handleNextMonth = () => {
    const newM = selectedMonth.month === 12 ? 1 : selectedMonth.month + 1;
    const newY = selectedMonth.month === 12 ? selectedMonth.year + 1 : selectedMonth.year;
    onMonthChange({ year: newY, month: newM });
  };

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Welcome Area */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                {getGreeting()}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Let&rsquo;s make your money work smarter today, <span className="font-semibold text-slate-700">{userName}</span>.
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Month Selector Pill */}
          <div className="flex items-center bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-xl hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center space-x-1.5 px-3 text-xs font-bold text-slate-700">
              <Calendar size={13} className="text-[#8B5CF6]" />
              <span>{monthLabel}</span>
            </div>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-xl hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Primary + Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="bg-[#C4B5FD] hover:bg-[#B49EFA] text-[#4C1D95] font-bold py-2.5 px-4 sm:px-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 text-xs sm:text-sm active:scale-98 border border-[#A78BFA]/40"
          >
            <Plus size={16} className="text-[#4C1D95]" />
            <span className="font-extrabold">+ Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
