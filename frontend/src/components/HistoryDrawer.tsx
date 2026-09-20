import React, { useEffect, useState } from 'react';
import { SessionSummary } from '../types';
import { getHistory } from '../services/api';
import { IconClock, IconX } from './Icons';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, onSelectSession }) => {
  const [history, setHistory] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getHistory()
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '420px',
      background: 'rgba(15, 23, 42, 0.96)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-subtle)',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Drawer Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconClock className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Saved Decision History</h3>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <IconX className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No saved decisions yet. Evaluate a product to record decisions.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((item) => (
              <div
                key={item.session_id}
                onClick={() => {
                  onSelectSession(item.session_id);
                  onClose();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-emerald)';
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                    {item.product_name}
                  </strong>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    {item.recommended_pathway.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  {item.category.replace('_', ' ')} • {new Date(item.timestamp).toLocaleDateString()}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  "{item.raw_query_snippet}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
