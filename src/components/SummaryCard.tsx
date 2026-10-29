import React from 'react';
import { formatINR } from '../utils/finance.ts';

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  monthlyExpenseCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalBalance,
  totalIncome,
  totalExpenses,
  totalSavings,
  savingsRate,
  monthlyExpenseCount,
}) => {
  const cards = [
    {
      title: 'Total Balance',
      amount: totalBalance,
      emoji: '💰',
      badge: totalBalance >= 0 ? 'Safe & Healthy' : 'Deficit Alert',
      badgeType: totalBalance >= 0 ? 'green' : 'red',
      pastelBg: 'bg-[#F5F3FF]',
      borderColor: 'border-[#DDD6FE]',
      accentBg: 'bg-[#C4B5FD]/40',
      textColor: 'text-[#4C1D95]',
      subtext: 'Current Net Worth',
    },
    {
      title: 'Total Income',
      amount: totalIncome,
      emoji: '📈',
      badge: 'Inflow',
      badgeType: 'green',
      pastelBg: 'bg-[#F0FDF4]',
      borderColor: 'border-[#BBF7D0]',
      accentBg: 'bg-[#BBF7D0]/50',
      textColor: 'text-[#14532D]',
      subtext: 'All Recorded Inflows',
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses,
      emoji: '💸',
      badge: `${monthlyExpenseCount} Expenses`,
      badgeType: 'coral',
      pastelBg: 'bg-[#FEF2F2]',
      borderColor: 'border-[#FECACA]',
      accentBg: 'bg-[#FECACA]/50',
      textColor: 'text-[#7F1D1D]',
      subtext: 'All Recorded Outflows',
    },
    {
      title: 'Total Savings',
      amount: totalSavings,
      emoji: '🐷',
      badge: `${savingsRate}% saved`,
      badgeType: 'blue',
      pastelBg: 'bg-[#F0F9FF]',
      borderColor: 'border-[#BAE6FD]',
      accentBg: 'bg-[#BAE6FD]/50',
      textColor: 'text-[#0C4A6E]',
      subtext: 'Income minus Expenses',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`${c.pastelBg} ${c.borderColor} border rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden`}
        >
          {/* Top Emoji and Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-2xl ${c.accentBg} flex items-center justify-center text-xl shadow-2xs`}>
              {c.emoji}
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                c.badgeType === 'green'
                  ? 'bg-emerald-100 text-emerald-800'
                  : c.badgeType === 'coral'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {c.badge}
            </span>
          </div>

          {/* Amount and Title */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {c.title}
            </span>
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${c.textColor}`}>
              {formatINR(c.amount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{c.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
