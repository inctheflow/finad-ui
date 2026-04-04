import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { getTransactions } from '../api';
import type { Transaction } from '../types';

// recharts needs data as {name, value} objects
interface ChartData {
  name: string;
  value: number;
}

// category colors for the pie chart
const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6',
                 '#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4'];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // useEffect with [] runs once when component first mounts
  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error)   return <div className="page"><p className="error">{error}</p></div>;

  // compute category totals from raw transactions
  const categoryMap = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData: ChartData[] = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  // compute monthly totals
  const monthMap = transactions.reduce((acc, t) => {
    // convert MM/DD/YYYY to YYYY-MM for grouping
    const [month, , year] = t.date.split('/');
    const key = `${year}-${month}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthData: ChartData[] = Object.entries(monthMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="page">
      <h1>Dashboard</h1>

      {/* stat cards */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total transactions</div>
          <div className="stat-value">{transactions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total spent</div>
          <div className="stat-value">${totalSpent.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categories</div>
          <div className="stat-value">{categoryData.length}</div>
        </div>
      </div>

      {/* charts side by side */}
      <div className="charts">
        <div className="chart-box">
          <h2>Spending by category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name"
                   cx="50%" cy="50%" outerRadius={100} label={({name}) => name}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Monthly spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v: any) => `$${v.toFixed(2)}`} />
              <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}