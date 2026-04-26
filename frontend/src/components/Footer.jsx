import React, { useState } from "react";
import titleImage from "../assets/footer/title.png";
import quickImage from "../assets/footer/quick.png";
import contactImage from "../assets/footer/contact.png";
import followImage from "../assets/footer/follow.png";
import container1 from "../assets/footer/cont1.png";
import container2 from "../assets/footer/cont2.png";
import container3 from "../assets/footer/cont3.png";
import container4 from "../assets/footer/cont4.png";

const ACCENT = "#f97316";

const linkImages = {
  Home: container1,
  Features: container2,
  "How It Works": container3,
  Pricing: container4,
};
const linkRoutes = {
  Home: "home",
  Features: "features",
  "How It Works": "how-it-works",
};

const socials = [
  {
    name: "GitHub",
    href: "#",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "#",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const RollLink = ({ item, image }) => {
  const [hovered, setHovered] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const handleEnter = () => {
    setHovered(true);
    setAnimKey((k) => k + 1);
  };
  const handleClick = () => {
    const el = document.getElementById(linkRoutes[item]);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 48,
        overflow: "hidden",
        marginBottom: 4,
        cursor: "pointer",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          display: "flex",
          alignItems: "center",
          opacity: hovered ? 0 : 1,
          transition: "opacity 0.15s",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "#6b7280",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {item}
        </span>
      </div>
      {hovered && (
        <div
          key={animKey}
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            perspective: "600px",
          }}
        >
          <img
            src={image}
            alt=""
            style={{
              width: 150,
              height: 34,
              objectFit: "contain",
              objectPosition: "left",
              borderRadius: 4,
              animation:
                "imgSpin360 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
              transformStyle: "preserve-3d",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Sora:wght@400;500;600;700&display=swap');
        .sarthix-footer * { box-sizing: border-box; font-family: 'Sora', sans-serif; }
        .f-link { color: #6b7280; text-decoration: none; font-size: 14px; display: block; padding: 5px 0; transition: color 0.18s; }
        .f-link:hover { color: #f97316; }
        .f-social { width: 38px; height: 38px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #9ca3af; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; text-decoration: none; }
        .f-social:hover { color: #fff; background: rgba(255,255,255,0.12); transform: translateY(-2px); }
        .f-legal-link { color: #374151; font-size: 12px; text-decoration: none; transition: color 0.18s; }
        .f-legal-link:hover { color: #f97316; }

        @keyframes imgSpin360 { 0%{transform:rotateX(0deg);opacity:0} 100%{transform:rotateX(360deg);opacity:1} }
        @keyframes mailSpin { 0%{transform:rotateY(0deg);stroke:#6b7280} 50%{transform:rotateY(180deg);stroke:#f97316} 100%{transform:rotateY(360deg);stroke:#f97316} }
        @keyframes mailSpinBack { 0%{transform:rotateY(0deg);stroke:#f97316} 100%{transform:rotateY(-360deg);stroke:#6b7280} }
        @keyframes mailSlideUp { 0%{transform:translateY(0);opacity:.7} 50%{transform:translateY(-3px);opacity:1} 100%{transform:translateY(0);opacity:1} }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr; gap: 20px; }
          .footer-col-img { width: 140px !important; height: 60px !important; }
        }
      `}</style>

      <footer
        className="sarthix-footer"
        style={{
          background: "#0d1117",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(32px, 5vw, 48px) clamp(16px, 5vw, 32px) 20px",
          }}
        >
          <div className="footer-grid">
            {/* Col 1 — Brand */}
            <div>
              <div
                style={{ position: "relative", width: 180, height: 80 }}
                className="footer-col-img"
              >
                <img
                  src={titleImage}
                  alt="Sarthix"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.75,
                  marginTop: 12,
                  maxWidth: 220,
                }}
              >
                Helping drivers find the right loads and shippers move freight
                with ease. Bid, track, and deliver with Sarthix.
              </p>
            </div>

            {/* Col 2 — Quick Links */}
            <div>
              <div
                style={{ position: "relative", width: 180, height: 80 }}
                className="footer-col-img"
              >
                <img
                  src={quickImage}
                  alt="Quick Links"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                {["Home", "Features", "How It Works", "Pricing"].map((item) => (
                  <RollLink key={item} item={item} image={linkImages[item]} />
                ))}
              </div>
            </div>

            {/* Col 3 — Contact */}
            <div>
              <div
                style={{ position: "relative", width: 180, height: 80 }}
                className="footer-col-img"
              >
                <img
                  src={contactImage}
                  alt="Contact"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <a
                  href="mailto:support@sarthix.com"
                  className="f-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    overflow: "hidden",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector(
                      ".mail-icon",
                    ).style.animation =
                      "mailSpin 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards";
                    e.currentTarget.querySelector(
                      ".mail-text",
                    ).style.animation = "mailSlideUp 0.4s ease forwards";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelector(
                      ".mail-icon",
                    ).style.animation = "mailSpinBack 0.4s ease forwards";
                  }}
                >
                  <svg
                    className="mail-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span
                    className="mail-text"
                    style={{
                      display: "inline-block",
                      fontSize: "clamp(12px, 1.5vw, 14px)",
                    }}
                  >
                    support@sarthix.com
                  </span>
                </a>
              </div>
            </div>

            {/* Col 4 — Follow */}
            <div>
              <div
                style={{ position: "relative", width: 180, height: 80 }}
                className="footer-col-img"
              >
                <img
                  src={followImage}
                  alt="Follow Us"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    className="f-social"
                    title={s.name}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            margin: "0 clamp(16px, 5vw, 32px)",
          }}
        />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(12px, 2vw, 18px) clamp(16px, 5vw, 32px)",
            textAlign: "center",
            fontSize: "clamp(11px, 1.5vw, 13px)",
            color: "#4b5563",
          }}
        >
          Made With <span style={{ color: "#ef4444" }}>❤</span> by{" "}
          <span style={{ color: ACCENT, fontWeight: 600 }}>Sarthix Team</span> |
          © 2026 Sarthix. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}
