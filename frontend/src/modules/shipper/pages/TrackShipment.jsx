import { useState } from "react";
import Badge from "../../../components/ui/Badge.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import LiveMap from "../../../components/ui/LiveMap.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import { useCompanyShipments } from "../../../hooks/useShipments.js";
import { useLiveLocation } from "../../../hooks/useTracking.js";

const ORANGE = "#f97316";

export default function TrackShipment() {
  const { data: shipments = [], isLoading } = useCompanyShipments();
  const [selectedId, setSelectedId] = useState(null);

  if (isLoading) return <DashboardSkeleton cards={2} rows={1} />;

  const trackable = shipments.filter((s) =>
    ["assigned", "in_transit"].includes(s.status),
  );
  const activeId =
    selectedId ??
    trackable.find((s) => s.status === "in_transit")?.id ??
    trackable[0]?.id ??
    null;
  const selected = trackable.find((s) => s.id === activeId) ?? null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Sora:wght@400;500;600;700;800&display=swap');
        .track-root * { box-sizing: border-box; }
        @keyframes pulse-ring  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.8);opacity:0} }
        @keyframes blink-d     { 0%,100%{opacity:1;box-shadow:0 0 8px #f97316} 50%{opacity:.3;box-shadow:none} }
        @keyframes slide-in    { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fade-up     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hud-border  { 0%,100%{opacity:.35} 50%{opacity:1} }

        .track-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 900px) { .track-layout { grid-template-columns: 1fr; } }

        .ship-btn {
          background: #080810;
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 2px;
          padding: 14px 16px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.18s;
          position: relative;
          overflow: hidden;
        }
        .ship-btn::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: transparent;
          transition: background 0.18s;
        }
        .ship-btn:hover { background: rgba(249,115,22,0.04); border-color: rgba(249,115,22,0.3); }
        .ship-btn.active { background: rgba(249,115,22,0.07); border-color: rgba(249,115,22,0.5); }
        .ship-btn.active::before { background: #f97316; }

        .info-tile {
          background: #08080f;
          border: 1px solid rgba(249,115,22,0.12);
          border-radius: 2px;
          padding: 10px 14px;
          animation: fade-up .3s ease both;
        }
        .coord-box {
          background: rgba(249,115,22,0.05);
          border: 1px solid rgba(249,115,22,0.18);
          border-radius: 2px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          font-family: 'Share Tech Mono', monospace;
        }
      `}</style>

      <div className="track-root">
        {trackable.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="track-layout">
            {/* ── Left panel ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Panel header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 2px 6px",
                  borderBottom: "1px solid rgba(249,115,22,0.12)",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: ORANGE,
                    animation: "blink-d 1.4s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10,
                    color: "rgba(249,115,22,0.7)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Active Fleet — {trackable.length}
                </span>
              </div>

              {trackable.map((s, i) => (
                <button
                  key={s.id}
                  className={`ship-btn${activeId === s.id ? " active" : ""}`}
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    animationDelay: `${i * 0.06}s`,
                    animation: "slide-in .3s ease both",
                  }}
                >
                  {/* Status row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Badge status={s.status} />
                    {s.status === "in_transit" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: ORANGE,
                              animation: "blink-d 1.2s ease-in-out infinite",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: -3,
                              borderRadius: "50%",
                              border: "1px solid " + ORANGE,
                              animation: "pulse-ring 1.5s ease-out infinite",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: 9,
                            color: ORANGE,
                            letterSpacing: "0.18em",
                          }}
                        >
                          LIVE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Route */}
                  <div
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color:
                        activeId === s.id ? "#fff" : "rgba(255,255,255,0.65)",
                      marginBottom: 5,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 90,
                      }}
                    >
                      {s.pickup}
                    </span>
                    <span
                      style={{ color: ORANGE, fontSize: 10, flexShrink: 0 }}
                    >
                      ——▶
                    </span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 90,
                      }}
                    >
                      {s.drop}
                    </span>
                  </div>

                  {/* Meta */}
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 9,
                      color: "rgba(255,255,255,0.3)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.distanceKm && <span>{s.distanceKm} KM</span>}
                    {s.loadType && <span>· {s.loadType.toUpperCase()}</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* ── Right panel ── */}
            {selected && (
              <ShipmentTracker key={selected.id} shipment={selected} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function ShipmentTracker({ shipment: s }) {
  const { data: location } = useLiveLocation(s.id);
  const isLive = s.status === "in_transit";

  const lat = location?.lat ? parseFloat(location.lat) : null;
  const lng = location?.lng ? parseFloat(location.lng) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "fade-up .35s ease",
      }}
    >
      {/* HUD header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "#06060f",
          border: "1px solid rgba(249,115,22,0.18)",
          borderRadius: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 9,
                color: "rgba(249,115,22,0.5)",
                letterSpacing: "0.2em",
                marginBottom: 3,
              }}
            >
              TRACKING
            </div>
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#4ade80" }}>{s.pickup}</span>
              <span style={{ color: ORANGE, fontSize: 11 }}>——▶</span>
              <span style={{ color: "#60a5fa" }}>{s.drop}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <HudStat
            label="STATUS"
            value={s.status.replace("_", " ").toUpperCase()}
            color={isLive ? ORANGE : "#fbbf24"}
          />
          {s.distanceKm && (
            <HudStat label="DISTANCE" value={s.distanceKm + " KM"} />
          )}
          {s.loadType && (
            <HudStat label="CARGO" value={s.loadType.toUpperCase()} />
          )}
        </div>
      </div>

      {/* Map */}
      <LiveMap
        lat={lat}
        lng={lng}
        pickup={s.pickup}
        drop={s.drop}
        updatedAt={location?.updated_at}
        height={420}
      />

      {/* Info row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 8,
        }}
      >
        <InfoTile label="LOAD TYPE" value={s.loadType || "—"} />
        <InfoTile
          label="WEIGHT"
          value={s.weightKg ? s.weightKg + " KG" : "—"}
        />
        <InfoTile
          label="DISTANCE"
          value={s.distanceKm ? s.distanceKm + " KM" : "—"}
        />
        <InfoTile
          label="BASE PRICE"
          value={s.basePrice || "—"}
          accent="#4ade80"
        />
        <InfoTile label="POSTED" value={s.posted || "—"} />
      </div>

      {/* GPS coordinates / status bar */}
      {location ? (
        <div className="coord-box">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: ORANGE,
              animation: "blink-d 1.2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 9,
                color: "rgba(249,115,22,0.5)",
                letterSpacing: "0.15em",
                marginBottom: 3,
              }}
            >
              GPS COORDINATES — LAST PING
            </div>
            <div style={{ fontSize: 12, color: ORANGE }}>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.06em",
            }}
          >
            {new Date(location.updated_at).toLocaleTimeString("en-IN", {
              hour12: false,
            })}
          </div>
        </div>
      ) : !isLive ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            background: "rgba(74,222,128,0.05)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 2,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            color: "#4ade80",
            letterSpacing: "0.08em",
          }}
        >
          <span>✓</span>
          <span>DRIVER ASSIGNED — AWAITING DEPARTURE SIGNAL</span>
        </div>
      ) : null}
    </div>
  );
}

function HudStat({ label, value, color }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 8,
          color: "rgba(249,115,22,0.4)",
          letterSpacing: "0.2em",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          color: color || "rgba(255,255,255,0.65)",
          letterSpacing: "0.05em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoTile({ label, value, accent }) {
  return (
    <div className="info-tile">
      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 8,
          color: "rgba(249,115,22,0.45)",
          letterSpacing: "0.18em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: accent || "rgba(255,255,255,0.7)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        gap: 20,
        border: "1px solid rgba(249,115,22,0.1)",
        borderRadius: 2,
        background: "#06060f",
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative", fontSize: 52 }}>
        🗺️
        <div
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: "50%",
            border: "1px solid rgba(249,115,22,0.2)",
            animation: "pulse-ring 2s ease-out infinite",
          }}
        />
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 14,
            color: ORANGE,
            letterSpacing: "0.15em",
            marginBottom: 8,
          }}
        >
          NO ACTIVE FLEET
        </div>
        <div
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.6,
          }}
        >
          Shipments appear here once a driver is assigned.
          <br />
          Live GPS tracking activates when transit begins.
        </div>
      </div>
    </div>
  );
}
