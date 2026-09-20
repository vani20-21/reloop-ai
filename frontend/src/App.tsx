import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IntakeCockpit } from './components/IntakeCockpit';
import { HeroVisual } from './components/HeroVisual';
import { InfoStrip } from './components/InfoStrip';
import { DiagnosticCard } from './components/DiagnosticCard';
import { RecommendationHero } from './components/RecommendationHero';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AlternativePathways } from './components/AlternativePathways';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { NextStepsCard } from './components/NextStepsCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { BenchmarkModal } from './components/BenchmarkModal';
import { HowItWorksModal, ImpactModal, AboutModal, PrivacyModal, TermsModal, ContactModal } from './components/InfoModals';

import { 
  ProductAnalysisRequest, 
  RecommendationResponse, 
  CategoryMetadata, 
  HealthStatusResponse,
  EvaluationBenchmarkResult,
  EffortLevel 
} from './types';

import { 
  analyzeProduct, 
  whatIfAnalysis, 
  getCategories, 
  getHealth, 
  getHistoryDetail 
} from './services/api';

export const App: React.FC = () => {
  const [categories, setCategories] = useState<CategoryMetadata[]>([]);
  const [health, setHealth] = useState<HealthStatusResponse | null>(null);
  const [currentResponse, setCurrentResponse] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<EvaluationBenchmarkResult | null>(null);

  useEffect(() => {
    // Initial data load: categories, health
    getCategories().then(setCategories).catch(console.error);
    getHealth().then(setHealth).catch(console.error);
  }, []);

  const handleAnalyze = async (request: ProductAnalysisRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeProduct(request);
      setCurrentResponse(result);
      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('analysis-results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatIf = async (
    alteredCondition: string,
    alteredEffort?: EffortLevel,
    partAvailable?: boolean,
    spendSmall?: boolean
  ) => {
    if (!currentResponse) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const mutated = await whatIfAnalysis({
        session_id: currentResponse.session_id,
        altered_condition: alteredCondition,
        altered_effort_preference: alteredEffort,
        part_available: partAvailable,
        willing_to_spend_small_amount: spendSmall,
      });
      setCurrentResponse(mutated);
    } catch (err: any) {
      setErrorMessage(err.message || 'What-if evaluation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistorySession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const detail = await getHistoryDetail(sessionId);
      setCurrentResponse(detail);
      setTimeout(() => {
        const el = document.getElementById('analysis-results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage('Failed to load past session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Dark Vignette Atmospheric Overlay */}
      <div className="atmospheric-overlay" />

      {/* Transparent Glass Navigation Header */}
      <Header 
        health={health}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenImpact={() => setIsImpactOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      <main className="container" style={{ flex: 1 }}>
        {/* Error Notification Banner */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--accent-red)',
            color: '#fca5a5',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            margin: '1.5rem 0',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>{errorMessage}</div>
            <button 
              onClick={() => setErrorMessage(null)}
              style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Full-Screen Two-Column Hero: Left ~53%, Right ~47% */}
        <section className="hero-grid">
          {/* Left Hero: Typography, Input Card, CTA & Examples */}
          <div>
            <IntakeCockpit
              categories={categories}
              isLoading={isLoading}
              aiAvailable={health?.ai_available}
              onAnalyze={handleAnalyze}
            />
          </div>

          {/* Right Hero: Large 3D Circular Product Composition */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <HeroVisual />
          </div>
        </section>

        {/* Bottom Information Strip */}
        <InfoStrip />

        {/* Dynamic Analysis Results Section */}
        {currentResponse && (
          <section id="analysis-results-section" className="animate-fade-in" style={{ paddingTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem'
            }}>
              <span className="badge badge-emerald">DECISION INTELLIGENCE RESULT</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Session: {currentResponse.session_id.slice(0, 8)}...</span>
            </div>

            {/* Diagnostic Triage & Safety Override */}
            <DiagnosticCard
              product={currentResponse.detected_product}
              condition={currentResponse.interpreted_condition}
              safetyWarnings={currentResponse.safety_warnings}
              visualEvidence={currentResponse.visual_evidence}
            />


            {/* Dominant Recommended Pathway Hero */}
            <RecommendationHero response={currentResponse} />

            {/* What-If Interactive Simulator */}
            <WhatIfSimulator
              currentResponse={currentResponse}
              isLoading={isLoading}
              onRunWhatIf={handleWhatIf}
            />

            {/* Alternative Circular Pathways Deck */}
            <AlternativePathways alternatives={currentResponse.alternative_pathways} />

            {/* Grounding Sustainability Evidence Drawer */}
            <EvidenceDrawer evidence={currentResponse.evidence_used} />

            {/* Practical Next Steps Roadmap & SDG Alignment */}
            <NextStepsCard
              steps={currentResponse.practical_next_steps}
              safetyWarnings={currentResponse.safety_warnings}
              sdgAlignment={currentResponse.sdg_alignment}
            />
          </section>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectHistorySession}
      />

      {/* Benchmark Modal */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        initialBenchmark={benchmarkData}
      />

      {/* Informational Modals */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
      <ImpactModal
        isOpen={isImpactOpen}
        onClose={() => setIsImpactOpen(false)}
      />
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Minimal Footer matching reference */}
      <footer style={{
        borderTop: '1px solid rgba(16, 185, 129, 0.12)',
        padding: '2rem 0',
        background: 'rgba(3, 7, 4, 0.95)',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span className="brand-font" style={{ fontSize: '1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                ReLoop AI
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                • Circular Decision Intelligence
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Supporting UN SDG 12 and SDG 11
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            <button 
              onClick={() => setIsPrivacyOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Privacy
            </button>
            <button 
              onClick={() => setIsTermsOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Terms
            </button>
            <button 
              onClick={() => setIsContactOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
