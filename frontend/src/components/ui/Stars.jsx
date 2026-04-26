import { COLORS } from "./tokens.js";

/**
 * Stars — renders N filled stars out of 5.
 * @param {number} value - rating value (e.g. 4.8)
 * @param {number} [size=13]
 */
export default function Stars({ value, size = 13 }) {
  return (
    <span style={{ color: COLORS.amber, fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= Math.round(value) ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}
