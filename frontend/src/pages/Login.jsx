import { SignIn } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

export default function LoginPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const PARTICLE_COUNT = 120;
    const MAX_DIST = 130;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));

    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(249,115,22,0.55)";
        ctx.fill();

        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#060b14",
        display: "flex",
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
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Subtle radial glow behind the card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Clerk SignIn card */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#f97316",
              colorBackground: "#0d1117",
              colorText: "#e5e7eb",
              colorTextSecondary: "rgba(107,114,128,0.8)",
              colorInputBackground: "rgba(249,115,22,0.04)",
              colorInputText: "#e5e7eb",
              colorDanger: "#ef4444",
              borderRadius: "3px",
              fontFamily: "Rajdhani, sans-serif",
            },
            elements: {
              card: {
                background: "rgba(6,11,20,0.97)",
                border: "1px solid rgba(249,115,22,0.22)",
                borderRadius: "4px",
                boxShadow: "none",
              },
              headerTitle: { display: "none" },
              headerSubtitle: { display: "none" },
              formButtonPrimary: {
                background:
                  "linear-gradient(135deg, rgba(249,115,22,0.9), rgba(234,88,12,0.95))",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                boxShadow: "none",
              },
              footerActionLink: {
                color: "#f97316",
                fontWeight: "700",
              },
              dividerLine: {
                background: "rgba(249,115,22,0.15)",
              },
              dividerText: {
                color: "rgba(107,114,128,0.5)",
              },
              socialButtonsBlockButton: {
                border: "1px solid rgba(249,115,22,0.18)",
                background: "transparent",
                color: "rgba(229,231,235,0.6)",
              },
              formFieldLabel: {
                color: "rgba(249,115,22,0.55)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
