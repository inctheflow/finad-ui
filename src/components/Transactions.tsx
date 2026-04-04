import { useEffect, useState } from 'react';
import { getTransactions } from '../api';
import type { Transaction } from '../types';
export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState('');

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error)   return <div className="page"><p className="error">{error}</p></div>;

  // filter by description or category — case insensitive
  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="page">
      <h1>Transactions</h1>
      <input
        className="search"
        placeholder="Search by description or category..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <p className="subtitle">{filtered.length} of {transactions.length} transactions</p>

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
    </div>
  );
}