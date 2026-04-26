import { useState, useEffect, useRef } from "react";
import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import {
  useShipments,
  useShipmentDetail,
} from "../../../hooks/useShipments.js";
import {
  usePlaceBid,
  useUpdateBid,
  useMyBidForShipment,
} from "../../../hooks/useBids.js";

const PAGE_SIZE = 6;

export default function OpenShipments() {
  const {
    data: shipments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useShipments();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [bidFor, setBidFor] = useState(null); // shipment id with open bid form

  // Reset page when search/sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy]);

  if (isLoading) return <DashboardSkeleton cards={3} rows={0} />;

  if (isError)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "#f87171",
          fontSize: 13,
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          Failed to load shipments
        </div>
        <div style={{ opacity: 0.7, marginBottom: 16 }}>{error.message}</div>
        <button
          onClick={refetch}
          style={{
            background: "transparent",
            border: "1px solid #f87171",
            color: "#f87171",
            padding: "7px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Try again
        </button>
      </div>
    );

  // ── Filter + sort ──────────────────────────────────────────────────────────
  let filtered = shipments.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.pickup.toLowerCase().includes(q) ||
      s.drop.toLowerCase().includes(q) ||
      (s.loadType ?? "").toLowerCase().includes(q)
    );
  });
  if (sortBy === "price_asc")
    filtered = [...filtered].sort(
      (a, b) => (a.minBidRaw ?? 0) - (b.minBidRaw ?? 0),
    );
  if (sortBy === "price_desc")
    filtered = [...filtered].sort(
      (a, b) => (b.minBidRaw ?? 0) - (a.minBidRaw ?? 0),
    );

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* ── Controls ── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search by pickup, drop or load type…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
            background: "#111",
            border: `1px solid ${COLORS.borderMid}`,
            color: COLORS.textPrimary,
            padding: "9px 14px",
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            background: "#111",
            border: `1px solid ${COLORS.borderMid}`,
            color: COLORS.textSecondary,
            padding: "9px 14px",
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Min bid: Low → High</option>
          <option value="price_desc">Min bid: High → Low</option>
        </select>
        <div
          style={{
            background: COLORS.orangeSubtle,
            border: `1px solid ${COLORS.orange}44`,
            color: COLORS.orange,
            padding: "7px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} open
        </div>
      </div>

      {/* ── Cards grid ── */}
      {paginated.length === 0 ? (
        <Card>
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: COLORS.textMuted,
              fontSize: 13,
            }}
          >
            {searchQuery
              ? `No shipments matching "${searchQuery}"`
              : "No open shipments right now."}
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
          }}
        >
          {paginated.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              isBidOpen={bidFor === s.id}
              onToggleBid={() => setBidFor(bidFor === s.id ? null : s.id)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </>
  );
}

