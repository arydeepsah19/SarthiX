import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { COLORS, FONTS } from "../ui/tokens.js";
import { ITruck, IUpgrade, IHelp, ILogout } from "../ui/Icons.jsx";

export default function Sidebar({
  role,
  activePage,
  navItems,
  onNav,
  unreadCount = 0,
  appTitle,
  mobileOpen,
  onMobileClose,
}) {
  const { signOut } = useClerk();

  // ✅ Detect screen size properly
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* ✅ Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          width: 220,
          height: "100vh",
          background: COLORS.bg,
          borderRight: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",

          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,

          // ✅ RESPONSIVE LOGIC
          transform: isMobile
            ? mobileOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",

          transition: "transform 0.3s ease",
          boxShadow:
            isMobile && mobileOpen ? "0 0 40px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* ── Logo ── */}
        <div
          style={{
            padding: "22px 20px 18px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: COLORS.orange,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <ITruck size={17} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: COLORS.orange,
                  fontFamily: FONTS.display,
                  letterSpacing: "0.12em",
                }}
              >
                SARTHIX
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: COLORS.textDim,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {appTitle}
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav items ── */}
        <nav
          style={{
            flex: 1,
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const badgeCount =
              item.id === "notifications" ? unreadCount : (item.badge ?? 0);

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNav(item.id);
                  if (isMobile) onMobileClose?.();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  background: isActive ? COLORS.orangeSubtle : "transparent",
                  color: isActive ? COLORS.orange : COLORS.textMuted,
                  borderLeft: isActive
                    ? `2px solid ${COLORS.orange}`
                    : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 400,
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>

                {badgeCount > 0 && (
                  <span
                    style={{
                      background: COLORS.orange,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 10,
                      minWidth: 18,
                      textAlign: "center",
                    }}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "12px 10px",
            borderTop: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <SidebarFooterBtn
            color="#fbbf24"
            icon={<IUpgrade size={16} />}
            label="Upgrade Plan"
          />
          <SidebarFooterBtn
            color={COLORS.textDim}
            icon={<IHelp size={16} />}
            label="Help & Support"
          />
          <SidebarFooterBtn
            color="#f87171"
            icon={<ILogout size={16} />}
            label="Logout"
            onClick={() => signOut({ redirectUrl: "/" })}
          />
        </div>
      </aside>
    </>
  );
}

function SidebarFooterBtn({ color, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 12px",
        borderRadius: 8,
        border: "none",
        background: "transparent",
        color,
        cursor: "pointer",
        width: "100%",
        transition: "background 0.2s",
      }}
    >
      {icon}
      <span style={{ fontSize: 13 }}>{label}</span>
    </button>
  );
}
