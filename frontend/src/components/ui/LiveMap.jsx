import { useEffect, useRef } from "react";

const ORANGE = "#f97316";
const BORDER = "rgba(249,115,22,0.2)";

export default function LiveMap({
  lat,
  lng,
  pickup,
  drop,
  updatedAt,
  height = 380,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    let map;
    const init = async () => {
      await new Promise((r) => setTimeout(r, 150));
      const L = (await import("leaflet")).default;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const hasPos = lat && lng;
      const center = hasPos
        ? [parseFloat(lat), parseFloat(lng)]
        : [20.5937, 78.9629];
      map = L.map(containerRef.current, {
        center,
        zoom: hasPos ? 13 : 5,
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
        },
      ).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      if (hasPos) {
        markerRef.current = L.marker(center, { icon: makeTruckIcon(L) })
          .addTo(map)
          .bindPopup(popupHtml(updatedAt));
      }
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 250);
    };
    init();
    return () => {
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const pos = [parseFloat(lat), parseFloat(lng)];
    const update = async () => {
      const L = (await import("leaflet")).default;
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
        markerRef.current.setPopupContent(popupHtml(updatedAt));
      } else {
        markerRef.current = L.marker(pos, { icon: makeTruckIcon(L) })
          .addTo(mapRef.current)
          .bindPopup(popupHtml(updatedAt));
      }
      mapRef.current.panTo(pos, { animate: true, duration: 1 });
    };
    update();
  }, [lat, lng, updatedAt]);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 0,
        overflow: "hidden",
        border: "1px solid " + BORDER,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes blink-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
        @keyframes corner-glow { 0%,100%{opacity:.4} 50%{opacity:1} }
        .lmap-corner { position:absolute; width:16px; height:16px; z-index:1001; pointer-events:none; }
        .lmap-corner::before,.lmap-corner::after { content:''; position:absolute; background:${ORANGE}; }
        .lmap-corner::before { width:100%; height:2px; }
        .lmap-corner::after  { width:2px; height:100%; }
        .lmap-tl { top:0; left:0; } .lmap-tl::before { top:0; } .lmap-tl::after { left:0; top:0; }
        .lmap-tr { top:0; right:0; transform:scaleX(-1); } .lmap-tr::before { top:0; } .lmap-tr::after { left:0; top:0; }
        .lmap-bl { bottom:0; left:0; transform:scaleY(-1); } .lmap-bl::before { top:0; } .lmap-bl::after { left:0; top:0; }
        .lmap-br { bottom:0; right:0; transform:scale(-1); } .lmap-br::before { top:0; } .lmap-br::after { left:0; top:0; }
      `}</style>

      {/* Corner brackets */}
      <div
        className="lmap-corner lmap-tl"
        style={{ animation: "corner-glow 2s ease-in-out infinite" }}
      />
      <div
        className="lmap-corner lmap-tr"
        style={{ animation: "corner-glow 2s ease-in-out infinite .5s" }}
      />
      <div
        className="lmap-corner lmap-bl"
        style={{ animation: "corner-glow 2s ease-in-out infinite 1s" }}
      />
      <div
        className="lmap-corner lmap-br"
        style={{ animation: "corner-glow 2s ease-in-out infinite 1.5s" }}
      />

      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 999,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(transparent, rgba(249,115,22,0.04), transparent)",
            animation: "scanline 6s linear infinite",
          }}
        />
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        style={{ height, width: "100%", background: "#0a0a14" }}
      />

      {/* No location overlay */}
      {!lat && !lng && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: "rgba(6,6,18,0.92)",
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid " + ORANGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                background: "rgba(249,115,22,0.08)",
              }}
            >
              📡
            </div>
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                border: "1px solid rgba(249,115,22,0.2)",
                animation: "corner-glow 1.5s ease-in-out infinite",
              }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 13,
                color: ORANGE,
                letterSpacing: "0.15em",
                marginBottom: 6,
              }}
            >
              AWAITING SIGNAL
            </div>
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                color: "rgba(249,115,22,0.4)",
                letterSpacing: "0.1em",
              }}
            >
              GPS STREAM INACTIVE
            </div>
          </div>
        </div>
      )}

      {/* Route pills */}
      {(pickup || drop) && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 1000,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            pointerEvents: "none",
          }}
        >
          {pickup && (
            <RoutePill
              label={pickup}
              color="#4ade80"
              bg="rgba(4,20,10,0.92)"
              border="rgba(74,222,128,0.35)"
              icon="▲"
            />
          )}
          {drop && (
            <RoutePill
              label={drop}
              color="#60a5fa"
              bg="rgba(4,10,24,0.92)"
              border="rgba(96,165,250,0.35)"
              icon="■"
            />
          )}
        </div>
      )}

      {/* LIVE badge */}
      {lat && lng && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            background: "rgba(0,0,0,0.88)",
            borderRadius: 4,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 7,
            border: "1px solid " + ORANGE,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: ORANGE,
              animation: "blink-dot 1.2s ease-in-out infinite",
              boxShadow: "0 0 8px " + ORANGE,
            }}
          />
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              color: ORANGE,
              letterSpacing: "0.2em",
            }}
          >
            LIVE
          </span>
        </div>
      )}

      {/* Timestamp */}
      {updatedAt && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            zIndex: 1000,
            background: "rgba(0,0,0,0.82)",
            borderRadius: 4,
            padding: "5px 10px",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: "rgba(249,115,22,0.6)",
            letterSpacing: "0.08em",
          }}
        >
          UPD{" "}
          {new Date(updatedAt).toLocaleTimeString("en-IN", { hour12: false })}
        </div>
      )}
    </div>
  );
}

function RoutePill({ label, color, bg, border, icon }) {
  return (
    <div
      style={{
        background: bg,
        backdropFilter: "blur(12px)",
        borderRadius: 4,
        padding: "5px 12px",
        display: "flex",
        alignItems: "center",
        gap: 7,
        border: "1px solid " + border,
      }}
    >
      <span style={{ fontSize: 7, color, opacity: 0.8 }}>{icon}</span>
      <span
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          color,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function makeTruckIcon(L) {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid #f97316;animation:corner-glow 1.5s ease-in-out infinite;box-shadow:0 0 20px rgba(249,115,22,0.5);"></div>
      <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#f97316,#c2410c);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 16px rgba(249,115,22,0.7);">&#x1F69B;</div>
    </div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -28],
  });
}

function popupHtml(updatedAt) {
  return `<div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:#f97316;padding:4px 0;">
    DRIVER LOCATION<br/>
    <span style="color:#999;font-size:10px;">${updatedAt ? new Date(updatedAt).toLocaleTimeString("en-IN", { hour12: false }) : "TRACKING ACTIVE"}</span>
  </div>`;
}
