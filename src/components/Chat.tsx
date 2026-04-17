import { useEffect, useRef, useState, type FormEvent } from 'react';
import { sendChatMessage } from '../api';
import type { ChatMessage } from '../types';

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hi! Ask me anything about your transactions, spending habits, or budgeting advice.' },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(text);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      <h1>AI Assistant</h1>
      <p className="subtitle">Ask questions about your spending, get budgeting advice, or explore your finances.</p>

      {/* Message list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem 0',
        minHeight: 0,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '72%',
              padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#6366f1' : 'white',
              color: msg.role === 'user' ? 'white' : '#1e293b',
              fontSize: 14,
              lineHeight: 1.6,
              border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '16px 16px 16px 4px',
              background: 'white',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontSize: 14,
            }}>
              Thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={send} style={{
        display: 'flex',
        gap: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #e2e8f0',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your spending…"
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            background: 'white',
            color: '#1e293b',
          }}
          onFocus={e => (e.target.style.borderColor = '#6366f1')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            background: loading || !input.trim() ? '#a5b4fc' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
