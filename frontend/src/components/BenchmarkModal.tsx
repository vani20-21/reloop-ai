import React, { useState } from 'react';
import { EvaluationBenchmarkResult } from '../types';
import { runBenchmark } from '../services/api';
import { IconActivity, IconCheckCircle, IconX } from './Icons';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBenchmark: EvaluationBenchmarkResult | null;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ isOpen, onClose, initialBenchmark }) => {
  const [benchmark, setBenchmark] = useState<EvaluationBenchmarkResult | null>(initialBenchmark);
  const [isRunning, setIsRunning] = useState(false);

  const handleExecute = async () => {
    setIsRunning(true);
    try {
      const res = await runBenchmark();
      setBenchmark(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  const data = benchmark || initialBenchmark;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <IconActivity className="w-6 h-6" style={{ color: 'var(--accent-emerald)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
                Empirical Evaluation Benchmark (50 Cases)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Evaluated against curated multi-domain circular economy test suite.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Dataset: <strong>50 Multi-Domain Test Cases</strong> (7 Categories + Edge Cases)
          </div>
          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
          >
            {isRunning ? 'Running Benchmark...' : 'Re-Run Live Benchmark'}
          </button>
        </div>

        {/* Metrics Overview Grid */}
        {data ? (
          <div>
            {/* Top Composite Score Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 148, 136, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                COMPOSITE CIRCULAR QUALITY INDEX
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>
                {(data.overall_quality_index * 100).toFixed(1)} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Weighted multi-dimensional score reflecting accuracy, grounding, safety, and strict factuality.
              </div>
            </div>

            {/* 7 Dimensions Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {[
                { label: "1. Recommendation Quality (Hierarchy Alignment)", val: data.recommendation_alignment_rate, target: ">= 85%", desc: "Prioritizes product life extension before recycling where appropriate." },
                { label: "2. Retrieval Relevance Rate", val: data.retrieval_relevance_rate, target: ">= 85%", desc: "Retrieves category-relevant evidence from the knowledge base." },
                { label: "3. Evidence Grounding Score", val: data.evidence_grounding_score, target: ">= 90%", desc: "Synthesized explanations directly reference retrieved knowledge docs." },
                { label: "4. Safety Hazard Compliance", val: data.hazard_compliance_rate, target: "100%", desc: "Critical hazards (swollen cells, frayed 240V leads) trigger mandatory alerts." },
                { label: "5. Uncertainty Handling Rate", val: data.uncertainty_disclosure_rate, target: ">= 90%", desc: "Ambiguous cases actively disclose missing diagnostic information." },
                { label: "6. Product Understanding Accuracy", val: data.product_understanding_accuracy, target: ">= 65%", desc: "Correct category classification and condition severity triage." },
                { label: "7. Unsupported-Claim Rate (Hallucinated Stats)", val: data.unsupported_claim_rate, target: "0.0%", desc: "Zero-tolerance for fabricated CO2 kg or financial savings numbers.", isZeroTarget: true },
              ].map((m, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{m.label}</span>
                    <span className={`badge ${m.isZeroTarget ? (m.val === 0 ? 'badge-emerald' : 'badge-red') : (m.val >= 0.85 ? 'badge-emerald' : 'badge-amber')}`}>
                      {(m.val * 100).toFixed(1)}% {m.isZeroTarget ? "(Zero Claims Flagged)" : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    {m.desc} (Target: {m.target})
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${m.isZeroTarget ? (100 - m.val * 100) : m.val * 100}%`, 
                      height: '100%', 
                      background: m.isZeroTarget ? (m.val === 0 ? '#10b981' : '#ef4444') : '#10b981' 
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Benchmark results recorded in SQLite database and serialized to <code>backend/tests/evaluation_report.json</code>.
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Click "Re-Run Live Benchmark" to execute the 50-case benchmark harness.
          </div>
        )}
      </div>
    </div>
  );
};
