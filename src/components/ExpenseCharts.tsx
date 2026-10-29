import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CategorySummary, Transaction } from '../types/index.ts';
import { formatINR } from '../utils/finance.ts';

interface ExpenseChartsProps {
  incomeTotal: number;
  expenseTotal: number;
  categoryBreakdown: CategorySummary[];
  monthlyTrendData: { monthName: string; income: number; expense: number }[];
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  incomeTotal,
  expenseTotal,
  categoryBreakdown,
  monthlyTrendData,
}) => {
  // Bar chart data for Income vs Expense
  const comparisonData = [
    {
      name: 'Cashflow',
      Income: incomeTotal,
      Expenses: expenseTotal,
    },
  ];

  // Doughnut chart data
  const pieData = categoryBreakdown.map((item) => ({
    name: `${item.emoji} ${item.category}`,
    value: item.amount,
    percentage: item.percentage,
    color: item.color,
  }));

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-100 text-xs font-semibold">
          <p className="text-slate-600 mb-1">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {formatINR(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Income vs Expenses Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2">
              <span>📊</span>
              <span>Income vs. Expenses</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly cashflow comparison</p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="flex items-center text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#86EFAC] mr-1.5" /> Income
            </span>
            <span className="flex items-center text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5] mr-1.5" /> Expenses
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {incomeTotal === 0 && expenseTotal === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <span className="text-2xl mb-1">📉</span>
              <span>No transactions recorded for this period</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barGap={12} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Income" fill="#86EFAC" radius={[12, 12, 4, 4]} />
                <Bar dataKey="Expenses" fill="#FCA5A5" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Expense Distribution Doughnut Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2">
              <span>🍩</span>
              <span>Expense Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Category breakdown for expenses</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl">
            {categoryBreakdown.length} Categories
          </span>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {categoryBreakdown.length === 0 ? (
            <div className="text-center text-slate-400 text-xs">
              <span className="text-2xl mb-1 block">🛍️</span>
              <span>No expense records available</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-slate-700 text-xs font-semibold mr-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Monthly Spending Trend Line Chart (Full Width) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2">
              <span>📅</span>
              <span>Monthly Spending Trend</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Income vs expense patterns over recent months</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="monthName" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#F87171"
                strokeWidth={3}
                dot={{ r: 4, fill: '#F87171' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
