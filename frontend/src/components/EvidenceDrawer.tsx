import React, { useState } from 'react';
import { EvidenceItem } from '../types';
import { IconBookOpen, IconCheckCircle, IconExternalLink, IconChevronDown } from './Icons';

interface EvidenceDrawerProps {
  evidence: EvidenceItem[];
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidence }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="glass-panel" style={{
      padding: '1.75rem',
      marginBottom: '1.75rem',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(9, 22, 15, 0.72)',
      border: '1px solid rgba(16, 185, 129, 0.18)'
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)'
          }}>
            <IconBookOpen className="w-5 h-5" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Grounding Sustainability Evidence</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({evidence.length} Sources)</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Empirical lifecycle studies retrieved from curated sustainability knowledge base.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span className="badge badge-emerald">
            <IconCheckCircle className="w-3.5 h-3.5" /> Dense Semantic RAG
          </span>
          <IconChevronDown
            className="w-4 h-4"
            style={{
              color: 'var(--text-secondary)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {evidence.map((item, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(5, 14, 9, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.4rem'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 700 }}>
                    {item.source_title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    <strong>Organization:</strong> {item.source_organization} {item.publication_year ? `(${item.publication_year})` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {item.retrieval_score !== undefined && (
                    <span className="mono-font" style={{
                      fontSize: '0.72rem',
                      color: item.retrieval_score >= 0.75 ? '#34d399' : (item.retrieval_score >= 0.40 ? '#38bdf8' : '#fbbf24'),
                      background: item.retrieval_score >= 0.75 ? 'rgba(52, 211, 153, 0.12)' : (item.retrieval_score >= 0.40 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(251, 191, 36, 0.12)'),
                      border: `1px solid ${item.retrieval_score >= 0.75 ? 'rgba(52, 211, 153, 0.25)' : (item.retrieval_score >= 0.40 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(251, 191, 36, 0.25)')}`,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {item.retrieval_score >= 0.75 ? 'Strong' : (item.retrieval_score >= 0.40 ? 'Moderate' : 'Limited')} relevance ({item.retrieval_score.toFixed(2)})
                    </span>
                  )}

                  {item.source_url && (
                    <a 
                      href={item.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{
                        color: 'var(--accent-teal)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        background: 'rgba(20, 184, 166, 0.1)',
                        border: '1px solid rgba(20, 184, 166, 0.25)',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-teal)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.25)')}
                    >
                      <span>Retrieved Source</span>
                      <IconExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <blockquote style={{ 
                borderLeft: '3px solid var(--accent-emerald)', 
                paddingLeft: '0.85rem', 
                fontSize: '0.85rem', 
                color: '#e2e8f0',
                fontStyle: 'italic',
                lineHeight: 1.55,
                margin: '0.75rem 0',
                background: 'rgba(16, 185, 129, 0.04)',
                padding: '0.65rem 0.85rem',
                borderRadius: '0 6px 6px 0'
              }}>
                "{item.key_finding}"
              </blockquote>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-emerald)' }}>Relevance to Decision:</strong> {item.relevance_to_decision}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
