// ─── Design Tokens ────────────────────────────────────────────────────────────
export const COLORS = {
  bg:        "#080808",
  bgCard:    "#0e0e0e",
  bgCardAlt: "#141414",
  bgInput:   "#0a0a0a",
  bgHover:   "#111111",
  border:    "#1a1a1a",
  borderMid: "#222222",
  borderHi:  "#2a2a2a",

  orange:       "#f97316",
  orangeDark:   "#ea580c",
  orangeGlow:   "#f9731640",
  orangeDim:    "#7c2d12",
  orangeSubtle: "#1a0d00",

  textPrimary:   "#e2e8f0",
  textSecondary: "#9ca3af",
  textMuted:     "#6b7280",
  textDim:       "#4b5563",

  green:      "#4ade80",
  greenDark:  "#052e16",
  greenBorder:"#22543d",

  blue:      "#60a5fa",
  blueDark:  "#1a2a3a",
  blueBorder:"#1e3a5f",

  amber:      "#fbbf24",
  amberDark:  "#1c1a07",
  amberBorder:"#4a3d00",

  red:      "#f87171",
  redDark:  "#1c0909",
  redBorder:"#4a1a1a",
};

export const FONTS = {
  display: "'Bebas Neue', cursive",
  body:    "'DM Sans', sans-serif",
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
};

// Status → visual style mapping (used by Badge)
export const STATUS_MAP = {
  open:       { bg: "#1a3a2a", color: "#4ade80", border: "#22543d" },
  assigned:   { bg: "#1a2a3a", color: "#60a5fa", border: "#1e3a5f" },
  in_transit: { bg: "#2a2a1a", color: "#fbbf24", border: "#4a3d00" },
  delivered:  { bg: "#1a2a1a", color: "#86efac", border: "#14532d" },
  cancelled:  { bg: "#2a1a1a", color: "#f87171", border: "#4a1a1a" },
  pending:    { bg: "#1a2a3a", color: "#60a5fa", border: "#1e3a5f" },
  accepted:   { bg: "#1a3a2a", color: "#4ade80", border: "#22543d" },
  rejected:   { bg: "#2a1a1a", color: "#f87171", border: "#4a1a1a" },
  active:     { bg: "#1a3a2a", color: "#4ade80", border: "#22543d" },
  warning:    { bg: "#2a2a1a", color: "#fbbf24", border: "#4a3d00" },
  expired:    { bg: "#2a1a1a", color: "#f87171", border: "#4a1a1a" },
  idle:       { bg: "#1e1e1e", color: "#9ca3af", border: "#2d2d2d" },
};

// Global stylesheet injected once
export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: ${COLORS.bg}; font-family: ${FONTS.body}; color: ${COLORS.textPrimary}; }
  input, select, button, textarea { font-family: ${FONTS.body}; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
  button { transition: opacity 0.15s, background 0.15s; }
  button:hover { opacity: 0.88; }
`;
