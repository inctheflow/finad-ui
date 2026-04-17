import { useState } from 'react';
import Auth         from './components/Auth';
import Upload       from './components/Upload';
import Dashboard    from './components/Dashboard';
import Summary      from './components/Summary';
import Transactions from './components/Transactions';
import Cash         from './components/Cash';
import Chat         from './components/Chat';
import Account      from './components/Account';
import './App.css';

type Page = 'dashboard' | 'transactions' | 'summary' | 'upload' | 'cash' | 'chat' | 'account';

const NAV_LABELS: Record<Page, string> = {
  dashboard:    'Dashboard',
  transactions: 'Transactions',
  summary:      'Summary',
  upload:       'Upload',
  cash:         'Cash',
  chat:         'AI Chat',
  account:      'Account',
};

export default function App() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [page, setPage] = useState<Page>('dashboard');

  const handleAuth   = (t: string) => { setToken(t); setPage('dashboard'); };
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  if (!token) return <Auth onAuth={handleAuth} />;

  return (
    <div className="app">
      <nav className="nav">
        <span className="nav-brand">FINAD</span>
        <div className="nav-links">
          {(Object.keys(NAV_LABELS) as Page[]).map(p => (
            <button
              key={p}
              className={`nav-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {NAV_LABELS[p]}
            </button>
          ))}
        </div>
        <button className="nav-btn" onClick={handleLogout}>Logout</button>
      </nav>

      <main>
        {page === 'dashboard'    && <Dashboard />}
        {page === 'transactions' && <Transactions />}
        {page === 'summary'      && <Summary />}
        {page === 'upload'       && <Upload />}
        {page === 'cash'         && <Cash />}
        {page === 'chat'         && <Chat />}
        {page === 'account'      && <Account />}
      </main>
    </div>
  );
}
