import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const IconRefresh: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
  </svg>
);

export const IconShield: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export const IconAlertTriangle: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const IconCheckCircle: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export const IconHelpCircle: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const IconCpu: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/>
    <line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/>
    <line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/>
    <line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/>
    <line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);

export const IconFlame: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

export const IconBookOpen: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export const IconClock: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export const IconSliders: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/>
    <line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/>
    <line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/>
    <line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

export const IconActivity: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

export const IconX: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const IconExternalLink: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export const IconWrench: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

export const IconShare: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

export const IconGift: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

export const IconSparkles: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

export const IconRecycle: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <g transform="translate(0, -0.5)">
      <path d="M18.5 14.5v1.5a2 2 0 0 1-1.8 2H8.5" />
      <polygon points="5.5,18 9.5,15 9.5,21" fill="currentColor" stroke="none" />
      <g transform="rotate(120 12 12.5)">
        <path d="M18.5 14.5v1.5a2 2 0 0 1-1.8 2H8.5" />
        <polygon points="5.5,18 9.5,15 9.5,21" fill="currentColor" stroke="none" />
      </g>
      <g transform="rotate(240 12 12.5)">
        <path d="M18.5 14.5v1.5a2 2 0 0 1-1.8 2H8.5" />
        <polygon points="5.5,18 9.5,15 9.5,21" fill="currentColor" stroke="none" />
      </g>
    </g>
  </svg>
);

export const IconImpact: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13a8 8 0 0 1 8-8 7 7 0 0 1 7 7 8 8 0 0 1-8 8Z" />
    <path d="M4 21c4-4 7-9 8-16" />
    <path d="M17 4.5a4.5 4.5 0 0 1 2.8 2.8" />
    <path d="M19.5 2a8 8 0 0 1 3 3" />
  </svg>
);

export const IconLeaf: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13a8 8 0 0 1 8-8 7 7 0 0 1 7 7 8 8 0 0 1-8 8Z"/>
    <path d="M4 21c4-4 7-9 8-16"/>
  </svg>
);

export const IconLaptop: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
  </svg>
);

export const IconSmartphone: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

export const IconShirt: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const IconMenu: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export const IconChevronDown: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export const IconInfo: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export const IconGlobe: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export const IconSegmentedLogo: React.FC<IconProps> = ({ className = "w-7 h-7", style }) => (
  <svg className={className} style={style} width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M16 3 A13 13 0 0 1 29 16" stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M29 16 A13 13 0 0 1 16 29" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="16 5" />
    <path d="M16 29 A13 13 0 0 1 3 16" stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M3 16 A13 13 0 0 1 16 3" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="16 5" />
  </svg>
);

export const IconInfinity: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.178 8c5.096 0 5.096 8 0 8-3.397 0-5.32-4-7.178-8-1.857-4-3.781-8-7.178-8-5.096 0-5.096 8 0 8 3.397 0 5.32-4 7.178-8 1.857-4 3.781-8 7.178-8z"/>
  </svg>
);

