import React from 'react';
import { IconLeaf, IconUsers, IconGlobe } from './Icons';

export const InfoStrip: React.FC = () => {
  const items = [
    {
      subtitle: "Reduce E-waste",
      stat: "25+",
      description: "sustainability guidelines",
      icon: <IconLeaf className="w-5 h-5" style={{ color: '#34d399' }} />
    },
    {
      subtitle: "Support Circular Living",
      stat: "6 Pathways",
      description: "repair, reuse, donate, recycle",
      icon: <IconUsers className="w-5 h-5" style={{ color: '#34d399' }} />
    },
    {
      subtitle: "Evidence Driven",
      stat: "Trusted sources",
      description: "iFixit • UNEP • EU • More",
      icon: <IconGlobe className="w-5 h-5" style={{ color: '#34d399' }} />
    },
    {
      subtitle: "Contribute to",
      stat: "SDG 12",
      description: "Responsible Consumption & Production",
      icon: <IconLeaf className="w-5 h-5" style={{ color: '#34d399' }} />
    }
  ];

  return (
    <section style={{ margin: '1.75rem 0 3rem 0' }}>
      {/* Unified Wide Horizontal Glass Bar with 4 Metric Segments */}
      <div 
        className="glass-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.25rem',
          padding: '1.25rem 1.65rem',
          borderRadius: '20px',
          background: 'rgba(7, 20, 13, 0.65)',
          border: '1px solid rgba(52, 211, 153, 0.18)',
          boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.4rem 0.6rem',
              borderRadius: '12px',
              background: 'rgba(5, 16, 10, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {/* Green Rounded Square Icon Container */}
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(52, 211, 153, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)'
            }}>
              {item.icon}
            </div>

            {/* Typography Stack: Subtitle -> Bold Stat/Title -> Description */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: 500,
                color: '#a7b7ac',
                lineHeight: 1.15,
                letterSpacing: '0.02em'
              }}>
                {item.subtitle}
              </div>
              <div style={{
                fontSize: '1.22rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                letterSpacing: '-0.02em',
                marginTop: '0.15rem'
              }}>
                {item.stat}
              </div>
              <div style={{
                fontSize: '0.74rem',
                color: '#94a3b8',
                marginTop: '0.12rem',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
