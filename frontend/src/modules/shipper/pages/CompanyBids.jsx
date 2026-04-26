import Card from "../../../components/ui/Card.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Stars from "../../../components/ui/Stars.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import { useCompanyShipments } from "../../../hooks/useShipments.js";
import { useBidsForShipment, useAcceptBid } from "../../../hooks/useBids.js";

export default function CompanyBids() {
  const {
    data: shipments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCompanyShipments();

  if (isLoading) return <DashboardSkeleton cards={3} rows={2} />;

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

  const openShipments = shipments.filter((s) => s.status === "open");

  if (openShipments.length === 0)
    return (
      <>
        <SectionHeader title="Bid Management" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 0",
            gap: 12,
            color: COLORS.textDim,
          }}
        >
          <div style={{ fontSize: 40 }}>📭</div>
          <div style={{ fontSize: 14, textAlign: "center" }}>
            No open shipments with bids right now.
          </div>
          <Button>Post a Shipment</Button>
        </div>
      </>
    );

  const totalBids = openShipments.reduce((sum, s) => sum + (s.bids ?? 0), 0);

  return (
    <>
      <SectionHeader title="Bid Management" />

      {/* Summary chips — wrap on small screens */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <InfoChip
          label="Open Shipments"
          value={openShipments.length}
          color={COLORS.orange}
        />
        <InfoChip
          label="Total Bids Received"
          value={totalBids}
          color="#60a5fa"
        />
      </div>

      {openShipments.map((ship) => (
        <ShipmentBidCard key={ship.id} shipment={ship} />
      ))}
    </>
  );
}

function ShipmentBidCard({ shipment }) {
  const { data: bids = [], isLoading } = useBidsForShipment(shipment.id);
  const { mutate: acceptBid, isPending, variables } = useAcceptBid();

  const lowestBid =
    bids.length > 0
      ? bids.reduce(
          (min, b) => {
            const p = parseFloat(b.price.replace(/[^0-9.]/g, ""));
            return p < min.val ? { val: p, label: b.price } : min;
          },
          { val: Infinity, label: "" },
        )
      : null;

  return (
    <Card>
      {/* Shipment header — stack on narrow screens */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.borderMid}`,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: COLORS.orange,
                fontWeight: 700,
                fontSize: 14,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {String(shipment.id).slice(0, 8).toUpperCase()}
            </span>
            <Badge status={shipment.status} />
          </div>
          <div
            style={{
              color: COLORS.textPrimary,
              fontSize: 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {shipment.route}
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 3 }}>
            Posted {shipment.posted} · {bids.length} bid
            {bids.length !== 1 ? "s" : ""} received
          </div>
        </div>
        {lowestBid && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 3 }}
            >
              Lowest bid
            </div>
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: "clamp(16px, 2.5vw, 22px)",
                color: "#4ade80",
                letterSpacing: "0.05em",
              }}
            >
              {lowestBid.label}
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div
          style={{ color: COLORS.textMuted, fontSize: 13, padding: "12px 0" }}
        >
          Loading bids…
        </div>
      )}
      {!isLoading && bids.length === 0 && (
        <div style={{ color: COLORS.textDim, fontSize: 13, padding: "12px 0" }}>
          No bids received yet.
        </div>
      )}

      {bids.map((b, i) => {
        const isLowest = i === 0;
        const accepting = isPending && variables?.bidId === b.id;
        return (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom:
                i < bids.length - 1 ? `1px solid ${COLORS.border}` : "none",
              background: isLowest
                ? "linear-gradient(90deg,#052e1608 0%,transparent 60%)"
                : "transparent",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {/* Driver info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: COLORS.orangeSubtle,
                  border: `1px solid ${COLORS.orange}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.orange,
                  flexShrink: 0,
                }}
              >
                {(b.driver ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: COLORS.textPrimary,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {b.driver}
                  </span>
                  {isLowest && (
                    <span
                      style={{
                        background: "#052e16",
                        color: "#4ade80",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    >
                      LOWEST
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 3,
                    flexWrap: "wrap",
                  }}
                >
                  {b.rating > 0 && <Stars value={b.rating} size={12} />}
                  <span style={{ color: COLORS.textMuted, fontSize: 12 }}>
                    ETA {b.eta}
                  </span>
                </div>
              </div>
            </div>

            {/* Price + action */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  color: COLORS.orange,
                  letterSpacing: "0.05em",
                }}
              >
                {b.price}
              </div>
              <Button
                size="sm"
                style={{ opacity: accepting ? 0.6 : 1 }}
                onClick={() =>
                  acceptBid({ bidId: b.id, shipmentId: shipment.id })
                }
              >
                {accepting ? "…" : "Accept"}
              </Button>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function InfoChip({ label, value, color }) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: `1px solid ${COLORS.borderMid}`,
        borderRadius: 8,
        padding: "12px 20px",
        flex: "1 1 140px",
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: COLORS.textMuted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "clamp(18px, 3vw, 22px)",
          fontWeight: 700,
          color,
          fontFamily: FONTS.display,
          letterSpacing: "0.05em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
