import { useState, useEffect, useRef } from "react";

const ACCENT = "#f97316";

const reviews = [
  {
    id: 0,
    name: "Rajesh Kumar",
    role: "Fleet Owner, Delhi",
    avatar: "RK",
    rating: 5,
    text: "Sarthix completely changed how I manage my fleet. The bidding system is transparent and I get 40% more shipments every month.",
    color: "#f97316",
  },
  {
    id: 1,
    name: "Priya Sharma",
    role: "Logistics Manager, Mumbai",
    avatar: "PS",
    rating: 5,
    text: "Permit tracking alone saved us from 3 penalties this quarter. The 30-day alerts are a lifesaver for compliance.",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Amitabh Singh",
    role: "Independent Driver, Pune",
    avatar: "AS",
    rating: 5,
    text: "I used to waste hours finding loads. Now I open Sarthix, pick the best bid, and I'm on the road within the hour.",
    color: "#10b981",
  },
  {
    id: 3,
    name: "Kavitha Nair",
    role: "Shipper, Bangalore",
    avatar: "KN",
    rating: 5,
    text: "Comparing driver ratings before choosing gives me confidence. Our delivery success rate went from 82% to 97%.",
    color: "#8b5cf6",
  },
  {
    id: 4,
    name: "Suresh Patel",
    role: "Transport Co., Ahmedabad",
    avatar: "SP",
    rating: 5,
    text: "The analytics dashboard is incredible. I can see earnings trends, peak routes, and driver performance at a glance.",
    color: "#ec4899",
  },
  {
    id: 5,
    name: "Meena Iyer",
    role: "Supply Chain Lead, Chennai",
    avatar: "MI",
    rating: 4,
    text: "Real-time notifications keep me updated without constant checking. The shipment tracking is as good as premium solutions.",
    color: "#14b8a6",
  },
  {
    id: 6,
    name: "Harpreet Dhillon",
    role: "Truck Owner, Ludhiana",
    avatar: "HD",
    rating: 5,
    text: "Built my reputation from zero on Sarthix. My rating is 4.9 now and shippers reach out to me directly for loads.",
    color: "#f59e0b",
  },
  {
    id: 7,
    name: "Deepak Verma",
    role: "Small Shipper, Jaipur",
    avatar: "DV",
    rating: 5,
    text: "Even as a small business posting maybe 5 shipments a month, I get competitive bids within minutes. Fantastic platform.",
    color: "#6366f1",
  },
];

const N = reviews.length;

const getRadius = () => {
  if (typeof window === "undefined") return 380;
  if (window.innerWidth < 480) return 130;
  if (window.innerWidth < 768) return 200;
  if (window.innerWidth < 1024) return 290;
  return 380;
};

