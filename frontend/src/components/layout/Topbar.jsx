import { useUser } from "@clerk/clerk-react";
import { COLORS, FONTS } from "../ui/tokens.js";
import { IBell, ISearch } from "../ui/Icons.jsx";

export default function Topbar({ pageTitle, unreadCount = 0, onMenuClick }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const name = user?.fullName ?? user?.firstName ?? "";
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join("") || "?";

  return (
    <>
      <style>{`
        @media (min-width: 769px) { .topbar-menu-btn { display: none !important; } }
        @media (max-width: 768px) { .topbar-search { display: none !important; } }
      `}</style>

      <header
        style={{
          height: 60,
          background: COLORS.bg,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(14px, 3vw, 28px)",
          gap: 12,
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 99,
        }}
      >
        {/* Hamburger — mobile only */}
        <button
          className="topbar-menu-btn"
          onClick={onMenuClick}
          style={{
            background: "transparent",
            border: "none",
            color: COLORS.textMuted,
            cursor: "pointer",
            padding: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Page title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: "clamp(14px, 2.5vw, 18px)",
              fontWeight: 700,
              color: COLORS.textPrimary,
              fontFamily: FONTS.display,
              letterSpacing: "0.12em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {pageTitle}
          </h1>
        </div>

        {/* Search — hidden on mobile */}
        <div className="topbar-search" style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: COLORS.textDim,
              display: "flex",
            }}
          >
            <ISearch size={14} />
          </span>
          <input
            placeholder="Search..."
            style={{
              background: "#111",
              border: `1px solid ${COLORS.borderMid}`,
              color: COLORS.textSecondary,
              padding: "7px 14px 7px 32px",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              width: "clamp(140px, 15vw, 200px)",
            }}
          />
        </div>

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.textMuted,
              cursor: "pointer",
              padding: 5,
              display: "flex",
            }}
          >
            <IBell size={18} />
          </button>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 16,
                height: 16,
                background: COLORS.orange,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {/* Initials avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
            border: `2px solid ${COLORS.orangeGlow}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            fontFamily: FONTS.display,
            letterSpacing: "0.05em",
            flexShrink: 0,
            cursor: "pointer",
            boxShadow: `0 0 12px ${COLORS.orangeGlow}`,
          }}
        >
          {initials}
        </div>
      </header>
    </>
  );
}
