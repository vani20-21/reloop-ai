import React, { useState } from 'react';
import { RecommendationResponse, EffortLevel } from '../types';
import { IconArrowRight, IconSliders } from './Icons';

interface WhatIfSimulatorProps {
  currentResponse: RecommendationResponse;
  isLoading: boolean;
  onRunWhatIf: (
    alteredCondition: string,
    alteredEffort?: EffortLevel,
    partAvailable?: boolean,
    spendSmall?: boolean
  ) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentResponse,
  isLoading,
  onRunWhatIf
}) => {
  const [customCondition, setCustomCondition] = useState('');
  const [partsAvailable, setPartsAvailable] = useState<boolean | null>(null);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('medium');
  const [willingToSpend, setWillingToSpend] = useState<boolean>(true);

  const handlePresetTrigger = (condition: string, parts?: boolean, effort?: EffortLevel) => {
    onRunWhatIf(condition, effort || effortLevel, parts !== undefined ? parts : undefined, willingToSpend);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCondition.trim() || isLoading) return;
    onRunWhatIf(customCondition, effortLevel, partsAvailable ?? undefined, willingToSpend);
  };

  return (
    <div className="glass-panel" style={{
      padding: '1.75rem',
      marginBottom: '1.75rem',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(8, 20, 14, 0.8)',
      border: '1px solid rgba(20, 184, 166, 0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(20, 184, 166, 0.15)',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-teal)'
        }}>
          <IconSliders className="w-4 h-4" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>
            Interactive "What-If" Exploration Simulator
          </h3>
        </div>
      </div>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        Explore how changing physical conditions, part accessibility, or effort constraints dynamically pivots the AI circular recommendation.
      </p>

      {/* Preset Quick Mutation Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handlePresetTrigger("Replacement parts are completely discontinued and unavailable", false)}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
        >
          ⚡ What if replacement parts are unavailable?
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handlePresetTrigger("User has minimal time and prefers zero DIY disassembly", undefined, 'low')}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
        >
          ⚡ What if user prefers zero effort (Low Effort)?
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handlePresetTrigger("Battery has physically expanded and smells sweet/chemical", undefined, undefined)}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          ⚠️ What if battery started bulging?
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handlePresetTrigger("Genuine OEM parts are available for under $10 with simple snap-in design", true, 'medium')}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
        >
          ✨ What if OEM parts cost under $10?
        </button>
      </div>

      {/* Custom Mutation Form */}
      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          type="text"
          value={customCondition}
          onChange={(e) => setCustomCondition(e.target.value)}
          placeholder="Test custom what-if condition (e.g. 'What if screen is also cracked?', 'What if donated to community center?')..."
          style={{
            flex: 1,
            background: 'rgba(5, 14, 9, 0.75)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.15rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-teal)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '0.75rem 1.35rem', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
          disabled={!customCondition.trim() || isLoading}
        >
          <span>Re-Evaluate</span>
          <IconArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
