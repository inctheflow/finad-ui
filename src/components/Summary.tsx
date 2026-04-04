import { useEffect, useState } from 'react';
import { getSummary } from '../api';

export default function Summary() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getSummary()
      .then(setSummary)
      .catch(() => setError('Failed to load summary'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error)   return <div className="page"><p className="error">{error}</p></div>;

  return (
    <div className="page">
      <h1>Spending Summary</h1>
      {/* pre preserves whitespace and newlines from your Rust formatted string */}
      <pre className="summary-text">{summary}</pre>
    </div>
  );
}