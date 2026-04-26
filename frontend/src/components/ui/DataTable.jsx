import { COLORS } from "./tokens.js";

/**
 * DataTable — generic dark-themed table.
 *
 * @param {string[]}   columns   - header labels
 * @param {Array}      rows      - array of data objects
 * @param {Function}   renderRow - (row, index) => <tr>...</tr>
 */
export default function DataTable({ columns, rows, renderRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.borderMid}` }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  padding:       "10px 14px",
                  textAlign:     "left",
                  color:         COLORS.textMuted,
                  fontWeight:    700,
                  fontSize:      11,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  whiteSpace:    "nowrap",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => renderRow(row, i))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * TableRow — convenience wrapper for a <tr> with a subtle bottom border.
 */
export function TableRow({ children, isLast = false }) {
  return (
    <tr style={{ borderBottom: isLast ? "none" : `1px solid ${COLORS.border}` }}>
      {children}
    </tr>
  );
}

/**
 * TableCell — convenience <td> with consistent padding/color.
 */
export function TableCell({ children, color, bold, style = {} }) {
  return (
    <td style={{
      padding:    "12px 14px",
      color:      color ?? COLORS.textPrimary,
      fontWeight: bold ? 700 : 400,
      ...style,
    }}>
      {children}
    </td>
  );
}
