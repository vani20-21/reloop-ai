import React from 'react';
import { PathwayOption } from '../types';

interface AlternativePathwaysProps {
  alternatives: PathwayOption[];
}

export const AlternativePathways: React.FC<AlternativePathwaysProps> = ({ alternatives }) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>
          Alternative Circular Pathways &amp; Trade-Offs
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Ranked by retained life-cycle value
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: '1rem'
      }}>
        {alternatives.map((alt, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '1.35rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(8, 20, 14, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.65rem'
              }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  RANK #{alt.rank || idx + 2}
                </span>

                <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                  {alt.suitability}
                </span>
              </div>

              <h4 style={{
                fontSize: '1.12rem',
                color: '#ffffff',
                textTransform: 'capitalize',
                marginBottom: '0.5rem',
                fontWeight: 700
              }}>
                {alt.pathway.replace('_', ' ')}
              </h4>

              <p style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '0.85rem'
              }}>
                <strong style={{ color: '#e2e8f0' }}>Key Trade-Off:</strong> {alt.key_tradeoff}
              </p>
            </div>

            {alt.prerequisites && alt.prerequisites.length > 0 && (
              <div style={{ 
                background: 'rgba(5, 14, 9, 0.65)', 
                padding: '0.6rem 0.85rem', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginTop: 'auto'
              }}>
                <strong style={{ color: 'var(--text-emerald)' }}>Requirement:</strong> {alt.prerequisites.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
