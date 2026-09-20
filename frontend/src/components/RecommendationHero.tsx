import React from 'react';
import { CircularPathway, RecommendationResponse } from '../types';
import { IconCheckCircle, IconHelpCircle, IconShield, IconWrench, IconShare, IconGift, IconSparkles, IconRecycle } from './Icons';

interface RecommendationHeroProps {
  response: RecommendationResponse;
}

const PATHWAY_CONFIG: Record<CircularPathway, {
  label: string;
  action: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  icon: React.ReactNode;
}> = {
  continue_using: {
    label: "CONTINUE USING",
    action: "NON-INVASIVE MAINTENANCE & PRESERVATION",
    color: "#34d399",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "#10b981",
    description: "Product retains core functionality. Recommended cleaning, configuration tuning, or preventative care without hardware disposal.",
    icon: <IconCheckCircle className="w-6 h-6" />
  },
  repair: {
    label: "REPAIR",
    action: "EXTEND PRODUCT LIFE",
    color: "#2dd4bf",
    bg: "rgba(45, 212, 191, 0.12)",
    border: "#14b8a6",
    description: "Defect is modular and recoverable. Replacing specific consumable parts or restorative service restores full product lifespan.",
    icon: <IconWrench className="w-6 h-6" />
  },
  reuse: {
    label: "REUSE",
    action: "SECONDARY RESALE & DIRECT TRANSFER",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "#38bdf8",
    description: "Product is fully functional. Transferring or reselling to a secondary owner preserves 100% of embodied manufacturing energy.",
    icon: <IconShare className="w-6 h-6" />
  },
  donate: {
    label: "DONATE",
    action: "COMMUNITY REDISTRIBUTION",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.12)",
    border: "#a855f7",
    description: "Product meets charitable quality standards for educational programs, non-profits, or community lending initiatives.",
    icon: <IconGift className="w-6 h-6" />
  },
  repurpose: {
    label: "REPURPOSE",
    action: "FUNCTIONAL CASCADING & UPCYCLING",
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.12)",
    border: "#f59e0b",
    description: "Cascade the item into a secondary utility (e.g. smart digital dashboard, workshop test bench, upcycled textile material).",
    icon: <IconSparkles className="w-6 h-6" />
  },
  recycle: {
    label: "RECYCLE",
    action: "CERTIFIED MATERIAL RECOVERY",
    color: "#f87171",
    bg: "rgba(239, 68, 68, 0.14)",
    border: "#ef4444",
    description: "Product is beyond economical or safe repair. Surrender to certified e-waste or textile processors to recover critical raw materials.",
    icon: <IconRecycle className="w-6 h-6" />
  }
};

const cleanTextForDisplay = (str?: string): string => {
  if (!str) return '';
  return str
    .replace(/\\([#*\_\[\]])/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/###/g, '')
    .replace(/\*\*/g, '')
    .replace(/cost Cost depends on the specific service or replacement option\./g, 'Cost depends on the specific service or replacement option.')
    .trim();
};

export const RecommendationHero: React.FC<RecommendationHeroProps> = ({ response }) => {
  const config = PATHWAY_CONFIG[response.recommended_pathway] || PATHWAY_CONFIG.repair;

  const strengthColor = (response.evidence_strength === 'Strong' || response.confidence_level === 'Strong')
    ? '#34d399'
    : ((response.evidence_strength === 'Moderate' || response.confidence_level === 'Moderate') ? '#fbbf24' : '#f87171');

  return (
    <div className="glass-panel" style={{
      padding: '2.25rem',
      marginBottom: '1.75rem',
      borderRadius: 'var(--radius-xl)',
      background: 'rgba(8, 22, 15, 0.85)',
      border: `1.5px solid ${config.border}`,
      boxShadow: `0 16px 40px -10px ${config.bg}, 0 0 25px -5px ${config.bg}`
    }}>
      {/* Top Banner: Eyebrow + Visually Dominant Recommended Pathway */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1.5rem'
      }}>
        <div style={{ flex: '1 1 320px' }}>
          <div style={{
            fontSize: '0.76rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            marginBottom: '0.4rem'
          }}>
            RECOMMENDED NEXT LIFE
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: config.bg,
              border: `1px solid ${config.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: config.color,
              flexShrink: 0
            }}>
              {config.icon}
            </div>

            <div>
              <h2 style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: config.color,
                letterSpacing: '-0.025em',
                lineHeight: 1.15
              }}>
                {config.label} <span style={{ color: '#ffffff' }}>→</span> {config.action}
              </h2>
            </div>
          </div>

          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary)',
            marginTop: '0.65rem',
            lineHeight: 1.55,
            maxWidth: '680px'
          }}>
            {config.description}
          </p>
        </div>

        {/* Explainable Evidence Strength Assessment Card */}
        <div style={{
          background: 'rgba(5, 14, 9, 0.75)',
          padding: '1rem 1.35rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '220px',
          textAlign: 'right'
        }}>
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700
          }}>
            Evidence Grounding
          </div>
          <div style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: strengthColor,
            marginTop: '0.2rem'
          }}>
            {response.evidence_strength || response.confidence_level || 'Moderate'}
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            marginTop: '0.35rem',
            lineHeight: 1.4
          }}>
            {cleanTextForDisplay(response.evidence_strength_rationale) || 'Grounding evaluated against semantic retrieval similarity and diagnosis completeness.'}
          </div>
        </div>
      </div>

      {/* Why This Path? Core Decision Factors */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.35rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.05rem',
          color: '#ffffff',
          marginBottom: '0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <IconCheckCircle className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
          <span>Why this path?</span>
        </h3>
        <p style={{
          fontSize: '0.92rem',
          color: '#e2e8f0',
          lineHeight: 1.65
        }}>
          {cleanTextForDisplay(response.reasoning_summary)}
        </p>
      </div>

      {/* Uncertainty & Missing Information Disclosed */}
      {(response.uncertainty_disclosure || (response.missing_information && response.missing_information.length > 0)) && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--accent-amber)',
            fontSize: '0.86rem',
            fontWeight: 700,
            marginBottom: '0.4rem'
          }}>
            <IconHelpCircle className="w-4 h-4" />
            <span>Uncertainty &amp; Missing Information</span>
          </div>

          {response.uncertainty_disclosure && (
            <p style={{ fontSize: '0.84rem', color: '#fde68a', marginBottom: '0.5rem', lineHeight: 1.5 }}>
              {cleanTextForDisplay(response.uncertainty_disclosure)}
            </p>
          )}

          {response.missing_information && response.missing_information.length > 0 && (
            <div style={{ marginTop: '0.4rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fed7aa', marginBottom: '0.25rem' }}>
                Parameters that could alter this pathway:
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#fef3c7', lineHeight: 1.5 }}>
                {response.missing_information.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{cleanTextForDisplay(item)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detailed Technical Explanation */}
      {response.detailed_explanation && (
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem'
        }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.5rem'
          }}>
            Technical Analysis &amp; Heuristics
          </div>
          <div style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            whiteSpace: 'pre-line'
          }}>
            {cleanTextForDisplay(response.detailed_explanation)}
          </div>
        </div>
      )}
    </div>
  );
};
