import React from 'react';
import { IconX, IconBookOpen, IconGlobe, IconShield, IconActivity, IconInfo, IconRecycle, IconCheckCircle } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'rgba(8, 20, 14, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconRecycle className="w-6 h-6" style={{ color: 'var(--accent-emerald)' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>How ReLoop AI Works</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            ReLoop AI evaluates products you no longer need or that have developed faults, routing them along the <strong>circular waste hierarchy</strong> to prevent unnecessary electronic and material waste.
          </p>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <h4 style={{ color: '#34d399', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <IconCheckCircle className="w-4 h-4" /> 1. Semantic Knowledge Retrieval (RAG)
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Your product description is transformed into 384-dimensional dense semantic vectors (using <code>BAAI/bge-small-en-v1.5</code>). It searches 25+ empirical lifecycle studies and repair manuals to retrieve ground-truth facts.
            </p>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <IconRecycle className="w-4 h-4" /> 2. Six Circular Pathways Evaluated
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Every evaluation considers <strong>Continue Using, Repair, Reuse, Donate, Repurpose,</strong> and <strong>Recycle</strong> in strict order of environmental retention value.
            </p>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <h4 style={{ color: '#fca5a5', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <IconShield className="w-4 h-4" /> 3. Deterministic Safety Guardrails
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Critical hazards like swollen lithium batteries, exposed high-voltage cables, or active sparking trigger deterministic safety interdictions, preventing hazardous amateur DIY repairs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImpactModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'rgba(8, 20, 14, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconGlobe className="w-6 h-6" style={{ color: 'var(--accent-lime)' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>Sustainability &amp; SDG 12 Impact</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', background: 'rgba(0, 122, 61, 0.15)', border: '1px solid rgba(0, 122, 61, 0.35)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <span className="badge" style={{ background: 'rgba(0, 122, 61, 0.3)', color: '#4ade80', marginBottom: '0.5rem' }}>UN SDG 12</span>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '0.4rem' }}>Responsible Consumption</h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Target 12.5: Substantially reduce waste generation through prevention, reduction, recycling, and reuse.
              </p>
            </div>

            <div style={{ flex: '1 1 240px', background: 'rgba(253, 105, 37, 0.15)', border: '1px solid rgba(253, 105, 37, 0.35)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <span className="badge" style={{ background: 'rgba(253, 105, 37, 0.3)', color: '#fb923c', marginBottom: '0.5rem' }}>UN SDG 11</span>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '0.4rem' }}>Sustainable Cities</h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Target 11.6: Reduce the adverse per capita environmental impact of cities, including municipal and e-waste management.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Our Anti-Greenwashing Factuality Pledge</h4>
            <p style={{ fontSize: '0.84rem' }}>
              ReLoop AI refuses to fabricate synthetic carbon savings numbers (e.g., claiming "saves exactly 42 kg of CO2"). Instead, all environmental impact principles are strictly grounded in published life-cycle assessments from the European Environmental Bureau, WRAP UK, and the Ellen MacArthur Foundation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AboutModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '620px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'rgba(8, 20, 14, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconInfo className="w-6 h-6" style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>About ReLoop AI</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            <strong>ReLoop AI</strong> is an open-source circular product decision intelligence engine designed to bridge consumer confusion and authoritative circular stewardship.
          </p>
          <p>
            Rather than treating products as disposable after minor failures or lifestyle upgrades, ReLoop AI synthesizes empirical technical documentation to identify optimal next-life pathways.
          </p>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Architecture: FastEmbed + BAAI Dense Vector RAG</span>
            <span>License: Open Source</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '620px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'rgba(8, 20, 14, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconShield className="w-6 h-6" style={{ color: 'var(--accent-emerald)' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>Privacy Notice</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            <strong>ReLoop AI</strong> is an open-source circular product decision intelligence prototype designed to evaluate consumer goods against empirical lifecycle documentation.
          </p>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ color: '#34d399', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
              How Input Data Is Used
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Your product descriptions are processed transiently to generate semantic embeddings (via FastEmbed) and match against our sustainability corpus to formulate pathway recommendations.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ color: '#ffffff', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
              Data Storage &amp; Protection
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Evaluations may be cached temporarily in your local browser session for history review. We do not track, profile, monetize, or harvest personal user data.
            </p>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ color: '#fbbf24', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
              Sensitive Information Notice
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Because this is a research and decision-support prototype, please <strong>do not enter sensitive personal information</strong> such as personal street addresses, payment details, passwords, or confidential equipment serial numbers.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Status: Open Source Prototype • Zero Third-Party Advertising Trackers
          </div>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '620px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'rgba(8, 20, 14, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconBookOpen className="w-6 h-6" style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>Terms &amp; Disclaimers</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            ReLoop AI provides <strong>informational and educational circular pathway recommendations</strong> based on empirical lifecycle literature and automated retrieval-augmented AI reasoning.
          </p>

          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ color: '#fca5a5', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
              Not Professional Advice
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Outputs generated by ReLoop AI should <strong>not</strong> be treated as professional engineering, electrical safety, financial, environmental certification, or legal advice. Physical repairs involving lithium batteries, mains electricity, pressurized vessels, or hazardous materials must be performed only by certified professionals.
            </p>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ color: '#38bdf8', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
              User Responsibility
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              Users retain full and sole responsibility for any physical actions, repair attempts, item donations, resale transactions, or disposal decisions undertaken. Always verify local municipal recycling regulations and manufacturer guidelines.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ color: '#ffffff', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
              Prototype Limitations
            </h4>
            <p style={{ fontSize: '0.84rem' }}>
              ReLoop AI is an experimental open-source project. While guardrails and evidence retrieval are used to minimize errors, AI-generated suggestions may occasionally misinterpret specific model nuances or local availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '620px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'rgba(8, 20, 14, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconInfo className="w-6 h-6" style={{ color: 'var(--accent-lime)' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>Contact &amp; Project Info</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            ReLoop AI is developed as an open-source circular intelligence project. We welcome research feedback, dataset contributions, and lifecycle study submissions.
          </p>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <h4 style={{ color: '#34d399', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Project Repository &amp; Contributions
            </h4>
            <p style={{ fontSize: '0.84rem', marginBottom: '0.5rem' }}>
              For technical bug reports, feature requests, or benchmarking contributions, please open an issue in the repository.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontFamily: 'monospace' }}>
              github.com/reloop-ai (Project Repository)
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              General Inquiries
            </h4>
            <p style={{ fontSize: '0.84rem', marginBottom: '0.4rem' }}>
              For academic research inquiries or circular economy collaborations:
            </p>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              contact@reloop.ai (Project Placeholder)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
