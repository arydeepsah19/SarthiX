import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import { COLORS, FONTS, GLOBAL_STYLES } from "./ui/tokens.js";

// ── Particle engine ───────────────────────────────────────────────────────────
function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let raf;
    let particles = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const COUNT = 90;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height,
        r:    Math.random() * 1.8 + 0.3,
        vx:   (Math.random() - 0.5) * 0.35,
        vy:   (Math.random() - 0.5) * 0.35,
        // alternate between orange and blue-white particles
        hue:  Math.random() > 0.85 ? "orange" : "dim",
      });
    }

    const CONNECT_DIST = 130;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move + wrap
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.hue === "orange") {
          ctx.fillStyle = "rgba(249,115,22,0.75)";
        } else {
          ctx.fillStyle = "rgba(180,180,200,0.35)";
        }
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
}

// ── RoleSelect ────────────────────────────────────────────────────────────────
function RoleSelect({ onSelect }) {
  const { getToken }          = useAuth();
  const apiUrl                = import.meta.env.VITE_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingRole, setSubmittingRole] = useState(null);
  const [error,       setError]       = useState("");
  const [hoveredRole, setHoveredRole] = useState(null);
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const selectRole = async (role) => {
    try {
      setIsSubmitting(true);
      setSubmittingRole(role);
      setError("");

      if (onSelect) {
        await onSelect(role);
        return;
      }

      const token    = await getToken();
      const response = await fetch(`${apiUrl}/api/users/set-role`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ role }),
      });

      if (!response.ok) throw new Error(`Role update failed with status ${response.status}`);
      window.location.reload();
    } catch (err) {
      setError(err.message || "Failed to save role");
    } finally {
      setIsSubmitting(false);
      setSubmittingRole(null);
    }
  };

  return (
    <>
      <style>{GLOBAL_STYLES + KEYFRAMES}</style>

      {/* Full-screen container */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: COLORS.bg,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Radial glow behind content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(249,115,22,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 48,
            padding: "0 24px",
            width: "100%",
            maxWidth: 860,
            gap: "clamp(24px, 5vw, 48px)",
          }}
        >
          {/* Logo + tagline */}
          <div
            style={{
              textAlign: "center",
              animation: "fadeSlideDown 0.6s ease both",
            }}
          >
            <div
              style={{
                fontSize: "clamp(40px, 12vw, 96px)", // smaller on mobile
                fontFamily: FONTS.display,
                fontWeight: 900,
                color: COLORS.orange,
                letterSpacing: "0.12em",
                lineHeight: 1,
                textShadow: `0 0 40px rgba(249,115,22,0.35)`,
              }}
            >
              SARTHIX
            </div>

            <div
              style={{
                fontSize: "clamp(9px, 2.5vw, 11px)",
                color: COLORS.textDim,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginTop: 10,
              }}
            >
              Logistics · Bidding · Compliance
            </div>
          </div>

          {/* Prompt */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(16px, 4vw, 24px)",
                fontWeight: 600,
                color: COLORS.textPrimary,
                marginBottom: 6,
              }}
            >
              How will you use SARTHIX?
            </div>

            <div
              style={{
                fontSize: "clamp(11px, 3vw, 13px)",
                color: COLORS.textMuted,
              }}
            >
              Choose your role to continue. This cannot be changed later.
            </div>
          </div>

          {/* Role cards */}
          <div
            style={{
              display: "flex",
              gap: "clamp(12px, 3vw, 20px)",
              width: "100%",
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "fadeSlideUp 0.7s 0.2s ease both",
              opacity: 0,
            }}
          >
            <RoleCard
              role="driver"
              icon="🚛"
              title="Driver"
              subtitle="Command Center"
              description="Bid on shipments, manage your fleet, track earnings, handle permits and compliance — all in one place."
              features={[
                "Browse open shipments",
                "Place & track bids",
                "Manage vehicles & permits",
                "View trip history & ratings",
              ]}
              accent={COLORS.orange}
              accentDim={COLORS.orangeDim}
              accentGlow="rgba(249,115,22,0.12)"
              hovered={hoveredRole === "driver"}
              submitting={submittingRole === "driver"}
              disabled={isSubmitting}
              onHover={() => setHoveredRole("driver")}
              onLeave={() => setHoveredRole(null)}
              onClick={() => selectRole("driver")}
            />
            <RoleCard
              role="company"
              icon="🏭"
              title="Shipper"
              subtitle="Control Hub"
              description="Post shipments, review driver bids, track deliveries in real time, and manage your logistics spend."
              features={[
                "Post shipments with images",
                "Review & accept bids",
                "Track deliveries live",
                "Manage team & spend",
              ]}
              accent="#60a5fa"
              accentDim="#1e3a5f"
              accentGlow="rgba(96,165,250,0.10)"
              hovered={hoveredRole === "company"}
              submitting={submittingRole === "company"}
              disabled={isSubmitting}
              onHover={() => setHoveredRole("company")}
              onLeave={() => setHoveredRole(null)}
              onClick={() => selectRole("company")}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#1c0909",
                border: "1px solid #4a1a1a",
                color: "#f87171",
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 13,
                animation: "fadeSlideUp 0.3s ease both",
              }}
            >
              {error}
            </div>
          )}

          {/* Footer note */}
          <div
            style={{
              fontSize: 11,
              color: COLORS.textDim,
              textAlign: "center",
              animation: "fadeIn 1s 0.5s ease both",
              opacity: 0,
            }}
          >
            Secured by Clerk · Your data is encrypted end-to-end
          </div>
        </div>
      </div>
    </>
  );
}

