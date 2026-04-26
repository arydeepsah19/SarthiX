import { useEffect, useRef, useState } from "react";
import truckImage from "../assets/untitled.png";

const steps = [
  { number: "01", title: "Sign Up & Choose Role",    description: "Register as a Driver or Shipper. Your dashboard is personalized to your role from day one." },
  { number: "02", title: "Post or Browse Shipments", description: "Shippers post loads with details. Drivers browse available shipments and place competitive bids." },
  { number: "03", title: "Bid & Get Selected",       description: "Drivers compete transparently. Shippers compare bids, ETAs, and ratings to pick the best driver." },
  { number: "04", title: "Deliver & Get Paid",       description: "Complete the shipment, earn your payment, and build your reputation through ratings." },
];

const ACCENT = "#f97316";

const HowItWorksSection = () => {
  const outerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getStepReveal = (i) => {
    const threshold = i / (steps.length - 1);
    return Math.min(Math.max((progress - threshold + 0.08) / 0.08, 0), 1);
  };

  useEffect(() => {
    if (isMobile) return; // mobile uses static layout
    const handleScroll = () => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const scrolled  = -rect.top;
      const scrollable = outerRef.current.offsetHeight - window.innerHeight;
      setProgress(Math.min(Math.max(scrolled / scrollable, 0), 1));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const activeStep = Math.min(Math.floor(progress * steps.length), steps.length - 1);

  // ── Mobile layout: simple vertical steps ──────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
          .hiw-mobile * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
        `}</style>
        <div className="hiw-mobile" id="how-it-works" style={{ background: "#fff", padding: "60px 6vw 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}28`, borderRadius: 40, padding: "6px 16px", marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT }}>How It Works</span>
            </div>
            <h2 style={{ fontSize: "clamp(22px, 6vw, 36px)", fontWeight: 800, color: "#0c1322", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              Four steps to <span style={{ color: ACCENT }}>smarter logistics</span>
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 10, lineHeight: 1.6 }}>
              From signup to payday — here's exactly how Sarthix works.
            </p>
          </div>

          {/* Vertical steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative", paddingLeft: 24 }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${ACCENT}, ${ACCENT}33)` }} />

            {steps.map((step, i) => (
              <div key={step.number} style={{ position: "relative", paddingLeft: 28, paddingBottom: 32 }}>
                {/* Node */}
                <div style={{
                  position: "absolute", left: -15, top: 0,
                  width: 32, height: 32, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${ACCENT}, #ea580c)`,
                  border: `3px solid #fff`, boxShadow: `0 0 0 3px ${ACCENT}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#fff",
                }}>
                  {step.number}
                </div>
                {/* Content */}
                <div style={{ background: "#fff", border: `1.5px solid ${ACCENT}20`, borderRadius: 12, padding: "16px 18px", boxShadow: `0 4px 20px rgba(249,115,22,0.08)` }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0c1322", marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── Desktop: sticky scroll animation ──────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .hiw-section * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
        @keyframes pulse-ring  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.7);opacity:0} }
        @keyframes bounce-truck { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      `}</style>

      <div ref={outerRef} className="hiw-section" id="how-it-works"
        style={{ height: "500vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(circle at 15% 85%, rgba(249,115,22,0.05) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(249,115,22,0.05) 0%, transparent 45%)` }} />

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)", width: "100%", position: "relative" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "clamp(24px, 4vh, 56px)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}28`, borderRadius: 40, padding: "6px 16px", marginBottom: 18 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT }}>How It Works</span>
              </div>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 46px)", fontWeight: 800, color: "#0c1322", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Four steps to <span style={{ color: ACCENT }}>smarter logistics</span>
              </h2>
              <p style={{ fontSize: "clamp(13px, 1.5vw, 16px)", color: "#64748b", marginTop: 12, lineHeight: 1.6 }}>
                From signup to payday — here's exactly how Sarthix works.
              </p>
            </div>

            {/* Road + Truck + Steps */}
            <div style={{ position: "relative" }}>
              {/* Road */}
              <div style={{ position: "absolute", top: 32, left: 32, right: 32, height: 6, zIndex: 0 }}>
                <div style={{ position: "absolute", inset: 0, background: "#e2e8f0", borderRadius: 4 }} />
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, backgroundImage: `repeating-linear-gradient(90deg, #cbd5e1 0px, #cbd5e1 16px, transparent 16px, transparent 28px)`, transform: "translateY(-50%)" }} />
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${ACCENT}cc, ${ACCENT})`, borderRadius: 4, transition: "width 0.04s linear", boxShadow: `0 0 14px ${ACCENT}70` }} />
              </div>

              {/* Steps */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(8px, 2vw, 20px)", position: "relative", zIndex: 2 }}>
                {steps.map((step, i) => {
                  const reveal = getStepReveal(i);
                  const isActive = i <= activeStep, isCurrent = i === activeStep;
                  return (
                    <div key={step.number} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ position: "relative", marginBottom: 20 }}>
                        {isCurrent && <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `2px solid ${ACCENT}`, animation: "pulse-ring 1.2s ease-out infinite" }} />}
                        <div style={{ width: "clamp(48px, 5vw, 64px)", height: "clamp(48px, 5vw, 64px)", borderRadius: "50%", background: isActive ? `linear-gradient(135deg, ${ACCENT}, #ea580c)` : "#f1f5f9", border: `3px solid ${isActive ? ACCENT : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isActive ? `0 8px 24px rgba(249,115,22,0.4)` : "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.4s", position: "relative", zIndex: 1 }}>
                          {isActive && i < activeStep
                            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            : <span style={{ fontSize: "clamp(13px, 1.5vw, 18px)", fontWeight: 800, color: isActive ? "#fff" : "#94a3b8", transition: "color 0.4s" }}>{step.number}</span>
                          }
                        </div>
                      </div>
                      <div style={{ background: isActive ? "#fff" : "#f8fafc", border: `1.5px solid ${isActive ? ACCENT + "30" : "#e8eef4"}`, borderRadius: 16, padding: "clamp(12px, 2vw, 20px) clamp(10px, 2vw, 18px)", textAlign: "center", width: "100%", minHeight: 130, display: "flex", flexDirection: "column", justifyContent: "flex-start", boxShadow: isActive ? `0 8px 32px rgba(249,115,22,0.1), 0 2px 8px rgba(0,0,0,0.04)` : "none", opacity: reveal, transform: `translateY(${(1 - reveal) * 20}px)`, transition: "box-shadow 0.4s, border-color 0.4s, background 0.4s", pointerEvents: reveal > 0.1 ? "auto" : "none" }}>
                        <h3 style={{ fontSize: "clamp(12px, 1.3vw, 15px)", fontWeight: 700, color: isActive ? "#0c1322" : "#64748b", marginBottom: 8, transition: "color 0.4s" }}>{step.title}</h3>
                        <p style={{ fontSize: "clamp(11px, 1.1vw, 13px)", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Truck */}
              <div style={{ position: "absolute", top: 6, left: `calc(${progress * 88}% - 44px)`, transition: "left 0.04s linear", zIndex: 3, animation: progress > 0.02 && progress < 0.98 ? "bounce-truck 0.4s ease-in-out infinite" : "none", filter: `drop-shadow(0 6px 16px rgba(249,115,22,0.4))` }}>
                <img src={truckImage} alt="truck" style={{ width: "clamp(60px, 8vw, 88px)", height: "clamp(36px, 5vw, 52px)", objectFit: "contain" }} />
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "clamp(24px, 4vh, 48px)", fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
              {progress < 0.03 ? "↓ Scroll to drive through each step" : progress > 0.97 ? "🎉 Shipment complete! Ready to get started?" : `Step ${activeStep + 1} of 4 — ${steps[activeStep].title}`}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorksSection;