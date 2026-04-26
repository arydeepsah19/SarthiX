import { useState, useEffect, useRef } from "react";
import { Gavel, ShieldCheck, Route, Star, Bell, BarChart3 } from "lucide-react";

const ACCENT = "#f97316";

const features = [
  { icon: Gavel,    title: "Transparent Bidding",   description: "Drivers compete for shipments through timed, open bidding. Shippers compare offers and pick the best fit.", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80", tag: "Marketplace", number: "01" },
  { icon: ShieldCheck, title: "Permit Compliance", description: "Automated tracking of vehicle permits with 30-day warnings and critical expiry alerts to avoid penalties.",   image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80", tag: "Compliance",  number: "02" },
  { icon: Route,    title: "Shipment Tracking",      description: "End-to-end shipment lifecycle management from posting to delivery completion and earnings recording.",       image: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&q=80", tag: "Logistics",   number: "03" },
  { icon: Star,     title: "Driver Ratings",         description: "Shippers rate drivers after completion, building a trust-based ecosystem with performance analytics.",        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80", tag: "Trust",       number: "04" },
  { icon: Bell,     title: "Smart Notifications",    description: "Real-time alerts for bid updates, shipment status changes, and permit expiry warnings.",                      image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80", tag: "Alerts",      number: "05" },
  { icon: BarChart3, title: "Performance Analytics", description: "Drivers track earnings, completed trips, and ratings. Shippers monitor shipment metrics at a glance.",       image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",  tag: "Insights",    number: "06" },
];

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const FeatureCard = ({ feature, index }) => {
  const [hovered, setHovered] = useState(false);
  const [cardRef, inView]     = useInView();
  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 20, overflow: "hidden", cursor: "pointer",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`,
        height: "clamp(260px, 30vw, 340px)",
        boxShadow: hovered ? `0 30px 60px rgba(249,115,22,0.28), 0 8px 24px rgba(0,0,0,0.14)` : "0 4px 20px rgba(0,0,0,0.07)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${feature.image})`, backgroundSize: "cover", backgroundPosition: "center", transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)", filter: hovered ? "brightness(0.45)" : "brightness(0.75)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: hovered ? `linear-gradient(135deg, rgba(249,115,22,0.38) 0%, rgba(194,65,12,0.18) 100%)` : "transparent", transition: "background 0.5s" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: hovered ? `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` : "transparent", transition: "background 0.4s" }} />

      <div style={{ position: "absolute", top: 20, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: hovered ? ACCENT : "rgba(255,255,255,0.45)", fontFamily: "monospace", transition: "color 0.3s" }}>{feature.number}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: hovered ? "#fff" : "rgba(255,255,255,0.5)", background: hovered ? `${ACCENT}35` : "rgba(255,255,255,0.08)", border: `1px solid ${hovered ? ACCENT + "70" : "rgba(255,255,255,0.15)"}`, padding: "4px 10px", borderRadius: 20, transition: "all 0.3s" }}>{feature.tag}</span>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(16px, 3vw, 28px) clamp(14px, 3vw, 24px) clamp(14px, 3vw, 26px)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: hovered ? ACCENT : "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, transition: "all 0.35s", border: `1px solid ${hovered ? "transparent" : "rgba(255,255,255,0.15)"}`, transform: hovered ? "scale(1.1) rotate(-4deg)" : "scale(1) rotate(0deg)" }}>
          <Icon size={20} color="#fff" />
        </div>
        <h3 style={{ fontSize: "clamp(14px, 1.5vw, 18px)", fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{feature.title}</h3>
        <p style={{ fontSize: "clamp(11px, 1.2vw, 13.5px)", color: "rgba(255,255,255,0.72)", lineHeight: 1.55, margin: 0, maxHeight: hovered ? 80 : 0, opacity: hovered ? 1 : 0, overflow: "hidden", transition: "max-height 0.4s, opacity 0.35s" }}>{feature.description}</p>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const [headerRef, headerInView] = useInView(0.2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .features-section * { font-family: 'Sora', sans-serif; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .features-stats {
          display: flex;
          justify-content: center;
          gap: 0;
          margin-top: 64px;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e8eef4;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .features-stat-item {
          flex: 1; text-align: center;
          padding: clamp(18px, 3vw, 32px) clamp(12px, 2vw, 24px);
          border-right: 1px solid #f1f5f9;
        }
        .features-stat-item:last-child { border-right: none; }

        @media (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 580px) {
          .features-grid { grid-template-columns: 1fr; gap: 12px; }
          .features-stats { flex-direction: column; border-radius: 14px; }
          .features-stat-item { border-right: none; border-bottom: 1px solid #f1f5f9; padding: 16px; }
          .features-stat-item:last-child { border-bottom: none; }
        }
      `}</style>

      <section className="features-section" id="features" style={{ background: "#f8fafc", padding: "clamp(60px, 8vw, 100px) 0 clamp(60px, 8vw, 120px)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)`, backgroundSize: "30px 30px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(16px, 5vw, 24px)", position: "relative" }}>
          <div ref={headerRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "clamp(36px, 6vw, 64px)", opacity: headerInView ? 1 : 0, transform: headerInView ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}28`, borderRadius: 40, padding: "6px 16px", marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT }}>Platform Features</span>
            </div>
            <h2 style={{ fontSize: "clamp(24px, 5vw, 52px)", fontWeight: 800, color: "#0c1322", marginBottom: 18, lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: 580 }}>
              Everything you need to move freight{" "}
              <span style={{ color: ACCENT, position: "relative", display: "inline-block" }}>
                smarter
                <svg viewBox="0 0 120 10" style={{ position: "absolute", bottom: -3, left: 0, width: "100%", height: 9, overflow: "visible" }}>
                  <path d="M2 7 Q30 1 60 7 Q90 13 118 5" stroke={ACCENT} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
                </svg>
              </span>
            </h2>
            <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "#64748b", lineHeight: 1.65, maxWidth: 460 }}>
              From bidding to delivery, Sarthix handles the complexity so you can focus on the road.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>

          <div className="features-stats">
            {[
              { value: "10K+", label: "Active Drivers"    },
              { value: "98%",  label: "On-time Delivery"  },
              { value: "4.9★", label: "Avg. Rating"       },
              { value: "₹2Cr+", label: "Earnings Tracked" },
            ].map((stat, i) => (
              <div key={stat.label} className="features-stat-item">
                <div style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: ACCENT, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 7 }}>{stat.value}</div>
                <div style={{ fontSize: "clamp(11px, 1.2vw, 13px)", color: "#94a3b8", fontWeight: 500, letterSpacing: "0.02em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;