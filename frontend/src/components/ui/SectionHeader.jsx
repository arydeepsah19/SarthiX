import { COLORS } from "./tokens.js";
import { IPlus } from "./Icons.jsx";

/**
 * SectionHeader — used at the top of every card or page section.
 * @param {string}            title    - section label (rendered uppercase)
 * @param {string}            [action] - label for the optional CTA button
 * @param {() => void}        [onAction]
 */
export default function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      marginBottom:   14,
    }}>
      <h3 style={{
        fontSize:      12,
        color:         COLORS.textMuted,
        fontWeight:    700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>
        {title}
      </h3>

      {action && (
        <button
          onClick={onAction}
          style={{
            background:    "transparent",
            border:        `1px solid ${COLORS.orange}`,
            color:         COLORS.orange,
            padding:       "5px 14px",
            borderRadius:  6,
            fontSize:      12,
            fontWeight:    600,
            cursor:        "pointer",
            display:       "flex",
            alignItems:    "center",
            gap:           5,
            letterSpacing: "0.04em",
          }}
        >
          <IPlus size={13} />
          {action}
        </button>
      )}
    </div>
  );
}
