import { useState, useEffect } from 'react';
import { tellerEnroll, tellerSync, getTellerAccounts, disconnectTellerAccount } from '../api';
import type { TellerAccount } from '../types';

const APP_ID = import.meta.env.VITE_TELLER_APP_ID as string | undefined;
const ENV    = (import.meta.env.VITE_TELLER_ENV ?? 'sandbox') as 'sandbox' | 'development' | 'production';

export default function BankConnect() {
  const [accounts, setAccounts]   = useState<TellerAccount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(false);
  const [message, setMessage]     = useState('');
  const [error, setError]         = useState('');
  const [appId, setAppId]         = useState(APP_ID ?? '');

  useEffect(() => { loadAccounts(); }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      setAccounts(await getTellerAccounts());
    } catch {
      setError('Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  }

  function openTellerConnect() {
    if (!appId.trim()) {
      setError('Enter your Teller Application ID first.');
      return;
    }
    setError('');
    setMessage('');

    const connect = TellerConnect.setup({
      applicationId: appId.trim(),
      environment: ENV,
      products: ['transactions'],
      onSuccess: async (enrollment) => {
        setMessage('Bank connected — enrolling…');
        try {
          const result = await tellerEnroll(
            enrollment.accessToken,
            enrollment.enrollment.id,
            enrollment.enrollment.institution.name,
          );
          setMessage(result.message);
          await loadAccounts();
        } catch (err: any) {
          setError(err.response?.data?.error ?? 'Enrollment failed.');
          setMessage('');
        }
      },
      onExit: () => setMessage(''),
      onFailure: () => setError('Teller Connect encountered an error.'),
    });

    connect.open();
  }

  async function handleSync() {
    setSyncing(true);
    setError('');
    setMessage('');
    try {
      const result = await tellerSync();
      setMessage(result.message);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect(id: number, name: string) {
    if (!confirm(`Disconnect ${name}?`)) return;
    try {
      await disconnectTellerAccount(id);
      setMessage('Account disconnected.');
      await loadAccounts();
    } catch {
      setError('Failed to disconnect account.');
    }
  }

  return (
    <div className="page">
      <h1>Connected Banks</h1>
      <p className="subtitle">Link your bank accounts via Teller to automatically import transactions</p>

      {/* App ID input — only shown if not pre-configured via env var */}
      {!APP_ID && (
        <div className="bank-config">
          <label className="bank-config-label">Teller Application ID</label>
          <div className="bank-config-row">
            <input
              className="bank-config-input"
              placeholder="app_xxxxxxxxxxxxxxxx"
              value={appId}
              onChange={e => setAppId(e.target.value)}
            />
            <a
              className="bank-config-hint"
              href="https://teller.io/settings/application"
              target="_blank"
              rel="noreferrer"
            >
              Find in Teller dashboard ↗
            </a>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bank-actions">
        <button className="btn-primary" onClick={openTellerConnect}>
          + Connect Bank
        </button>
        <button
          className="btn-secondary"
          onClick={handleSync}
          disabled={syncing || accounts.length === 0}
        >
          {syncing ? 'Syncing…' : 'Sync Transactions'}
        </button>
      </div>

      {message && <div className="success">{message}</div>}
      {error   && <div className="error">{error}</div>}

      {/* Account list */}
      <div className="bank-list">
        {loading ? (
          <p className="bank-empty">Loading…</p>
        ) : accounts.length === 0 ? (
          <div className="bank-empty-box">
            <p className="bank-empty">No banks connected yet.</p>
            <p className="bank-empty-sub">
              Click <strong>Connect Bank</strong> and log in with your bank credentials via the
              secure Teller flow. Your credentials are never seen by this app.
            </p>
          </div>
        ) : (
          accounts.map(acct => (
            <div key={acct.id} className="bank-card">
              <div className="bank-card-left">
                <div className="bank-card-name">{acct.institution_name}</div>
                <div className="bank-card-meta">
                  {acct.account_name}
                  {acct.last_four && <span className="bank-card-mask"> ••••{acct.last_four}</span>}
                </div>
              </div>
              <div className="bank-card-right">
                <span className="badge badge-Others" style={{ textTransform: 'capitalize' }}>
                  {acct.account_type}
                </span>
                <button
                  className="btn-danger-sm"
                  onClick={() => handleDisconnect(acct.id, acct.institution_name)}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bank-note">
        <strong>Sandbox mode:</strong> use username <code>username</code> / password <code>password</code> to
        test with simulated bank data. No real accounts are accessed.
      </div>
    </div>
  );
}
