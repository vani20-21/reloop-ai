import React from 'react';
import { IconShield, IconGlobe } from './Icons';

interface NextStepsCardProps {
  steps: string[];
  safetyWarnings: string[];
  sdgAlignment: {
    sdg_12: string;
    sdg_11: string;
  };
}

export const NextStepsCard: React.FC<NextStepsCardProps> = ({
  steps,
  safetyWarnings,
  sdgAlignment
}) => {
  return (
    <div className="glass-panel" style={{
      padding: '2rem',
      marginBottom: '3rem',
      borderRadius: 'var(--radius-xl)',
      background: 'rgba(9, 22, 15, 0.75)',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    }}>
      <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
        Practical Next-Life Action Roadmap
      </h3>

      {/* Sequentially Numbered Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
        {steps.map((step, idx) => (
          <div 
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              background: 'rgba(5, 14, 9, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.15rem',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '0.1rem',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.35)'
            }}>
              {idx + 1}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.55 }}>
              {step}
            </div>
          </div>
        ))}
      </div>

      {/* UN SDG Alignment Card */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.07)',
        border: '1px solid rgba(16, 185, 129, 0.22)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.35rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.84rem',
          fontWeight: 700,
          color: 'var(--accent-emerald)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.6rem'
        }}>
          <IconGlobe className="w-4 h-4" />
          <span>UN Sustainable Development Goals (SDG) Alignment</span>
        </div>

        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '0.45rem', lineHeight: 1.5 }}>
          <strong style={{ color: '#4ade80' }}>SDG 12 (Responsible Consumption):</strong> {sdgAlignment.sdg_12}
        </div>

        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          <strong style={{ color: '#fb923c' }}>SDG 11 (Sustainable Cities):</strong> {sdgAlignment.sdg_11}
        </div>
      </div>

      {/* Safety & Non-Professional Advice Disclaimer */}
      <div style={{
        fontSize: '0.76rem',
        color: 'var(--text-muted)',
        lineHeight: 1.55,
        display: 'flex',
        gap: '0.55rem',
        alignItems: 'flex-start',
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        paddingTop: '0.85rem'
      }}>
        <IconShield className="w-4 h-4" style={{ flexShrink: 0, marginTop: '0.15rem', color: 'var(--accent-teal)' }} />
        <span>
          {safetyWarnings[safetyWarnings.length - 1] || "Reloop AI provides circular decision guidance based on general sustainability heuristics and technical documentation. Always observe electrical and physical safety guidelines."}
        </span>
      </div>
    </div>
  );
};
