import { STATUS_MAP } from "./tokens.js";

/**
 * Badge — renders a coloured pill for any status string.
 * @param {string} status  - key from STATUS_MAP (e.g. "open", "in_transit")
 * @param {string} [label] - override display text (defaults to status)
 */
export default function Badge({ status, label }) {
  const s = STATUS_MAP[status] || STATUS_MAP.idle;
  return (
    <span style={{
      display:       "inline-block",
      background:    s.bg,
      color:         s.color,
      border:        `1px solid ${s.border}`,
      padding:       "2px 10px",
      borderRadius:  4,
      fontSize:      11,
      fontWeight:    700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      whiteSpace:    "nowrap",
    }}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