const StarRating = ({ rating, size = 13 }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={s <= rating ? "#fbbf24" : "#d1d5db"}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export default function ReviewsSection() {
  const [rotY, setRotY] = useState(0);
  const [active, setActive] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [radius, setRadius] = useState(getRadius());

  const dragStart = useRef(null);
  const velRef = useRef(0);
  const rotRef = useRef(0);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setRadius(getRadius());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current && !dragging) {
        rotRef.current += 0.15;
        setRotY(rotRef.current);
      } else if (!dragging && Math.abs(velRef.current) > 0.01) {
        rotRef.current += velRef.current;
        velRef.current *= 0.93;
        setRotY(rotRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dragging]);

  const onPointerDown = (e) => {
    if (active !== null) return;
    setDragging(true);
    pausedRef.current = true;
    velRef.current = 0;
    dragStart.current = { x: e.clientX, rot: rotRef.current, time: Date.now() };
  };
  const onPointerMove = (e) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    rotRef.current =
      dragStart.current.rot + dx * (window.innerWidth < 768 ? 0.25 : 0.35);
    setRotY(rotRef.current);
  };
  const onPointerUp = (e) => {
    if (!dragging || !dragStart.current) return;
    setDragging(false);
    const dt = Date.now() - dragStart.current.time;
    const dx = e.clientX - dragStart.current.x;
    velRef.current = (dx / Math.max(dt, 1)) * 12;
    setTimeout(() => {
      if (active === null) pausedRef.current = false;
    }, 800);
    dragStart.current = null;
  };
  const handleCardClick = (e, idx) => {
    e.stopPropagation();
    if (dragging) return;
    setActive(idx);
    pausedRef.current = true;
  };
  const closeActive = (e) => {
    e && e.stopPropagation();
    setActive(null);
    setTimeout(() => {
      pausedRef.current = false;
    }, 300);
  };

  const getTransform = (i) => {
    const effective = (360 / N) * i + rotY;
    const rad = (effective * Math.PI) / 180;
    const x = Math.sin(rad) * radius;
    const z = Math.cos(rad) * radius;
    const tilt = (16 * Math.PI) / 180;
    const y = -z * Math.sin(tilt) * 0.38;
    const depth = (Math.cos(rad) + 1) / 2;
    const scale = 0.58 + depth * 0.42;
    const opac = 0.38 + depth * 0.62;
    const zIndex = Math.round(depth * 100);
    return { x, y, scale, opac, zIndex, depth };
  };

  const activeReview = active !== null ? reviews[active] : null;

  // Card dimensions — responsive
  const cardW = radius < 180 ? 130 : radius < 250 ? 180 : 240;
  const cardH = radius < 180 ? 90 : radius < 250 ? 110 : 138;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .rev3d * { font-family:'Sora',sans-serif; box-sizing:border-box; }
        @keyframes floatIn { from{opacity:0;transform:translate(-50%,-50%) scale(0.84)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes subtlePulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
        .rev-card-3d { position:absolute; cursor:pointer; will-change:transform; transition:filter .2s,box-shadow .2s; }
        .rev-card-3d:hover { filter:brightness(1.06); }
        .close-btn:hover { background:rgba(0,0,0,.08) !important; color:#374151 !important; }
      `}</style>

      <section
        className="rev3d"
        id="reviews"
        style={{
          background: "#f5f5f5",
          padding: "clamp(40px, 8vw, 80px) 0",
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,.05) 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `radial-gradient(circle, rgba(249,115,22,.12) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
            opacity: 0.5,
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 clamp(14px, 5vw, 24px)",
            position: "relative",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: `${ACCENT}15`,
                border: `1px solid ${ACCENT}30`,
                borderRadius: 40,
                padding: "6px 16px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: ACCENT,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: ACCENT,
                }}
              >
                Reviews
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(20px, 4vw, 44px)",
                fontWeight: 800,
                color: "#0c1322",
                letterSpacing: "-.03em",
                lineHeight: 1.1,
              }}
            >
              Trusted by drivers &{" "}
              <span style={{ color: ACCENT }}>shippers across India</span>
            </h2>
            <p
              style={{
                fontSize: "clamp(12px, 1.5vw, 15px)",
                color: "#6b7280",
                marginTop: 10,
              }}
            >
              Drag to spin · Click any card to read the full review
            </p>
          </div>

          {/* 3D Stage */}
          <div
            onClick={active !== null ? closeActive : undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{
              position: "relative",
              height: `clamp(300px, 55vh, 580px)`,
              cursor:
                active !== null ? "default" : dragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            {/* Orbit rings */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%) scaleY(.26)",
                width: radius * 2 + 100,
                height: radius * 2 + 100,
                borderRadius: "50%",
                border: `1.5px solid ${ACCENT}30`,
                pointerEvents: "none",
                boxShadow: `0 0 30px ${ACCENT}15`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%) scaleY(.26)",
                width: radius * 2 + 160,
                height: radius * 2 + 160,
                borderRadius: "50%",
                border: "1px dashed rgba(0,0,0,.07)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: activeReview
                  ? `radial-gradient(circle, ${activeReview.color}18 0%, transparent 70%)`
                  : `radial-gradient(circle, ${ACCENT}0e 0%, transparent 70%)`,
                transition: "background .6s",
                pointerEvents: "none",
              }}
            />

            {/* Cards */}
            {reviews.map((review, i) => {
              const { x, y, scale, opac, zIndex, depth } = getTransform(i);
              const isActive = active === i;
              return (
                <div
                  key={review.id}
                  className="rev-card-3d"
                  onClick={(e) => handleCardClick(e, i)}
                  style={{
                    left: "50%",
                    top: "50%",
                    marginLeft: x - cardW / 2,
                    marginTop: y - cardH / 2,
                    width: cardW,
                    height: cardH,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    opacity: isActive ? 0 : opac,
                    zIndex: isActive ? 0 : zIndex,
                    borderRadius: 16,
                    background:
                      depth > 0.7
                        ? "rgba(255,255,255,0.98)"
                        : "rgba(255,255,255,0.82)",
                    border: `1.5px solid ${review.color}${Math.round(
                      25 + depth * 55,
                    )
                      .toString(16)
                      .padStart(2, "0")}`,
                    boxShadow:
                      depth > 0.7
                        ? `0 8px 32px rgba(0,0,0,.1), 0 0 20px ${review.color}18`
                        : "0 2px 10px rgba(0,0,0,.06)",
                    padding: "clamp(8px, 2vw, 14px) clamp(8px, 2vw, 16px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "opacity .4s",
                    pointerEvents: isActive ? "none" : "auto",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, transparent, ${review.color}, transparent)`,
                      borderRadius: "16px 16px 0 0",
                      opacity: depth > 0.6 ? 1 : 0.4,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "clamp(9px, 1.1vw, 12px)",
                      color: "#374151",
                      lineHeight: 1.55,
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontStyle: "italic",
                    }}
                  >
                    "{review.text}"
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${review.color}, ${review.color}99)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        fontWeight: 800,
                        color: "#fff",
                      }}
                    >
                      {review.avatar}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "clamp(8px, 1vw, 11px)",
                          fontWeight: 700,
                          color: "#111827",
                          lineHeight: 1.2,
                        }}
                      >
                        {review.name}
                      </div>
                      <StarRating
                        rating={review.rating}
                        size={radius < 200 ? 8 : 10}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Frosted backdrop */}
            {active !== null && (
              <div
                onClick={closeActive}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                  width: "clamp(280px, 90vw, 460px)",
                  height: "clamp(220px, 45vh, 320px)",
                  borderRadius: 28,
                  background: `${activeReview.color}0a`,
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: `1px solid ${activeReview.color}20`,
                  boxShadow: `0 0 80px ${activeReview.color}18`,
                  zIndex: 200,
                  pointerEvents: "none",
                  transition: "background .5s, border .5s",
                }}
              />
            )}

            {/* Active card center */}
            {active !== null && (
              <div
                key={`c-${active}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "clamp(260px, 85vw, 400px)",
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1.5px solid ${activeReview.color}40`,
                  borderRadius: 24,
                  padding:
                    "clamp(18px, 4vw, 32px) clamp(16px, 4vw, 28px) clamp(14px, 3vw, 26px)",
                  zIndex: 300,
                  animation:
                    "floatIn .45s cubic-bezier(.34,1.4,.64,1) forwards",
                  boxShadow: `0 24px 64px rgba(0,0,0,.14), 0 0 48px ${activeReview.color}20`,
                  pointerEvents: "auto",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, transparent, ${activeReview.color}, transparent)`,
                    borderRadius: "24px 24px 0 0",
                  }}
                />
                <button
                  className="close-btn"
                  onClick={closeActive}
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,.05)",
                    border: "1px solid rgba(0,0,0,.1)",
                    color: "#6b7280",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    padding: 0,
                    transition: "background .2s, color .2s",
                  }}
                >
                  ×
                </button>
                <div
                  style={{
                    fontSize: "clamp(36px, 6vw, 56px)",
                    lineHeight: 0.9,
                    color: activeReview.color,
                    opacity: 0.25,
                    fontFamily: "Georgia,serif",
                    marginBottom: 12,
                  }}
                >
                  "
                </div>
                <p
                  style={{
                    fontSize: "clamp(12px, 1.5vw, 15px)",
                    color: "#1f2937",
                    lineHeight: 1.78,
                    marginBottom: 24,
                    fontStyle: "italic",
                  }}
                >
                  {activeReview.text}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: "clamp(36px, 5vw, 48px)",
                      height: "clamp(36px, 5vw, 48px)",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${activeReview.color}, ${activeReview.color}bb)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "clamp(11px, 1.5vw, 14px)",
                      fontWeight: 800,
                      color: "#fff",
                      boxShadow: `0 4px 20px ${activeReview.color}50`,
                    }}
                  >
                    {activeReview.avatar}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "clamp(12px, 1.5vw, 15px)",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {activeReview.name}
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(10px, 1.2vw, 12px)",
                        color: "#6b7280",
                        marginTop: 2,
                      }}
                    >
                      {activeReview.role}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <StarRating rating={activeReview.rating} size={13} />
                    </div>
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: activeReview.color,
                      boxShadow: `0 0 14px ${activeReview.color}`,
                      animation: "subtlePulse 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {reviews.map((_, i) => (
              <div
                key={i}
                onClick={(e) => handleCardClick(e, i)}
                style={{
                  width: active === i ? 26 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    active === i ? reviews[i].color : "rgba(0,0,0,.12)",
                  cursor: "pointer",
                  transition: "all .3s",
                  boxShadow:
                    active === i ? `0 0 10px ${reviews[i].color}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
