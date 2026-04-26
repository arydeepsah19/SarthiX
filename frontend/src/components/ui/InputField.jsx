import { COLORS, RADIUS } from "./tokens.js";

const BASE = {
  width:        "100%",
  background:   COLORS.bgInput,
  border:       `1px solid ${COLORS.borderHi}`,
  color:        COLORS.textPrimary,
  padding:      "10px 14px",
  borderRadius: RADIUS.md,
  fontSize:     14,
  outline:      "none",
  boxSizing:    "border-box",
};

/**
 * InputField — labelled text input.
 * @param {string} label
 * @param {string} [type="text"]
 * @param {string} [defaultValue]
 * @param {string} [placeholder]
 */
export function InputField({ label, type = "text", defaultValue, placeholder, style = {} }) {
  return (
    <div>
      {label && (
        <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>
          {label}
        </label>
      )}
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={{ ...BASE, ...style }}
      />
    </div>
  );
}

/**
 * SelectField — labelled select dropdown.
 * @param {string}   label
 * @param {string[]} options
 * @param {string}   [defaultValue]
 * @param {string}   [accentColor] - text color override for selected value
 */
export function SelectField({ label, options, defaultValue, accentColor, style = {} }) {
  return (
    <div>
      {label && (
        <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>
          {label}
        </label>
      )}
      <select
        defaultValue={defaultValue}
        style={{ ...BASE, color: accentColor ?? COLORS.textPrimary, cursor: "pointer", ...style }}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
