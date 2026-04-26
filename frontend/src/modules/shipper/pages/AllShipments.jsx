import { useState } from "react";
// import Badge from "../../components/ui/Badge.jsx";
import Card from "../../../components/ui/Card.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import { useShipments } from "../../../hooks/useShipments.js";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import { useBidsForShipment, useAcceptBid } from "../../../hooks/useBids.js";

const PAGE_SIZE = 9;

const STATUS_COLOR = {
  open: "#60a5fa",
  assigned: "#fbbf24",
  in_transit: "#f97316",
  delivered: "#4ade80",
  cancelled: "#f87171",
};

export default function AllShipments() {
  const {
    data: shipments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useShipments();
  const { data: dbUser } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) return <DashboardSkeleton cards={6} rows={0} />;

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

  // Filter + sort
  let filtered = shipments.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.pickup.toLowerCase().includes(q) ||
      s.drop.toLowerCase().includes(q) ||
      (s.loadType ?? "").toLowerCase().includes(q) ||
      (s.shipperName ?? "").toLowerCase().includes(q)
    );
  });

  if (sortBy === "oldest")
    filtered = [...filtered].sort(
      (a, b) => new Date(a.posted) - new Date(b.posted),
    );
  if (sortBy === "price_asc")
    filtered = [...filtered].sort(
      (a, b) => (a.minBidRaw ?? 0) - (b.minBidRaw ?? 0),
    );
  if (sortBy === "price_desc")
    filtered = [...filtered].sort(
      (a, b) => (b.minBidRaw ?? 0) - (a.minBidRaw ?? 0),
    );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <>
      <style>{`
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1100px) { .marketplace-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .marketplace-grid { grid-template-columns: 1fr; } }

        .mp-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .mp-search   { flex: 1; min-width: 180px; }
        @media (max-width: 480px) {
          .mp-controls { flex-direction: column; align-items: stretch; }
          .mp-search   { min-width: unset; }
        }
      `}</style>

      {/* ── Marketplace banner ── */}
      <div
        style={{
          background: "#1a0d00",
          border: `1px solid ${COLORS.orange}33`,
          borderRadius: 10,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 22, flexShrink: 0 }}>🏪</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.orange }}>
            Shipment Marketplace
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            All open shipments from every shipper — including yours. Drivers bid
            on these.
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mp-controls">
        <input
          className="mp-search"
          placeholder="Search by route, load type or shipper…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
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
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
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
          <option value="oldest">Oldest first</option>
          <option value="price_asc">Min bid: Low → High</option>
          <option value="price_desc">Min bid: High → Low</option>
        </select>
        <div
          style={{
            fontSize: 12,
            color: COLORS.textMuted,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {filtered.length} open
        </div>
      </div>

      {/* ── Cards ── */}
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
            {search
              ? `No shipments matching "${search}"`
              : "No open shipments right now."}
          </div>
        </Card>
      ) : (
        <div className="marketplace-grid">
          {paginated.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              isOwn={!!dbUser && s.companyId === dbUser.id}
              expanded={expandedId === s.id}
              onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <PageBtn onClick={() => setPage(page - 1)} disabled={page === 1}>
            ‹
          </PageBtn>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
            if (!show)
              return p === 2 || p === totalPages - 1 ? (
                <span key={p} style={{ color: COLORS.textDim, fontSize: 13 }}>
                  …
                </span>
              ) : null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
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
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            ›
          </PageBtn>
        </div>
      )}
    </>
  );
}