// ── Shipment card ─────────────────────────────────────────────────────────────
function ShipmentCard({ shipment: s, isBidOpen, onToggleBid }) {
  const isExpired = s.deadline && new Date() > new Date(s.deadline);
  const { data: detail } = useShipmentDetail(s.id);
  const { data: myBid } = useMyBidForShipment(s.id); // ← driver's existing bid
  const images = detail?.images ?? [];
  const [lightbox, setLightbox] = useState(null);

  const hasBid = !!myBid;

  const statusColor = isExpired
    ? "#f87171"
    : ({
        open: "#60a5fa",
        assigned: "#fbbf24",
        in_transit: "#f97316",
        delivered: "#4ade80",
        cancelled: "#f87171",
      }[s.status] ?? COLORS.textMuted);

  return (
    <>
      <div
        style={{
          background: "#0e0e0e",
          border: `1px solid ${isExpired ? "#2a1a1a" : hasBid ? `${COLORS.orange}55` : COLORS.borderMid}`,
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          opacity: isExpired ? 0.7 : 1,
        }}
      >
        {/* ── Status strip ── */}
        <div
          style={{
            height: 3,
            background: hasBid ? COLORS.orange : statusColor,
          }}
        />

        {/* ══ SECTION 1 — Image slideshow ══════════════════════════════════ */}
        <ImageSlideshow
          images={images}
          onImageClick={setLightbox}
          shipmentId={s.id}
        />

        {/* ══ SECTION 2 — Details ══════════════════════════════════════════ */}
        <div
          style={{
            padding: "16px 18px 18px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Route */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            <LocationPill label={s.pickup} type="pickup" />
            <span style={{ color: COLORS.textDim, fontWeight: 700 }}>→</span>
            <LocationPill label={s.drop} type="drop" />
          </div>

          {/* Status + posted */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {isExpired ? (
              <span
                style={{
                  background: "#2a1a1a",
                  color: "#f87171",
                  border: "1px solid #4a1a1a",
                  padding: "2px 10px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                DEADLINE PASSED
              </span>
            ) : (
              <Badge status={s.status} />
            )}
            <span style={{ fontSize: 11, color: COLORS.textDim }}>
              Posted {s.posted}
            </span>
          </div>

          {/* Detail chips grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <DetailChip label="Load Type" value={s.loadType || "–"} />
            <DetailChip
              label="Weight"
              value={s.weightKg ? `${s.weightKg} kg` : "–"}
            />
            <DetailChip
              label="Distance"
              value={s.distanceKm ? `${s.distanceKm} km` : "–"}
            />
            <DetailChip
              label="Base Price"
              value={s.basePrice || "–"}
              accent="#4ade80"
            />
          </div>
          {s.deadlineFmt && (
            <DetailChip
              label="Bid Deadline"
              value={s.deadlineFmt}
              accent={isExpired ? "#f87171" : "#fbbf24"}
            />
          )}

          {/* ── My bid summary (shown when driver has already bid) ── */}
          {hasBid && !isBidOpen && <MyBidSummary bid={myBid} />}

          {/* Action button */}
          <div style={{ marginTop: "auto" }}>
            {isExpired ? (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: COLORS.textDim,
                  padding: "8px 0",
                }}
              >
                Bidding closed
              </div>
            ) : hasBid ? (
              /* Driver has bid — show Edit / Cancel pair */
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant={isBidOpen ? "ghost" : "primary"}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={onToggleBid}
                >
                  {isBidOpen ? "Close" : "✏️ Edit Bid"}
                </Button>
              </div>
            ) : (
              <Button
                variant={isBidOpen ? "ghost" : "primary"}
                style={{ width: "100%", justifyContent: "center" }}
                onClick={onToggleBid}
              >
                {isBidOpen ? "Cancel" : "Place Bid →"}
              </Button>
            )}
          </div>
        </div>

        {/* ── Bid form (expands below card) ── */}
        {isBidOpen && !isExpired && (
          <div
            style={{
              borderTop: `1px solid ${COLORS.borderMid}`,
              padding: "18px 18px",
              background: "#0a0a0a",
            }}
          >
            <PlaceBidForm
              shipment={s}
              existingBid={myBid ?? null}
              onClose={onToggleBid}
            />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

// ── My bid summary strip ──────────────────────────────────────────────────────
function MyBidSummary({ bid }) {
  return (
    <div
      style={{
        background: "#1a0f00",
        border: `1px solid ${COLORS.orange}44`,
        borderRadius: 8,
        padding: "10px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            color: COLORS.textDim,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 3,
          }}
        >
          Your Bid
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: COLORS.orange,
            fontFamily: FONTS.display,
          }}
        >
          ₹{bid.bid_price?.toLocaleString("en-IN")}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 10,
            color: COLORS.textDim,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 3,
          }}
        >
          ETA
        </div>
        <div
          style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}
        >
          {bid.eta_hours ? `${bid.eta_hours}h` : "–"}
        </div>
      </div>
      {bid.updated_at && bid.updated_at !== bid.created_at && (
        <span
          style={{
            background: "#1a2a1a",
            border: "1px solid #22543d",
            color: "#4ade80",
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 4,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Edited
        </span>
      )}
    </div>
  );
}

// ── Image slideshow (auto-advances + manual nav) ──────────────────────────────
function ImageSlideshow({ images, onImageClick }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-advance every 3s unless paused
  useEffect(() => {
    if (images.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, [images.length, paused]);

  // Reset idx when images change
  useEffect(() => {
    if (idx >= images.length && images.length > 0) setIdx(0);
  }, [images.length]);

  const prev = (e) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
    setPaused(true);
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
    setPaused(true);
  };

  if (images.length === 0) {
    return (
      <div
        style={{
          height: 180,
          background: "#080808",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: COLORS.textDim,
        }}
      >
        <div style={{ fontSize: 30, opacity: 0.25 }}>📦</div>
        <div style={{ fontSize: 12 }}>No photos</div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        height: 200,
        background: "#080808",
        overflow: "hidden",
        cursor: "zoom-in",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => onImageClick(images[idx]?.image_url)}
    >
      {/* Images — fade transition */}
      {images.map((img, i) => (
        <img
          key={img.id ?? i}
          src={img.image_url}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === idx ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      ))}

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button onClick={prev} style={arrowStyle("left")}>
            ‹
          </button>
          <button onClick={next} style={arrowStyle("right")}>
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 5,
          }}
        >
          {images.map((_, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
                setPaused(true);
              }}
              style={{
                width: i === idx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  i === idx ? COLORS.orange : "rgba(255,255,255,0.35)",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}

      {/* Count + zoom hint */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          fontSize: 10,
          padding: "2px 7px",
          borderRadius: 4,
        }}
      >
        {idx + 1}/{images.length}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          fontSize: 9,
          padding: "2px 6px",
          borderRadius: 3,
        }}
      >
        🔍 enlarge
      </div>
    </div>
  );
}

const arrowStyle = (side) => ({
  position: "absolute",
  top: "50%",
  [side]: 8,
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.55)",
  border: "none",
  color: "#fff",
  width: 30,
  height: 30,
  borderRadius: "50%",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
  zIndex: 2,
});

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "rgba(255,255,255,0.1)",
          border: "none",
          color: "#fff",
          width: 38,
          height: 38,
          borderRadius: "50%",
          fontSize: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✕
      </button>
      <img
        src={src}
        alt="Full size"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          objectFit: "contain",
          borderRadius: 10,
          boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        }}
      />
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
      }}
    >
      <PageBtn onClick={() => onChange(page - 1)} disabled={page === 1}>
        ‹
      </PageBtn>

      {pages.map((p) => {
        const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
        const isEllipsisBefore = p === 2 && page > 3;
        const isEllipsisAfter = p === totalPages - 1 && page < totalPages - 2;

        if (!show) return null;
        if (isEllipsisBefore || isEllipsisAfter) {
          return (
            <span
              key={p}
              style={{ color: COLORS.textDim, fontSize: 13, padding: "0 4px" }}
            >
              …
            </span>
          );
        }

        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 7,
              border: `1px solid ${p === page ? COLORS.orange : COLORS.borderMid}`,
              background: p === page ? COLORS.orangeSubtle : "transparent",
              color: p === page ? COLORS.orange : COLORS.textMuted,
              fontWeight: p === page ? 700 : 400,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {p}
          </button>
        );
      })}

      <PageBtn
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        ›
      </PageBtn>

      <span style={{ fontSize: 12, color: COLORS.textDim, marginLeft: 4 }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}

function PageBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        borderRadius: 7,
        border: `1px solid ${COLORS.borderMid}`,
        background: "transparent",
        color: disabled ? COLORS.textDim : COLORS.textSecondary,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ── Location pill ─────────────────────────────────────────────────────────────
function LocationPill({ label, type }) {
  const isPickup = type === "pickup";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: isPickup ? "#1a2a1a" : "#1a1a2a",
        border: `1px solid ${isPickup ? "#22543d" : "#1e3a5f"}`,
        borderRadius: 6,
        padding: "3px 9px",
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: isPickup ? "#4ade80" : "#60a5fa",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isPickup ? "#4ade80" : "#60a5fa",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function DetailChip({ label, value, accent }) {
  return (
    <div
      style={{
        background: "#111",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: "7px 10px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: COLORS.textDim,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: accent ?? COLORS.textSecondary,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Bid form — handles both CREATE and EDIT ───────────────────────────────────
function PlaceBidForm({ shipment, existingBid, onClose }) {
  const isEditing = !!existingBid;

  const {
    mutate: placeBid,
    isPending: placing,
    isError: placeError,
    error: placeErr,
  } = usePlaceBid();
  const {
    mutate: updateBid,
    isPending: updating,
    isError: updateError,
    error: updateErr,
  } = useUpdateBid();

  const isPending = placing || updating;
  const isError = placeError || updateError;
  const error = placeErr || updateErr;

  const [bidPrice, setBidPrice] = useState(
    existingBid?.bid_price
      ? String(existingBid.bid_price)
      : shipment.minBidRaw
        ? String(shipment.minBidRaw)
        : "",
  );
  const [etaHours, setEtaHours] = useState(
    existingBid?.eta_hours ? String(existingBid.eta_hours) : "",
  );

  const isUnderMin =
    shipment.minBidRaw && Number(bidPrice) < shipment.minBidRaw;

  const submit = () => {
    if (!bidPrice || isUnderMin) return;

    if (isEditing) {
      updateBid(
        {
          bidId: existingBid.id,
          shipmentId: shipment.id, // ← needed so onSuccess invalidates ["my-bid", shipmentId]
          bidPrice: Number(bidPrice),
          etaHours: Number(etaHours),
        },
        { onSuccess: onClose },
      );
    } else {
      placeBid(
        {
          shipmentId: shipment.id,
          bidPrice: Number(bidPrice),
          etaHours: Number(etaHours),
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          {isEditing ? "Edit Your Bid" : "Your Bid"} — {shipment.pickup} →{" "}
          {shipment.drop}
        </div>
        {isEditing && (
          <span
            style={{
              background: "#1a1a2a",
              border: "1px solid #60a5fa44",
              color: "#60a5fa",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 4,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Editing
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              display: "block",
              marginBottom: 5,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Bid Price (₹)
            {shipment.minBid && (
              <span style={{ color: "#fbbf24" }}> · Min {shipment.minBid}</span>
            )}
          </label>
          <input
            type="number"
            placeholder="Enter amount"
            value={bidPrice}
            onChange={(e) => setBidPrice(e.target.value)}
            style={{
              width: "100%",
              background: "#080808",
              border: `1px solid ${isUnderMin ? "#f87171" : COLORS.borderHi}`,
              color: COLORS.textPrimary,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {isUnderMin && (
            <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>
              Must be ≥ {shipment.minBid}
            </div>
          )}
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              display: "block",
              marginBottom: 5,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            ETA (hours)
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 6"
            value={etaHours}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) {
                setEtaHours(value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
            style={{
              width: "100%",
              background: "#080808",
              border: `1px solid ${COLORS.borderHi}`,
              color: COLORS.textPrimary,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
      {isError && (
        <div style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}>
          {error.message}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          onClick={submit}
          style={{ opacity: isPending || isUnderMin ? 0.6 : 1 }}
        >
          {isPending
            ? isEditing
              ? "Updating bid…"
              : "Placing bid…"
            : isEditing
              ? "Update Bid ✓"
              : "Confirm Bid"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