// ── Role card ─────────────────────────────────────────────────────────────────
function RoleCard({ icon, title, subtitle, description, features, accent, accentDim, accentGlow, hovered, submitting, disabled, onHover, onLeave, onClick }) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        flex: "1 1 280px", // better min width
        width: "100%",
        maxWidth: 380,
        background: hovered ? "#111" : "#0c0c0c",
        border: `1px solid ${hovered ? accent : COLORS.borderMid}`,
        borderRadius: 16,
        padding: "clamp(18px, 4vw, 28px)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled && !submitting ? 0.5 : 1,
        transition: "all 0.22s ease",
        boxShadow: hovered
          ? `0 0 40px ${accentGlow}, 0 8px 32px rgba(0,0,0,0.5)`
          : "0 4px 20px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
      onClick={disabled ? undefined : onClick}
    >
      {/* Icon + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 44, lineHeight: 1 }}>{icon}</div>
        <div
          style={{
            background: `${accentDim}88`,
            border: `1px solid ${accent}44`,
            color: accent,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "clamp(22px, 5vw, 28px)",
          fontWeight: 900,
          color: accent,
          fontFamily: FONTS.display,
          letterSpacing: "0.08em",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "clamp(12px, 3vw, 13px)",
          color: COLORS.textSecondary,
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {features.map((f) => (
          <div
            key={f}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 12,
              color: COLORS.textMuted,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: accent,
                flexShrink: 0,
              }}
            />
            {f}
          </div>
        ))}
      </div>

      {/* CTA button */}
      <button
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onClick();
        }}
        style={{
          marginTop: 4,
          width: "100%",
          padding: "clamp(10px, 3vw, 12px) 0",
          fontSize: "clamp(12px, 3vw, 13px)",
          borderRadius: 10,
          border: "none",
          background: submitting
            ? `${accent}22`
            : hovered
              ? `linear-gradient(135deg, ${accent}, ${accent}bb)`
              : `${accent}18`,
          color: submitting ? COLORS.textMuted : hovered ? "#fff" : accent,
          fontWeight: 700,
          letterSpacing: "0.05em",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {submitting ? (
          <>
            <Spinner color={accent} />
            Setting up your account…
          </>
        ) : (
          `Enter as ${title} →`
        )}
      </button>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ color }) {
  return (
    <div style={{
      width:  14, height: 14,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ── Keyframes ─────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default RoleSelect;