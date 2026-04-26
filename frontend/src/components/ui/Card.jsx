import { COLORS, RADIUS } from "./tokens.js";

/**
 * Card — dark surface container used throughout every page.
 * @param {React.ReactNode} children
 * @param {React.CSSProperties} [style] - additional inline overrides
 * @param {string} [padding] - override default padding
 */
export default function Card({ children, style = {}, padding = "20px 22px" }) {
  return (
    <div style={{
      background:   `linear-gradient(160deg, ${COLORS.bgCardAlt} 0%, ${COLORS.bgCard} 100%)`,
      border:       `1px solid ${COLORS.borderMid}`,
      borderRadius: RADIUS.xl,
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}
