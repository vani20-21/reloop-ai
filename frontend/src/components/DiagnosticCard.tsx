import React from 'react';
import { DetectedProduct, InterpretedCondition, VisualEvidence } from '../types';
import { IconAlertTriangle, IconFlame, IconShield, IconCheckCircle } from './Icons';

interface DiagnosticCardProps {
  product: DetectedProduct;
  condition: InterpretedCondition;
  safetyWarnings: string[];
  visualEvidence?: VisualEvidence | null;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  product,
  condition,
  safetyWarnings,
  visualEvidence
}) => {
  const isHazard = 
    condition.severity_level === 'critical_hazard' || 
    safetyWarnings.some(w => 
      w.startsWith('CRITICAL HAZARD:') || 
      w.startsWith('SAFETY INTERVENTION:') || 
      w.startsWith('LETHAL VOLTAGE HAZARD:') || 
      w.startsWith('SHOCK HAZARD:') || 
      w.startsWith('BIOHAZARD WARNING:') ||
      w.startsWith('ELECTRICAL SAFETY HAZARD:')
    );

  const getSeverityBadge = () => {
    switch (condition.severity_level) {
      case 'none':
        return <span className="badge badge-emerald">Optimal / Functional</span>;
      case 'mild':
        return <span className="badge badge-blue">Mild Wear</span>;
      case 'moderate':
        return <span className="badge badge-amber">Moderate Degradation</span>;
      case 'severe':
        return <span className="badge badge-red">Severe Defect</span>;
      case 'critical_hazard':
        return (
          <span className="badge badge-red pulse-glow">
            <IconFlame className="w-3.5 h-3.5" /> Critical Safety Hazard
          </span>
        );
      default:
        return <span className="badge badge-blue">{condition.severity_level}</span>;
    }
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Prominent Safety Override Alert (if hazard detected) */}
      {isHazard && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.16)',
          border: '1.5px solid rgba(239, 68, 68, 0.55)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.35rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
          boxShadow: '0 8px 30px rgba(239, 68, 68, 0.25)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
            flexShrink: 0
          }}>
            <IconAlertTriangle className="w-6 h-6" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: 800,
              color: '#fca5a5',
              fontSize: '1rem',
              letterSpacing: '-0.01em',
              marginBottom: '0.35rem'
            }}>
              MANDATORY SAFETY INTERVENTION — DO NOT ATTEMPT DIY REPAIR
            </div>
            <div style={{ fontSize: '0.86rem', color: '#fee2e2', lineHeight: 1.55 }}>
              {safetyWarnings[0] || "Physical hazard detected. Continued use or amateur disassembly poses immediate personal and fire hazards. Follow certified professional disposal protocols."}
            </div>
          </div>
        </div>
      )}

      {/* Visual Evidence Section (if photo analyzed) */}
      {visualEvidence && (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(9, 24, 16, 0.65)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.85rem',
            color: '#34d399',
            fontWeight: 700,
            fontSize: '0.84rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            <span>📷 VISUAL EVIDENCE</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, textTransform: 'none' }}>
              (OpenRouter Free Vision)
            </span>
          </div>

          {visualEvidence.analysis_status === 'completed' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              {/* What AI sees */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  What the AI can see
                </div>
                {visualEvidence.observations.length > 0 ? (
                  visualEvidence.observations.map((obs, idx) => (
                    <div key={idx} style={{ color: '#ffffff', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                      <span style={{ color: '#34d399' }}>✓</span>
                      <span>{obs.observation}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No distinct physical damage observed.</div>
                )}
              </div>

              {/* Possible Explanation */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Possible Explanation
                </div>
                {visualEvidence.possible_explanations.length > 0 ? (
                  visualEvidence.possible_explanations.map((exp, idx) => (
                    <div key={idx} style={{ color: '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                      <span style={{ color: '#fcd34d' }}>•</span>
                      <span>{exp.explanation}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>Appearance consistent with normal state.</div>
                )}
              </div>

              {/* Cannot Confirm */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Cannot Confirm
                </div>
                {visualEvidence.unknowns.length > 0 ? (
                  visualEvidence.unknowns.map((unk, idx) => (
                    <div key={idx} style={{ color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                      <span style={{ color: '#64748b' }}>?</span>
                      <span>{unk}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>Internal metrics require physical inspection.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.84rem', color: '#f87171' }}>
              {visualEvidence.error_message || "Image analysis is temporarily unavailable. The recommendation was generated from your description."}
            </div>
          )}
        </div>
      )}


      {/* Product & Condition Breakdown Card */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(9, 22, 15, 0.75)',
        border: '1px solid rgba(16, 185, 129, 0.18)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <IconShield className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>Diagnostic Understanding</h3>
          </div>
          <div>
            {getSeverityBadge()}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Detected Product */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Detected Product
            </div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.08rem', marginTop: '0.25rem' }}>
              {product.product_name_or_type}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Category: <strong style={{ color: 'var(--accent-teal)' }}>{product.category.replace('_', ' ')}</strong>
              {product.estimated_age_bracket && ` • ~${product.estimated_age_bracket}`}
            </div>
          </div>

          {/* Physical State */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Interpreted Condition
            </div>
            <div style={{ fontSize: '0.88rem', color: '#e2e8f0', marginTop: '0.25rem', lineHeight: 1.5 }}>
              {condition.functional_state}
            </div>
          </div>

          {/* Defects & Symptoms */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Identified Defects &amp; Symptoms
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {condition.identified_defects && condition.identified_defects.length > 0 ? (
                condition.identified_defects.map((defect, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {defect}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None reported (Functional)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
