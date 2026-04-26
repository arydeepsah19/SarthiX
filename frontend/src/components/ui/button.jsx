import { COLORS, RADIUS } from "./tokens.js";

const VARIANTS = {
  primary: {
    background: COLORS.orange,
    border:     `1px solid ${COLORS.orange}`,
    color:      "#fff",
  },
  ghost: {
    background: "transparent",
    border:     `1px solid ${COLORS.borderHi}`,
    color:      COLORS.textSecondary,
  },
  danger: {
    background: COLORS.redDark,
    border:     `1px solid ${COLORS.redBorder}`,
    color:      COLORS.red,
  },
  success: {
    background: COLORS.greenDark,
    border:     `1px solid ${COLORS.greenBorder}`,
    color:      COLORS.green,
  },
  outline: {
    background: "transparent",
    border:     `1px solid ${COLORS.orange}`,
    color:      COLORS.orange,
  },
};

/**
 * Button — styled button with variant support.
 * @param {"primary"|"ghost"|"danger"|"success"|"outline"} [variant="primary"]
 * @param {React.ReactNode} [icon]   - icon before label
 * @param {string}          [size]   - "sm" | "md" (default)
 * @param {() => void}      onClick
 */
export default function Button({ children, variant = "primary", icon, size = "md", onClick, style = {} }) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const pad = size === "sm" ? "5px 14px" : "9px 22px";
  const fsize = size === "sm" ? 12 : 13;

  return (
    <button
      onClick={onClick}
      style={{
        ...v,
        padding:      pad,
        borderRadius: RADIUS.md,
        fontSize:     fsize,
        fontWeight:   700,
        cursor:       "pointer",
        display:      "inline-flex",
        alignItems:   "center",
        gap:          6,
        letterSpacing:"0.04em",
        ...style,
      }}
    >
      {icon && <span style={{ display: "flex" }}>{icon}</span>}
      {children}
    </button>
  );
}
