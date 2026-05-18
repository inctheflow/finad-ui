import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { getTransactions, getAnalytics } from '../api';
import type { Transaction, AnalyticsData } from '../types';

interface ChartData { name: string; value: number; }

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6',
                 '#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4',
                 '#a78bfa','#34d399'];

/** Collapse slices below `threshold`% of total into "Others" */
function collapseSmall(data: ChartData[], threshold = 3): ChartData[] {
  const total = data.reduce((s, d) => s + d.value, 0);
  const main: ChartData[] = [];
  let collapsed = 0;
  for (const d of data) {
    if ((d.value / total) * 100 >= threshold) main.push(d);
    else collapsed += d.value;
  }
  if (collapsed > 0) {
    const existing = main.find(d => d.name === 'Others');
    if (existing) existing.value = Math.round((existing.value + collapsed) * 100) / 100;
    else main.push({ name: 'Others', value: Math.round(collapsed * 100) / 100 });
  }
  return main;
}

export default function Dashboard({ onChatOpen }: { onChatOpen?: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics]       = useState<AnalyticsData | null>(null);
  const [txLoading, setTxLoading]       = useState(true);
  const [error, setError]               = useState('');
  const [fromDate, setFromDate]             = useState('');
  const [toDate, setToDate]                 = useState('');
  const [selectedCategories, setCategories] = useState<Set<string>>(new Set());
  const [minAmount, setMinAmount]           = useState('');
  const [maxAmount, setMaxAmount]           = useState('');
  const [filterOpen, setFilterOpen]         = useState(false);
  const [analyticsError, setAnalyticsError] = useState(false);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setTxLoading(false));
  }, []);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalyticsError(true));
  }, []);

  if (txLoading) return <div className="page"><p>Loading…</p></div>;
  if (error)     return <div className="page"><p className="error">{error}</p></div>;

  // Convert MM/DD/YYYY → YYYY-MM-DD for comparison
  const toIso = (d: string) => {
    const [m, day, y] = d.split('/');
    return `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const filteredTx = transactions.filter(t => {
    const iso = toIso(t.date);
    if (fromDate && iso < fromDate) return false;
    if (toDate   && iso > toDate)   return false;
    if (selectedCategories.size > 0 && !selectedCategories.has(t.category)) return false;
    if (minAmount !== '' && t.amount < parseFloat(minAmount)) return false;
    if (maxAmount !== '' && t.amount > parseFloat(maxAmount)) return false;
    return true;
  });

  // Bounds
  const allIso = transactions.map(t => toIso(t.date)).sort();
  const minDate = allIso[0] ?? '';
  const maxDate = allIso[allIso.length - 1] ?? '';

  const allCategories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const activeFilterCount =
    (fromDate || toDate ? 1 : 0) +
    (selectedCategories.size > 0 ? 1 : 0) +
    (minAmount || maxAmount ? 1 : 0);

  const clearAllFilters = () => {
    setFromDate(''); setToDate('');
    setCategories(new Set());
    setMinAmount(''); setMaxAmount('');
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const categoryMap = filteredTx.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData: ChartData[] = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  const monthMap = filteredTx.reduce((acc, t) => {
    const [month, , year] = t.date.split('/');
    const key = `${year}-${month}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthData: ChartData[] = Object.entries(monthMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalSpent = filteredTx.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="page" style={{ paddingBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button
          onClick={() => setFilterOpen(o => !o)}
          title="Filters"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.45rem 0.9rem',
            border: `1.5px solid ${activeFilterCount > 0 ? '#6366f1' : '#e2e8f0'}`,
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: activeFilterCount > 0 ? '#6366f1' : '#475569',
            background: activeFilterCount > 0 ? '#eef2ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#6366f1', color: '#fff',
              fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter panel ───────────────────────────────────────────── */}
      {filterOpen && (
        <div style={{
          padding: '1rem 1.1rem',
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>

          {/* Date range */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Date range
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>From</label>
                <input
                  type="date"
                  value={fromDate}
                  min={minDate}
                  max={toDate || maxDate}
                  onChange={e => setFromDate(e.target.value)}
                  style={{ padding: '0.38rem 0.6rem', border: '1.5px solid #c7d2fe', borderRadius: '8px', fontSize: '0.875rem', color: '#1e293b', background: '#fff', cursor: 'pointer', outline: 'none' }}
                />
              </div>
              <span style={{ color: '#94a3b8' }}>—</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>To</label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || minDate}
                  max={maxDate}
                  onChange={e => setToDate(e.target.value)}
                  style={{ padding: '0.38rem 0.6rem', border: '1.5px solid #c7d2fe', borderRadius: '8px', fontSize: '0.875rem', color: '#1e293b', background: '#fff', cursor: 'pointer', outline: 'none' }}
                />
              </div>
              {(fromDate || toDate) && (
                <button onClick={() => { setFromDate(''); setToDate(''); }}
                  style={{ padding: '0.35rem 0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', background: '#fff', cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e2e8f0' }} />

          {/* Category */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Category
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {allCategories.map(cat => {
                const active = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`,
                      background: active ? '#6366f1' : '#fff',
                      color: active ? '#fff' : '#475569',
                      textTransform: 'capitalize',
                      transition: 'all 0.12s',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
              {selectedCategories.size > 0 && (
                <button onClick={() => setCategories(new Set())}
                  style={{ padding: '0.3rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', background: '#fff', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e2e8f0' }} />

          {/* Amount range */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Amount
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Min $</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  style={{ width: '90px', padding: '0.38rem 0.6rem', border: '1.5px solid #c7d2fe', borderRadius: '8px', fontSize: '0.875rem', color: '#1e293b', background: '#fff', outline: 'none' }}
                />
              </div>
              <span style={{ color: '#94a3b8' }}>—</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Max $</label>
                <input
                  type="number"
                  min="0"
                  placeholder="∞"
                  value={maxAmount}
                  onChange={e => setMaxAmount(e.target.value)}
                  style={{ width: '90px', padding: '0.38rem 0.6rem', border: '1.5px solid #c7d2fe', borderRadius: '8px', fontSize: '0.875rem', color: '#1e293b', background: '#fff', outline: 'none' }}
                />
              </div>
              {(minAmount || maxAmount) && (
                <button onClick={() => { setMinAmount(''); setMaxAmount(''); }}
                  style={{ padding: '0.35rem 0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', background: '#fff', cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Divider + footer */}
          {activeFilterCount > 0 && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>
                  {filteredTx.length} transaction{filteredTx.length !== 1 ? 's' : ''} match
                </span>
                <button onClick={clearAllFilters}
                  style={{ padding: '0.35rem 0.85rem', border: '1.5px solid #fca5a5', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', background: '#fff5f5', cursor: 'pointer' }}>
                  Clear all filters
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── AI Robot banner ────────────────────────────────────────── */}
      <div
        onClick={onChatOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)',
          border: '1.5px solid #c7d2fe',
          borderRadius: '14px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.18)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      >
        {/* Robot */}
        <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <rect x="26" y="2" width="4" height="8" rx="2" fill="#6366f1"/>
          <circle cx="28" cy="2" r="3" fill="#818cf8"/>
          <rect x="10" y="10" width="36" height="26" rx="8" fill="#6366f1"/>
          <rect x="16" y="18" width="8" height="6" rx="3" fill="#fff"/>
          <rect x="32" y="18" width="8" height="6" rx="3" fill="#fff"/>
          <circle cx="20" cy="21" r="2" fill="#4f46e5"/>
          <circle cx="36" cy="21" r="2" fill="#4f46e5"/>
          <circle cx="21" cy="20" r="0.8" fill="#fff"/>
          <circle cx="37" cy="20" r="0.8" fill="#fff"/>
          <rect x="18" y="28" width="20" height="3" rx="1.5" fill="#818cf8"/>
          <rect x="21" y="28" width="4" height="3" rx="1" fill="#a5b4fc"/>
          <rect x="27" y="28" width="4" height="3" rx="1" fill="#a5b4fc"/>
          <rect x="33" y="28" width="4" height="3" rx="1" fill="#a5b4fc"/>
          <rect x="14" y="38" width="28" height="14" rx="6" fill="#818cf8"/>
          <circle cx="28" cy="45" r="3" fill="#6366f1"/>
          <circle cx="28" cy="45" r="1.5" fill="#c7d2fe"/>
          <rect x="6" y="18" width="5" height="10" rx="2.5" fill="#818cf8"/>
          <rect x="45" y="18" width="5" height="10" rx="2.5" fill="#818cf8"/>
        </svg>

        {/* Text */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#4338ca', marginBottom: '2px' }}>
            Chat with AI
          </div>
          <div style={{ fontSize: '12px', color: '#6366f1' }}>
            Ask your AI assistant about your spending, trends, or tips
          </div>
        </div>

        {/* Arrow */}
        <svg style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.5 }} width="16" height="16" viewBox="0 0 24 24"
             fill="none" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total transactions</div>
          <div className="stat-value">{filteredTx.length}</div>
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
            {analytics
              ? `$${analytics.monthly_average.toFixed(2)}`
              : analyticsError
                ? <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>Failed to load</span>
                : '—'}
          </div>
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────── */}
      {filteredTx.length === 0 ? (
        <div className="charts">
          {['Spending by category', 'Monthly spending'].map(title => (
            <div key={title} className="chart-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', gap: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>{title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No transactions match the selected filters.</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="charts">
          <div className="chart-box">
            <h2>Spending by category</h2>
            {(() => {
              const pieData = collapseSmall(categoryData);
              const total = pieData.reduce((s, d) => s + d.value, 0);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name"
                           cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                           paddingAngle={2} startAngle={90} endAngle={-270}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toFixed(2)}` : v} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1,
                               display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem' }}>
                    {pieData.map((d, i) => (
                      <li key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                       background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: '#64748b', textTransform: 'capitalize', whiteSpace: 'nowrap',
                                       overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
                        <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                          {((d.value / total) * 100).toFixed(0)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
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
      )}

      {/* ── Filtered transactions list (shown when filters are active) ── */}
      {activeFilterCount > 0 && (
        <div className="chart-box" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Filtered transactions</h2>
            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>
              {filteredTx.length} result{filteredTx.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filteredTx.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>No transactions match the selected filters.</p>
          ) : (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx
                  .slice()
                  .sort((a, b) => toIso(b.date).localeCompare(toIso(a.date)))
                  .map((t, i) => (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td className="desc-cell">{t.description}</td>
                      <td><span className={`badge badge-${t.category}`}>{t.category}</span></td>
                      <td className="amount">${t.amount.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Top expenses (shown when no filters are active) ─────────── */}
      {activeFilterCount === 0 && analytics && analytics.top_expenses.length > 0 && (
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


    </div>
  );
}