// ── Shipment card ─────────────────────────────────────────────────────────────
function ShipmentCard({ shipment: s, isOwn, expanded, onToggle }) {
  const statusColor = STATUS_COLOR[s.status] ?? COLORS.textMuted;
  const { data: bids = [], isLoading: bidsLoading } = useBidsForShipment(
    isOwn && expanded ? s.id : null,
  );
  const { mutate: acceptBid, isPending: accepting } = useAcceptBid();

  return (
    <div
      style={{
        background: "#0e0e0e",
        border: `1px solid ${isOwn ? COLORS.orange + "55" : COLORS.borderMid}`,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Status strip */}
      <div style={{ height: 3, background: statusColor }} />

      <div
        style={{
          padding: "16px 16px 18px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* ── Shipper row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShipperAvatar name={s.shipperName} avatarUrl={s.shipperAvatar} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.textPrimary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.shipperName ?? "Unknown Shipper"}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textDim }}>
              Posted {s.posted}
            </div>
          </div>
          {isOwn && (
            <span
              style={{
                background: COLORS.orangeSubtle,
                border: `1px solid ${COLORS.orange}44`,
                color: COLORS.orange,
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              YOURS
            </span>
          )}
        </div>

        {/* ── Route ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <LocationPill label={s.pickup} type="pickup" />
          <span
            style={{ color: COLORS.textDim, fontWeight: 700, fontSize: 13 }}
          >
            →
          </span>
          <LocationPill label={s.drop} type="drop" />
        </div>

        {/* ── Details grid ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}
        >
          <Chip label="Load Type" value={s.loadType || "–"} />
          <Chip label="Weight" value={s.weightKg ? `${s.weightKg} kg` : "–"} />
          <Chip
            label="Distance"
            value={s.distanceKm ? `${s.distanceKm} km` : "–"}
          />
          <Chip
            label="Base Price"
            value={s.basePrice || "–"}
            accent="#4ade80"
          />
          <Chip
            label="Min Bid"
            value={s.minBid || "–"}
            accent={COLORS.orange}
          />
          {s.deadlineFmt && (
            <Chip label="Deadline" value={s.deadlineFmt} accent="#fbbf24" />
          )}
        </div>

        {/* ── View bids — own only ── */}
        {isOwn && (
          <button
            onClick={onToggle}
            style={{
              background: expanded ? COLORS.orangeSubtle : "transparent",
              border: `1px solid ${expanded ? COLORS.orange : COLORS.borderHi}`,
              color: expanded ? COLORS.orange : COLORS.textMuted,
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: "auto",
              transition: "all 0.15s",
            }}
          >
            {expanded ? "Hide Bids" : "View Bids"}
            {!expanded && bids.length > 0 && (
              <span
                style={{
                  background: COLORS.orange,
                  color: "#fff",
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {bids.length}
              </span>
            )}
            <span
              style={{
                display: "inline-block",
                transition: "transform 0.2s",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          </button>
        )}
      </div>

      {/* ── Bids panel ── */}
      {isOwn && expanded && (
        <div
          style={{
            borderTop: `1px solid ${COLORS.borderMid}`,
            padding: "14px 16px",
            background: "#0a0a0a",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Bids{" "}
            {bids.length > 0 && (
              <span style={{ color: COLORS.orange }}>({bids.length})</span>
            )}
          </div>
          {bidsLoading && (
            <div style={{ color: COLORS.textDim, fontSize: 12 }}>Loading…</div>
          )}
          {!bidsLoading && bids.length === 0 && (
            <div style={{ color: COLORS.textDim, fontSize: 12 }}>
              No bids yet.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bids.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#111",
                  border: `1px solid ${COLORS.borderMid}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.driver}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                    ETA {b.eta} · {b.rating ? `${b.rating}★` : "New"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 15,
                      color: COLORS.orange,
                      fontWeight: 700,
                    }}
                  >
                    {b.price}
                  </span>
                  <button
                    onClick={() => acceptBid({ bidId: b.id, shipmentId: s.id })}
                    disabled={accepting}
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
                      border: "none",
                      color: "#fff",
                      padding: "5px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: accepting ? "not-allowed" : "pointer",
                      opacity: accepting ? 0.6 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shipper avatar ────────────────────────────────────────────────────────────
function ShipperAvatar({ name, avatarUrl }) {
  const initials = (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join("");
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={(e) => {
          e.target.style.display = "none";
        }}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          border: `2px solid ${COLORS.borderHi}`,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        border: `2px solid ${COLORS.borderHi}`,
      }}
    >
      {initials}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Chip({ label, value, accent }) {
  return (
    <div
      style={{
        background: "#111",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: "6px 9px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: COLORS.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 2,
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

function LocationPill({ label, type }) {
  const isPickup = type === "pickup";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: isPickup ? "#1a2a1a" : "#1a1a2a",
        border: `1px solid ${isPickup ? "#22543d" : "#1e3a5f"}`,
        borderRadius: 5,
        padding: "3px 8px",
      }}
    >
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: isPickup ? "#4ade80" : "#60a5fa",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 11,
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
