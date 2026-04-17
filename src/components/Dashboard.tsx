import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { getTransactions, getAnalytics } from '../api';
import type { Transaction, AnalyticsData } from '../types';

interface ChartData { name: string; value: number; }

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6',
                 '#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4'];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics]       = useState<AnalyticsData | null>(null);
  const [txLoading, setTxLoading]       = useState(true);
  const [aiLoading, setAiLoading]       = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setTxLoading(false));
  }, []);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch(() => {}) // fails silently if GEMINI_API_KEY not set
      .finally(() => setAiLoading(false));
  }, []);

  if (txLoading) return <div className="page"><p>Loading…</p></div>;
  if (error)     return <div className="page"><p className="error">{error}</p></div>;

  const categoryMap = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData: ChartData[] = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  const monthMap = transactions.reduce((acc, t) => {
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

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
        <div className="stat-card">
          <div className="stat-label">Monthly average</div>
          <div className="stat-value">
            {aiLoading
              ? '…'
              : analytics
              ? `$${analytics.monthly_average.toFixed(2)}`
              : '—'}
          </div>
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────── */}
      <div className="charts">
        <div className="chart-box">
          <h2>Spending by category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name"
                   cx="50%" cy="50%" outerRadius={100}
                   label={({ name, x, y }) => (
                     <text x={x} y={y} fill="#000000" textAnchor="middle"
                           dominantBaseline="central" fontSize={12}>{name}</text>
                   )}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toFixed(2)}` : v} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Monthly spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthData}>
              <XAxis dataKey="name" tick={{ fill: '#000000' }} />
              <YAxis tick={{ fill: '#000000' }} />
              <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toFixed(2)}` : v} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top expenses ───────────────────────────────────────────── */}
      {analytics && analytics.top_expenses.length > 0 && (
        <div className="chart-box" style={{ marginTop: '1.5rem' }}>
          <h2>Top expenses</h2>
          <table className="tx-table" style={{ marginTop: '0.75rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top_expenses.map((e, i) => (
                <tr key={i}>
                  <td>{e.date}</td>
                  <td className="desc-cell">{e.description}</td>
                  <td><span className={`badge badge-${e.category}`}>{e.category}</span></td>
                  <td className="amount">${e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── AI tips ────────────────────────────────────────────────── */}
      {aiLoading && (
        <div className="chart-box" style={{ marginTop: '1.5rem' }}>
          <h2>AI Insights</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: '0.5rem' }}>
            Generating personalised tips…
          </p>
        </div>
      )}

      {!aiLoading && analytics && analytics.tips.length > 0 && (
        <div className="chart-box" style={{ marginTop: '1.5rem' }}>
          <h2>AI Insights</h2>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.tips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}>
                <span style={{
                  flexShrink: 0,
                  width: 24, height: 24,
                  background: '#6366f1',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {i + 1}
                </span>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!aiLoading && !analytics && (
        <div className="chart-box" style={{ marginTop: '1.5rem' }}>
          <h2>AI Insights</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: '0.5rem' }}>
            Set <code>ANTHROPIC_API_KEY</code> on the backend to enable AI tips.
          </p>
        </div>
      )}
    </div>
  );
}
