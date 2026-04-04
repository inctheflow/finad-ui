import { useState } from 'react';
import Upload       from './components/Upload';
import Dashboard    from './components/Dashboard';
import Summary      from './components/Summary';
import Transactions from './components/Transactions';
import './App.css';

// the four pages your nav can show
type Page = 'dashboard' | 'transactions' | 'summary' | 'upload';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="app">
      <nav className="nav">
        <span className="nav-brand">FINAD</span>
        <div className="nav-links">
          {(['dashboard','transactions','summary','upload'] as Page[]).map(p => (
            <button
              key={p}
              className={`nav-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {page === 'dashboard'    && <Dashboard />}
        {page === 'transactions' && <Transactions />}
        {page === 'summary'      && <Summary />}
        {page === 'upload'       && <Upload />}
      </main>
    </div>
  );
}