import React, { useRef, useState } from 'react';
import {
  IconPathwayRepair,
  IconPathwayReuse,
  IconPathwayDonate,
  IconPathwayRepurpose,
  IconPathwayRecycle,
} from './Icons';

interface PathwayNodeData {
  id: string;
  name: string;
  sub: string;
  tip: string;
  left: string;
  top: string;
  icon: React.ReactNode;
}

export const HeroVisual: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  /* ============================================================
     MOUSE PARALLAX
  ============================================================ */

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width - 0.5) * 2;

    const y =
      ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setTilt({
      x: -y * 2,
      y: x * 2.4,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setActiveNode(null);
  };

  /* ============================================================
     PATHWAY NODES
  ============================================================ */

  const nodes: PathwayNodeData[] = [
    {
      id: 'repair',
      name: 'REPAIR',
      sub: 'Extend Use',
      tip:
        'Extend product lifespan through repair, component replacement and maintenance.',
      left: '50%',
      top: '9%',
      icon: <IconPathwayRepair />,
    },
    {
      id: 'reuse',
      name: 'REUSE',
      sub: 'Direct Resale',
      tip:
        'Keep functional products in circulation through resale, refurbishment or second ownership.',
      left: '17%',
      top: '35%',
      icon: <IconPathwayReuse />,
    },
    {
      id: 'donate',
      name: 'DONATE',
      sub: 'Social Impact',
      tip:
        'Redirect usable products toward people, schools, communities or nonprofit organizations.',
      left: '83%',
      top: '35%',
      icon: <IconPathwayDonate />,
    },
    {
      id: 'repurpose',
      name: 'REPURPOSE',
      sub: 'Upcycle / Utility',
      tip:
        'Give an unwanted product another function instead of discarding it.',
      left: '25%',
      top: '79%',
      icon: <IconPathwayRepurpose />,
    },
    {
      id: 'recycle',
      name: 'RECYCLE',
      sub: 'Recover Materials',
      tip:
        'Recover useful materials through appropriate recycling channels when reuse is no longer viable.',
      left: '75%',
      top: '79%',
      icon: <IconPathwayRecycle />,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="reloop-hero-visual"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '700px',
        aspectRatio: '1 / 1',
        margin: '0 auto',
        perspective: '1400px',
        userSelect: 'none',
        isolation: 'isolate',
        overflow: 'visible',
      }}
    >
      {/* ==========================================================
          BACK ATMOSPHERE
      ========================================================== */}

      <div
        style={{
          position: 'absolute',
          inset: '7%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 45%, rgba(74,222,128,0.18) 0%, rgba(34,197,94,0.07) 42%, transparent 72%)',
          filter: 'blur(45px)',
          transform: 'translateZ(-100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ==========================================================
          SOFT LIGHT RAY
      ========================================================== */}

      <div
        style={{
          position: 'absolute',
          top: '-5%',
          left: '36%',
          width: '180px',
          height: '72%',
          background:
            'linear-gradient(115deg, transparent 0%, rgba(190,242,100,0.06) 44%, rgba(255,255,255,0.09) 50%, transparent 70%)',
          filter: 'blur(25px)',
          transform: 'rotate(8deg) translateZ(-90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ==========================================================
          3D STAGE
      ========================================================== */}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform:
            `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition:
            'transform 500ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >

        {/* ========================================================
            FLOATING SHADOW
        ======================================================== */}

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '9%',
            width: '46%',
            height: '34px',
            transform:
              'translateX(-50%) translateZ(-70px)',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.36) 48%, transparent 76%)',
            filter: 'blur(18px)',
            animation:
              'reloopShadowFloat 6s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* ========================================================
            FLOATING LAPTOP + ROCK
        ======================================================== */}

        <div
          className="reloop-floating-island"
          style={{
            position: 'absolute',
            left: '50%',
            top: '51%',
            width: '67%',
            height: '67%',
            transform:
              'translate(-50%, -50%) translateZ(15px)',
            animation:
              'reloopIslandFloat 6s ease-in-out infinite',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <img
            src="/assets/reloop_floating_laptop.png"
            alt="Laptop resting on a floating moss-covered rock"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter:
                'drop-shadow(0 30px 34px rgba(0,0,0,0.52)) drop-shadow(0 8px 24px rgba(22,101,52,0.18))',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ========================================================
            CIRCULAR PATHWAY ARROWS

            Five curved clockwise segments:
            REPAIR → DONATE → RECYCLE → REPURPOSE → REUSE → REPAIR
            Luminous 2.4px curved arcs with attached arrowheads
            following the circular lifecycle behind the nodes.
        ======================================================== */}

        <svg
          viewBox="0 0 700 700"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            transform: 'translateZ(40px)',
            pointerEvents: 'none',
            zIndex: 8,
          }}
        >
          <defs>
            <linearGradient
              id="reloopArrowGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#86efac"
                stopOpacity="0.85"
              />
              <stop
                offset="50%"
                stopColor="#ffffff"
                stopOpacity="0.95"
              />
              <stop
                offset="100%"
                stopColor="#86efac"
                stopOpacity="0.85"
              />
            </linearGradient>

            <filter
              id="reloopArrowGlow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur
                stdDeviation="1.8"
                result="blur"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Attached Clockwise Arrowhead */}
            <marker
              id="reloopPathwayArrow"
              viewBox="0 0 12 12"
              refX="4"
              refY="6"
              markerWidth="9"
              markerHeight="9"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M 1.5 2 L 9 6 L 1.5 10 L 3.8 6 Z"
                fill="#86efac"
              />
            </marker>
          </defs>

          {/* ======================================================
              FIVE CLOCKWISE CURVED ARROW SEGMENTS
          ====================================================== */}

          {/* 1. REPAIR ↘ DONATE */}
          <path
            d="M 391.0 70.0 A 250 285 0 0 1 565.0 204.5"
            fill="none"
            stroke="#86efac"
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd="url(#reloopPathwayArrow)"
            filter="url(#reloopArrowGlow)"
            opacity="0.88"
          />

          {/* 2. DONATE ↓ RECYCLE */}
          <path
            d="M 594.8 292.2 A 250 285 0 0 1 551.0 519.5"
            fill="none"
            stroke="#86efac"
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd="url(#reloopPathwayArrow)"
            filter="url(#reloopArrowGlow)"
            opacity="0.88"
          />

          {/* 3. RECYCLE ↙ REPURPOSE */}
          <path
            d="M 491.6 584.9 A 250 285 0 0 1 204.8 582.0"
            fill="none"
            stroke="#86efac"
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd="url(#reloopPathwayArrow)"
            filter="url(#reloopArrowGlow)"
            opacity="0.88"
          />

          {/* 4. REPURPOSE ↖ REUSE */}
          <path
            d="M 146.5 515.5 A 250 285 0 0 1 106.1 287.3"
            fill="none"
            stroke="#86efac"
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd="url(#reloopPathwayArrow)"
            filter="url(#reloopArrowGlow)"
            opacity="0.88"
          />

          {/* 5. REUSE ↑ REPAIR */}
          <path
            d="M 137.3 200.2 A 250 285 0 0 1 310.9 68.5"
            fill="none"
            stroke="#86efac"
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd="url(#reloopPathwayArrow)"
            filter="url(#reloopArrowGlow)"
            opacity="0.88"
          />
        </svg>

        {/* ========================================================
            PATHWAY NODES
        ======================================================== */}

        {nodes.map((node) => {
          const active =
            activeNode === node.id;

          return (
            <div
              key={node.id}
              onMouseEnter={() =>
                setActiveNode(node.id)
              }
              onMouseLeave={() =>
                setActiveNode(null)
              }
              style={{
                position: 'absolute',
                left: node.left,
                top: node.top,
                transform:
                  'translate(-50%, -50%) translateZ(80px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 20,
                cursor: 'pointer',
                minWidth: '90px',
              }}
            >
              {/* ==================================================
                  ICON
              ================================================== */}

              <div
                style={{
                  width: active ? '48px' : '44px',
                  height: active ? '48px' : '44px',
                  borderRadius: '50%',
                  background: active
                    ? 'rgba(5,30,18,0.95)'
                    : 'rgba(4,22,14,0.84)',
                  border: active
                    ? '1.5px solid rgba(134,239,172,0.85)'
                    : '1px solid rgba(134,239,172,0.40)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#86efac',
                  boxShadow: active
                    ? `
                      0 0 0 4px rgba(74,222,128,0.08),
                      0 0 28px rgba(74,222,128,0.38),
                      0 12px 30px rgba(0,0,0,0.55)
                    `
                    : `
                      0 0 18px rgba(74,222,128,0.14),
                      0 10px 25px rgba(0,0,0,0.48),
                      inset 0 1px 1px rgba(255,255,255,0.12)
                    `,
                  transition:
                    'all 220ms cubic-bezier(0.16,1,0.3,1)',
                  transform:
                    active ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {node.icon}
              </div>

              {/* ==================================================
                  LABEL
              ================================================== */}

              <div
                style={{
                  marginTop: '7px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  textShadow:
                    '0 2px 10px rgba(0,0,0,0.95)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: '0.055em',
                    color: active
                      ? '#a7f3d0'
                      : '#f1f5f9',
                  }}
                >
                  {node.name}
                </div>

                <div
                  style={{
                    marginTop: '3px',
                    fontSize: '9px',
                    lineHeight: 1.15,
                    color:
                      'rgba(226,232,240,0.68)',
                  }}
                >
                  {node.sub}
                </div>
              </div>

              {/* ==================================================
                  TOOLTIP
              ================================================== */}

              {active && (
                <div
                  style={{
                    position: 'absolute',

                    /*
                     * REPAIR tooltip goes downward so it
                     * doesn't disappear above the viewport.
                     */
                    ...(node.id === 'repair'
                      ? {
                        top: 'calc(100% + 12px)',
                      }
                      : {
                        bottom:
                          'calc(100% + 12px)',
                      }),

                    left: '50%',
                    transform:
                      'translateX(-50%)',
                    width: '205px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background:
                      'rgba(3,15,9,0.96)',
                    border:
                      '1px solid rgba(134,239,172,0.30)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter:
                      'blur(18px)',
                    boxShadow:
                      '0 18px 45px rgba(0,0,0,0.60), 0 0 20px rgba(34,197,94,0.15)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      color: '#86efac',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {node.name}
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      color: '#cbd5e1',
                      fontSize: '9px',
                      lineHeight: 1.45,
                    }}
                  >
                    {node.tip}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ========================================================
            EDITORIAL TEXT — TOP RIGHT
        ======================================================== */}

        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '0%',
            textAlign: 'right',
            fontFamily:
              'Newsreader, Georgia, serif',
            fontStyle: 'italic',
            fontSize: '14px',
            lineHeight: 1.35,
            color:
              'rgba(226,232,240,0.68)',
            transform:
              'translateZ(45px)',
            zIndex: 18,
            pointerEvents: 'none',
          }}
        >
          <div>
            Small decisions.
          </div>

          <div
            style={{
              color: '#86efac',
            }}
          >
            A bigger tomorrow.
          </div>
        </div>

        {/* ========================================================
            EDITORIAL TEXT — BOTTOM RIGHT
        ======================================================== */}

        <div
          style={{
            position: 'absolute',
            bottom: '7%',
            right: '0%',
            textAlign: 'right',
            fontFamily:
              'Newsreader, Georgia, serif',
            fontStyle: 'italic',
            fontSize: '13px',
            lineHeight: 1.35,
            color:
              'rgba(226,232,240,0.62)',
            transform:
              'translateZ(45px)',
            zIndex: 18,
            pointerEvents: 'none',
          }}
        >
          <div>
            Technology for people.
          </div>

          <div
            style={{
              color: '#86efac',
            }}
          >
            A healthier planet.
          </div>

          <div
            style={{
              width: '56px',
              height: '1px',
              marginTop: '7px',
              marginLeft: 'auto',
              background:
                'rgba(134,239,172,0.30)',
            }}
          />
        </div>
      </div>

      {/* ==========================================================
          ANIMATIONS
      ========================================================== */}

      <style>
        {`
          @keyframes reloopIslandFloat {
            0%,
            100% {
              transform:
                translate(-50%, -50%)
                translateY(0px)
                translateZ(15px);
            }

            50% {
              transform:
                translate(-50%, -50%)
                translateY(-9px)
                translateZ(15px);
            }
          }

          @keyframes reloopShadowFloat {
            0%,
            100% {
              transform:
                translateX(-50%)
                translateZ(-70px)
                scaleX(1);
              opacity: 0.72;
            }

            50% {
              transform:
                translateX(-50%)
                translateZ(-70px)
                scaleX(0.82);
              opacity: 0.42;
            }
          }

          @media (max-width: 1100px) {
            .reloop-hero-visual {
              max-width: 620px !important;
            }
          }

          @media (max-width: 850px) {
            .reloop-hero-visual {
              max-width: 560px !important;
            }

            .reloop-floating-island {
              width: 69% !important;
              height: 69% !important;
            }
          }

          @media (max-width: 640px) {
            .reloop-hero-visual {
              max-width: 500px !important;
            }

            .reloop-floating-island {
              width: 72% !important;
              height: 72% !important;
            }
          }
        `}
      </style>
    </div>
  );
};