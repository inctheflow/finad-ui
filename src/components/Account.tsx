import { useEffect, useState, type FormEvent } from 'react';
import { getAccount, updateAccount, changePassword } from '../api';
import type { AccountInfo } from '../types';

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was the make of your first car?",
  "What is your oldest sibling's middle name?",
  "What street did you grow up on?",
];

export default function Account() {
  const [info, setInfo]             = useState<AccountInfo | null>(null);
  const [phone, setPhone]           = useState('');
  const [secQuestion, setSecQuestion] = useState('');
  const [secAnswer, setSecAnswer]   = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [pwMsg, setPwMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [pwLoading, setPwLoading]   = useState(false);

  useEffect(() => {
    getAccount().then(data => {
      setInfo(data);
      setPhone(data.phone ?? '');
      setSecQuestion(data.security_question ?? SECURITY_QUESTIONS[0]);
    });
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const payload: Parameters<typeof updateAccount>[0] = { phone };
      if (secAnswer.trim()) {
        payload.security_question = secQuestion;
        payload.security_answer   = secAnswer;
      }
      await updateAccount(payload);
      setInfo(prev => prev ? { ...prev, phone, security_question: secQuestion } : prev);
      setSecAnswer('');
      setProfileMsg({ text: 'Profile updated successfully.', ok: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Update failed';
      setProfileMsg({ text: msg, ok: false });
    } finally {
      setProfileLoading(false);
    }
  };

  const savePw = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ text: 'New passwords do not match.', ok: false });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ text: 'New password must be at least 6 characters.', ok: false });
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setPwMsg({ text: 'Password changed successfully.', ok: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Password change failed';
      setPwMsg({ text: msg, ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    color: '#1e293b',
    background: 'white',
  };

  return (
    <div className="page">
      <h1>Account</h1>
      <p className="subtitle">Manage your profile and security settings.</p>

      {/* ── Profile info ────────────────────────────────────────────── */}
      <div className="chart-box" style={{ marginBottom: '1.5rem' }}>
        <h2>Profile</h2>
        {info && (
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: '1.25rem', marginTop: '0.5rem' }}>
            Signed in as <strong style={{ color: '#1e293b' }}>{info.email}</strong>
          </p>
        )}

        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Security question
            </label>
            <select
              value={secQuestion}
              onChange={e => setSecQuestion(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            >
              {SECURITY_QUESTIONS.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Security answer {info?.security_question ? <span style={{ color: '#64748b', fontWeight: 400 }}>(leave blank to keep current)</span> : null}
            </label>
            <input
              type="text"
              value={secAnswer}
              onChange={e => setSecAnswer(e.target.value)}
              placeholder="Your answer"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {profileMsg && (
            <div className={profileMsg.ok ? 'success' : 'error'} style={{ marginTop: 0 }}>
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 24px',
              background: profileLoading ? '#a5b4fc' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: profileLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {profileLoading ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>

      {/* ── Change password ─────────────────────────────────────────── */}
      <div className="chart-box">
        <h2>Change password</h2>
        <form onSubmit={savePw} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Current password
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              New password
            </label>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {pwMsg && (
            <div className={pwMsg.ok ? 'success' : 'error'} style={{ marginTop: 0 }}>
              {pwMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 24px',
              background: pwLoading ? '#a5b4fc' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: pwLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {pwLoading ? 'Changing…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
