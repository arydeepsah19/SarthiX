import { COLORS, RADIUS } from "./tokens.js";

export default function ErrorBanner({ message, onRetry, context = "data" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "48px 24px",
        background: "#1c0909",
        border: "1px solid #4a1a1a",
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28 }}>⚠️</div>

      <div style={{ color: "#f87171", fontWeight: 700, fontSize: 15 }}>
        Failed to load {context}
      </div>

      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 13,
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {message}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: "#1c0909",
            border: "1px solid #4a1a1a",
            color: "#f87171",
            padding: "8px 22px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
