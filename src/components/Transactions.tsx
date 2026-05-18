import { useEffect, useRef, useState } from 'react';
import { getTransactions } from '../api';
import { uploadPdf } from '../api';
import type { Transaction } from '../types';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState('');

  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting]   = useState(false);
  const [importMsg, setImportMsg]   = useState('');
  const [importErr, setImportErr]   = useState('');
  const [dragging, setDragging]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTransactions = () =>
    getTransactions()
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setLoading(false));

  useEffect(() => { loadTransactions(); }, []);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setImportErr('Please upload a PDF file');
      return;
    }
    setImporting(true);
    setImportMsg('');
    setImportErr('');
    try {
      const result = await uploadPdf(file);
      setImportMsg(result.message);
      // reload transactions to show newly imported ones
      getTransactions().then(setTransactions).catch(() => {});
    } catch (err: any) {
      setImportErr(err.response?.data?.error || 'Upload failed');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (loading) return <div className="page"><p>Loading…</p></div>;
  if (error)   return <div className="page"><p className="error">{error}</p></div>;

  const q = filter.toLowerCase();
  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.amount.toFixed(2).includes(q) ||
    t.date.includes(q)
  );

  return (
    <div className="page">
      {/* ── Header row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
        <h1 style={{ margin: 0 }}>Transactions</h1>
        <button
          onClick={() => { setShowImport(o => !o); setImportMsg(''); setImportErr(''); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.45rem 0.9rem',
            border: `1.5px solid ${showImport ? '#6366f1' : '#e2e8f0'}`,
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: showImport ? '#6366f1' : '#475569',
            background: showImport ? '#eef2ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import PDF
        </button>
      </div>

      {/* ── Import panel ───────────────────────────────────────── */}
      {showImport && (
        <div style={{ marginBottom: '1.25rem' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={onFileChange}
            disabled={importing}
          />

          {/* Drop zone */}
          <div
            onClick={() => !importing && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? '#6366f1' : '#c7d2fe'}`,
              borderRadius: '12px',
              background: dragging ? '#eef2ff' : '#fafbff',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: importing ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                 stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                 style={{ marginBottom: '0.75rem', opacity: importing ? 0.4 : 1 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.3rem' }}>
              {importing ? 'Processing…' : 'Drop your PDF here, or click to browse'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Supports any bank or credit card PDF statement
            </div>
          </div>

          {importMsg && (
            <div className="success" style={{ marginTop: '0.75rem' }}>{importMsg}</div>
          )}
          {importErr && (
            <div className="error" style={{ marginTop: '0.75rem' }}>{importErr}</div>
          )}
        </div>
      )}

      {/* ── Search + count ─────────────────────────────────────── */}
      <input
        className="search"
        placeholder="Search by description, category, amount, or date..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <p className="subtitle">{filtered.length} of {transactions.length} transactions</p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
               style={{ marginBottom: '0.75rem', opacity: 0.4 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#64748b' }}>No transactions match your search</div>
          {filter && (
            <button
              onClick={() => setFilter('')}
              style={{ marginTop: '0.75rem', padding: '0.35rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', background: '#fff', cursor: 'pointer' }}
            >
              Clear search
            </button>
          )}
        </div>
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
            {filtered.map((t, i) => (
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
  );
}
