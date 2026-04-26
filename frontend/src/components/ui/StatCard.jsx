import { COLORS, FONTS } from "./tokens.js";

/**
 * StatCard — metric display card used in dashboard overview rows.
 * @param {string}            label   - muted uppercase label
 * @param {string|number}     value   - large primary number/text
 * @param {string}            [color] - value text color (defaults to white)
 * @param {string}            [sub]   - small helper text below value
 * @param {React.ReactNode}   [icon]  - decorative background icon
 */
export default function StatCard({ label, value, color = "#e2e8f0", sub, icon }) {
  return (
    <div style={{
      background:   "linear-gradient(135deg, #1a1a1a 0%, #111 100%)",
      border:       "1px solid #2a2a2a",
      borderRadius: 10,
      padding:      "18px 20px",
      flex:         1,
      minWidth:     130,
      position:     "relative",
      overflow:     "hidden",
    }}>
      {/* Decorative background icon */}
      {icon && (
        <div style={{
          position: "absolute", right: 14, top: 14,
          opacity: 0.1, color: COLORS.orange, pointerEvents: "none",
        }}>
          {icon}
        </div>
      )}

      <div style={{
        fontSize:      11,
        color:         COLORS.textMuted,
        fontWeight:    600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom:  8,
      }}>
        {label}
      </div>

      <div style={{
        fontSize:      28,
        fontWeight:    700,
        color,
        fontFamily:    FONTS.display,
        letterSpacing: "0.05em",
        lineHeight:    1,
      }}>
        {value}
      </div>

      {sub && (
        <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 5 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
