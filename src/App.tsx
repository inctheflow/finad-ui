import { useState, type ReactElement } from 'react';
import Auth         from './components/Auth';
import Dashboard    from './components/Dashboard';
import Summary      from './components/Summary';
import Transactions from './components/Transactions';
import Cash         from './components/Cash';
import Chat         from './components/Chat';
import Account      from './components/Account';
import BankConnect  from './components/BankConnect';
import './App.css';

type Page = 'dashboard' | 'transactions' | 'summary' | 'cash' | 'chat' | 'bank' | 'account';

const NAV_ITEMS: { page: Page; label: string; icon: ReactElement }[] = [
  {
    page: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    page: 'transactions',
    label: 'Transactions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    page: 'summary',
    label: 'AI Summary',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
        <path d="M8 12h8M8 8h5M8 16h6" />
      </svg>
    ),
  },
  {
    page: 'chat',
    label: 'AI Chat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    page: 'cash',
    label: 'Cash',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2m0 8v2M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1 2-2.5 2.5S9 15 9 16.5h6" />
      </svg>
    ),
  },
  {
    page: 'bank',
    label: 'Banks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="22" x2="21" y2="22" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    ),
  },
  {
    page: 'account',
    label: 'Account',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function App() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [page, setPage]           = useState<Page>('dashboard');
  const [sidebarOpen, setSidebar] = useState(true);

  const handleAuth   = (t: string) => { setToken(t); setPage('dashboard'); };
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  if (!token) return <Auth onAuth={handleAuth} />;

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-brand">FINAD</span>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebar(o => !o)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen
                ? <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>
                : <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>
              }
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ page: p, label, icon }) => (
            <button
              key={p}
              className={`sidebar-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
              title={!sidebarOpen ? label : undefined}
            >
              <span className="sidebar-icon">{icon}</span>
              {sidebarOpen && <span className="sidebar-label">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-btn sidebar-logout"
            onClick={handleLogout}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {sidebarOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {page === 'dashboard'    && <Dashboard onChatOpen={() => setPage('chat')} />}
        {page === 'transactions' && <Transactions />}
        {page === 'summary'      && <Summary />}
        {page === 'cash'         && <Cash />}
        {page === 'chat'         && <Chat />}
        {page === 'bank'         && <BankConnect />}
        {page === 'account'      && <Account />}
      </main>
    </div>
  );
}
