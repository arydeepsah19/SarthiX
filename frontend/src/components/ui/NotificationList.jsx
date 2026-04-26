import Card from "./Card.jsx";
import { COLORS } from "./tokens.js";

export default function NotificationList({ notifications, onMarkRead }) {
  if (notifications.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 0",
          color: COLORS.textMuted,
          fontSize: 13,
        }}
      >
        You're all caught up — no notifications.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {notifications.map((n) => (
        <Card
          key={n.id ?? n.msg}
          padding="14px 18px"
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            opacity: n.read ? 0.55 : 1,
            transition: "opacity 0.3s",
            borderLeft: n.read
              ? `3px solid ${COLORS.borderMid}`
              : `3px solid ${COLORS.orange}`,
          }}
        >
          {/* Unread dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: n.read ? "#374151" : COLORS.orange,
              marginTop: 5,
              flexShrink: 0,
              boxShadow: n.read ? "none" : `0 0 8px ${COLORS.orange}`,
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                color: COLORS.textPrimary,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {n.msg}
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 4 }}>
              {n.time}
            </div>
          </div>

          {!n.read && onMarkRead && (
            <button
              onClick={() => {
                console.log("Mark read clicked, id:", n.id);
                onMarkRead(n.id);
              }}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.borderHi}`,
                color: COLORS.textMuted,
                cursor: "pointer",
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = COLORS.orange;
                e.target.style.color = COLORS.orange;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = COLORS.borderHi;
                e.target.style.color = COLORS.textMuted;
              }}
            >
              Mark read
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}
