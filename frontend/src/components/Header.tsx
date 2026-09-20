import React, { useState, useRef, useEffect } from 'react';
import { 
  IconClock, 
  IconActivity, 
  IconInfo, 
  IconShield, 
  IconSegmentedLogo, 
  IconInfinity,
  IconSdg12,
  IconUser,
  IconImpact
} from './Icons';
import { HealthStatusResponse } from '../types';

interface HeaderProps {
  health: HealthStatusResponse | null;
  onOpenBenchmark: () => void;
  onOpenHistory: () => void;
  onOpenHowItWorks: () => void;
  onOpenImpact: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onOpenBenchmark,
  onOpenHistory,
  onOpenHowItWorks,
  onOpenImpact,
  onOpenAbout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header style={{
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'transparent',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '66px'
      }}>
        {/* Left: Segmented Logo + Brand */}
        <div 
          onClick={handleScrollToTop}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/assets/reloop_brand_logo.png" 
              alt="ReLoop AI Brand Icon" 
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 10px rgba(16, 185, 129, 0.45))'
              }}
            />
          </div>

          <div>
            <div style={{
              fontSize: '1.24rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              ReLoop AI
            </div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              color: '#a7b7ac',
              letterSpacing: '0.02em'
            }}>
              Circular Intelligence
            </div>
          </div>
        </div>

        {/* Center: Navigation Links with Home Active Indicator */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.4rem' }} className="hidden-mobile">
          {/* Active Home Item */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={handleScrollToTop}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0'
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #10b981' }} />
              <span>Home</span>
            </button>
            {/* Subtle green line with glowing slider dot beneath */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              width: '46px',
              height: '2px',
              background: 'rgba(52, 211, 153, 0.3)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '8px', height: '4px', borderRadius: '2px', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            </div>
          </div>

          <button
            onClick={onOpenHowItWorks}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontWeight: 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
          >
            How It Works
          </button>

          <button
            onClick={onOpenImpact}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontWeight: 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
          >
            Impact
          </button>

          <button
            onClick={onOpenAbout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontWeight: 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
          >
            About
          </button>
        </nav>

        {/* Right: SDG 12 Card, History Pill & Profile Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* SDG 12 Card */}
          <button
            onClick={onOpenImpact}
            title="UN SDG 12: Responsible Consumption and Production"
            style={{
              background: 'rgba(9, 24, 15, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem 0.35rem 0.45rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
          >
            {/* Bronze/Gold infinity emblem */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)'
            }}>
              <IconSdg12 className="w-3.5 h-3.5" />
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                SDG 12
              </div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.1 }}>
                Responsible Consumption and Production
              </div>
            </div>
          </button>

          {/* History Pill Button */}
          <button
            onClick={onOpenHistory}
            style={{
              background: 'rgba(9, 24, 15, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '9999px',
              padding: '0.5rem 0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
          >
            <IconClock className="w-4 h-4" style={{ color: '#34d399' }} />
            <span>History</span>
          </button>

          {/* Profile / Menu Circular Button */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(9, 24, 15, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              title="Options & Diagnostics"
            >
              <IconUser className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '230px',
                background: 'rgba(8, 20, 14, 0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                zIndex: 50
              }}>
                <div style={{
                  padding: '0.4rem 0.85rem 0.25rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)'
                }}>
                  Project Details
                </div>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenBenchmark(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.85rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.84rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <IconActivity className="w-4 h-4" style={{ color: '#38bdf8' }} />
                  <span>Benchmark (50 Cases)</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenImpact(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.85rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.84rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <IconImpact className="w-4 h-4" style={{ color: 'var(--accent-emerald)' }} />
                  <span>SDG Impact &amp; Pledge</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
