import { useEffect, useState, type FormEvent } from 'react';
import { getCashEntries, addCashEntry, deleteCashEntry } from '../api';
import type { CashResponse } from '../types';

export default function Cash() {
  const [data, setData]           = useState<CashResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Form state
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate]           = useState(today);
  const [amount, setAmount]       = useState('');
  const [entryType, setEntryType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');

  const load = () => {
    setLoading(true);
    getCashEntries()
      .then(setData)
      .catch(() => setError('Failed to load cash entries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid positive amount'); return; }
    setSubmitting(true);
    try {
      await addCashEntry(date, amt, entryType, description);
      setSuccess('Entry added');
      setAmount('');
      setDescription('');
      load();
    } catch {
      setError('Failed to add entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCashEntry(id);
      load();
    } catch {
      setError('Failed to delete entry');
    }
  };

  return (
    <div className="page">
      <h1>Cash Tracker</h1>
      <p className="subtitle">Log cash you receive or spend outside your card statements</p>

      {/* ── Add entry form ──────────────────────────────────────────── */}
      <div className="chart-box" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add entry</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>

          {/* Type toggle */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Type
            </div>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {(['expense', 'income'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEntryType(t)}
                  style={{
                    padding: '8px 18px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                    background: entryType === t
                      ? (t === 'income' ? '#22c55e' : '#ef4444')
                      : '#f8fafc',
                    color: entryType === t ? 'white' : '#64748b',
                    transition: 'all 0.15s',
                  }}
                >
                  {t === 'income' ? 'Cash In' : 'Cash Out'}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Date
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1e293b', background: '#eff6ff' }}
            />
          </div>

          {/* Amount */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Amount ($)
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, width: 120, color: '#1e293b', background: '#eff6ff' }}
            />
          </div>

          {/* Description */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Description (optional)
            </div>
            <input
              type="text"
              placeholder="e.g. Freelance payment"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1e293b', background: '#eff6ff' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '8px 24px',
              background: submitting ? '#a5b4fc' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </form>

        {error   && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </div>

      {/* ── Summary cards ───────────────────────────────────────────── */}
      {data && (
        <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-label">Total cash in</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>+${data.total_income.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total cash out</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>-${data.total_expense.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Net</div>
            <div className="stat-value" style={{ color: data.net >= 0 ? '#16a34a' : '#dc2626' }}>
              {data.net >= 0 ? '+' : ''}${data.net.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* ── Entries table ────────────────────────────────────────────── */}
      {loading ? (
        <p>Loading…</p>
      ) : data && data.entries.length === 0 ? (
        <p style={{ color: '#64748b' }}>No cash entries yet. Add one above.</p>
      ) : data && (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>
                  <span className="badge" style={{
                    background: entry.entry_type === 'income' ? '#dcfce7' : '#fee2e2',
                    color: entry.entry_type === 'income' ? '#166534' : '#991b1b',
                  }}>
                    {entry.entry_type === 'income' ? 'Cash In' : 'Cash Out'}
                  </span>
                </td>
                <td className="desc-cell">{entry.description || '—'}</td>
                <td className="amount" style={{ color: entry.entry_type === 'income' ? '#16a34a' : '#dc2626' }}>
                  {entry.entry_type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #fca5a5',
                      color: '#ef4444',
                      borderRadius: 6,
                      padding: '3px 10px',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