export const IconSdg12: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="-58 -30 65 35" fill="currentColor">
    <path d="M0,-25.214C-4.305,-28.614 -10.009,-28.684 -12.098,-28.187L-12.34,-28.131C-14.753,-27.561 -18.585,-26.618 -23.07,-21.052C-23.095,-21.022 -23.121,-20.99 -23.145,-20.958L-23.201,-20.889C-23.245,-20.827 -23.276,-20.754 -23.276,-20.672C-23.276,-20.605 -23.26,-20.543 -23.227,-20.486L-23.123,-20.315C-22.56,-19.373 -21.85,-18.161 -21.25,-17.044C-21.245,-17.032 -21.239,-17.023 -21.234,-17.009C-21.17,-16.886 -21.042,-16.799 -20.892,-16.799C-20.788,-16.799 -20.694,-16.84 -20.627,-16.907C-20.599,-16.943 -20.57,-16.982 -20.545,-17.021C-16.564,-22.526 -13.433,-23.287 -11.316,-23.785L-11.062,-23.844C-9.963,-24.108 -5.784,-24.092 -2.767,-21.711C-0.413,-19.852 0.782,-16.894 0.782,-12.921C0.782,-6.255 -2.46,-3.647 -5.181,-2.634C-9.395,-1.058 -13.437,-3.164 -13.467,-3.18L-13.648,-3.268C-15.963,-4.274 -19.418,-6.365 -22.674,-12.905C-29.237,-26.085 -34.726,-27.327 -38.359,-28.149L-38.553,-28.193C-40.207,-28.568 -45.951,-28.833 -50.466,-25.229C-52.825,-23.347 -55.635,-19.688 -55.635,-12.947C-55.635,-8.84 -54.791,-6.128 -52.623,-3.275C-52.147,-2.625 -47.287,3.619 -37.89,1.818C-36.386,1.53 -34.349,0.812 -32.108,-0.867L-30.04,0.998C-29.905,1.121 -29.69,1.111 -29.566,0.975C-29.506,0.912 -29.482,0.831 -29.483,0.751L-29.483,0.723L-27.991,-8.455L-27.99,-8.557C-27.991,-8.646 -28.027,-8.737 -28.101,-8.801C-28.164,-8.861 -28.242,-8.884 -28.32,-8.884L-28.384,-8.878L-28.481,-8.868L-37.271,-6.407L-37.431,-6.381C-37.495,-6.367 -37.554,-6.334 -37.599,-6.283C-37.727,-6.143 -37.715,-5.93 -37.574,-5.806L-37.471,-5.71L-35.501,-3.932C-36.773,-3.108 -37.882,-2.73 -38.728,-2.566C-45.526,-1.27 -48.883,-5.722 -49.01,-5.897L-49.058,-5.962C-50.637,-8.036 -51.171,-9.798 -51.171,-12.947C-51.171,-16.933 -49.997,-19.892 -47.682,-21.741C-44.742,-24.087 -40.687,-24.101 -39.542,-23.84L-39.344,-23.795C-36.367,-23.122 -32.289,-22.199 -26.672,-10.915C-23.754,-5.057 -20.099,-1.226 -15.5,0.794C-14.915,1.092 -12.122,2.417 -8.499,2.417C-6.983,2.417 -5.323,2.185 -3.62,1.552C-0.955,0.557 5.246,-2.842 5.246,-12.921C5.246,-19.657 2.393,-23.324 0,-25.214" />
  </svg>
);

export const IconPrompt: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="m9 15 6-6" />
    <path d="M15 15V9H9" />
  </svg>
);

export const IconUsers: React.FC<IconProps> = ({ className = "w-4 h-4", style }) => (
  <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ========================================================
   UNIFIED CUSTOM PATHWAY ICONS (SECTION 8)
   Consistent stroke width (1.75), optical balance, 24x24
   ======================================================== */

export const IconPathwayRepair: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const IconPathwayReuse: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 10.5C11.5 6 15 2.5 19 2.5C19 7 15.5 10.5 11.5 10.5Z" />
    <path d="M15.5 6.5L11.5 10.5" />
    <path d="M11.5 10.5l-1 5" />
    <path d="M3 15.5h3.5c.8 0 1.5-.5 1.8-1.2l.4-1a1.2 1.2 0 0 1 2.2.3v1.9h6.6a1.8 1.8 0 0 1 1.8 1.8c0 1.2-1 2.2-2.2 2.2H3" />
  </svg>
);

export const IconPathwayDonate: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="3.2" />
    <path d="M7 21v-1.5a5 5 0 0 1 10 0V21" />
    <circle cx="5.5" cy="9.5" r="2.2" />
    <path d="M1.5 21v-1a3.8 3.8 0 0 1 3.8-3.5c.7 0 1.4.2 2 .5" />
    <circle cx="18.5" cy="9.5" r="2.2" />
    <path d="M16.7 17c.6-.3 1.3-.5 2-.5a3.8 3.8 0 0 1 3.8 3.5v1" />
  </svg>
);

export const IconPathwayRepurpose: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12a8 8 0 0 1 15.5-2.5" />
    <polyline points="20 5 20 10 15 10" />
    <path d="M20 12a8 8 0 0 1-15.5 2.5" />
    <polyline points="4 19 4 14 9 14" />
  </svg>
);

export const IconPathwayRecycle: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
  <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <g transform="translate(0, -0.5)">
      <path d="M18.5 14.5v1.5a2 2 0 0 1-1.8 2H8.5" />
      <polygon points="5.5,18 9.5,15 9.5,21" fill="currentColor" stroke="none" />
      <g transform="rotate(120 12 12.5)">
        <path d="M18.5 14.5v1.5a2 2 0 0 1-1.8 2H8.5" />
        <polygon points="5.5,18 9.5,15 9.5,21" fill="currentColor" stroke="none" />
      </g>
      <g transform="rotate(240 12 12.5)">
        <path d="M18.5 14.5v1.5a2 2 0 0 1-1.8 2H8.5" />
        <polygon points="5.5,18 9.5,15 9.5,21" fill="currentColor" stroke="none" />
      </g>
    </g>
  </svg>
);


