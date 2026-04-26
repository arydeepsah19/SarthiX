import Card from "../../../components/ui/Card.jsx";
import StatCard from "../../../components/ui/StatCard.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import {
  IBid,
  IShipment,
  ITrip,
  IDash,
  IStar,
} from "../../../components/ui/Icons.jsx";
import { useDriverDashboard } from "../../../hooks/useDriverDashboard.js";
import { useLocationBroadcast } from "../../../hooks/useTracking.js";
import {
  useShipments,
  useUpdateShipmentStatus,
} from "../../../hooks/useShipments.js";
import { useDriverBids } from "../../../hooks/useDriverBids.js"; // ← real bids
import { useUser } from "@clerk/clerk-react";

export default function DriverDashboard() {
  const { data: apiData, isLoading: dashLoading } = useDriverDashboard();
  const { data: allShipments = [], isLoading: shipLoading } = useShipments();
  const { data: myBids = [], isLoading: bidsLoading } = useDriverBids(); // ← real
  const { user } = useUser();

  const isLoading = dashLoading || shipLoading || bidsLoading;
  if (isLoading) return <DashboardSkeleton rows={2} cards={5} />;

  if (!apiData) return null;

  const { stats, rating, ratingCount } = apiData;

  // ── Active shipment — find from real shipments list ────────────────────────
  // Your backend stores assigned_driver_id on the shipment.
  // Clerk publicMetadata.dbId is the driver's database UUID (set by your backend).
  const driverId = user?.publicMetadata?.dbId;

  const activeShipment = driverId
    ? allShipments.find(
        (s) =>
          s.driverId === driverId &&
          ["assigned", "in_transit"].includes(s.status),
      )
    : null;

  const shipmentCard = activeShipment
    ? {
        ...activeShipment,
        cargo: activeShipment.cargo || "Cargo",
        pickup: "–",
        progress: activeShipment.status === "in_transit" ? 50 : 10,
        timeline: buildTimeline(activeShipment.status),
      }
    : null;

  // ── Recent bids — real from GET /driver/bids ──────────────────────────────
  const recentBids = myBids.slice(0, 4); // show latest 4

  return (
    <>
      {/* ── Stats row — all real ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard
          label="Active Bids"
          value={stats.activeBids}
          color="#60a5fa"
          sub="awaiting response"
          icon={<IBid size={40} />}
        />
        <StatCard
          label="Active Shipments"
          value={stats.activeShipments}
          color="#fbbf24"
          sub="assigned / in transit"
          icon={<IShipment size={40} />}
        />
        <StatCard
          label="Trips Completed"
          value={stats.tripsCompleted}
          color="#4ade80"
          sub="all time"
          icon={<ITrip size={40} />}
        />
        <StatCard
          label="Total Earnings"
          value={stats.totalEarnings}
          color={COLORS.orange}
          sub="lifetime"
          icon={<IDash size={40} />}
        />
        <StatCard
          label="Rating"
          value={rating ? `${rating}★` : "–"}
          color="#fbbf24"
          sub={ratingCount ? `${ratingCount} reviews` : "no reviews yet"}
          icon={<IStar size={40} />}
        />
      </div>

      {/* ── Active shipment + recent bids — both real ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}
      >
        <ActiveShipmentCard shipment={shipmentCard} />
        <RecentBidsCard bids={recentBids} />
      </div>
    </>
  );
}

// ── Active shipment card ──────────────────────────────────────────────────────
function ActiveShipmentCard({ shipment: s }) {
  const { mutate: updateStatus, isPending } = useUpdateShipmentStatus();
  // Broadcast GPS while in_transit
  useLocationBroadcast(s?.id, s?.status === "in_transit");

  // No active shipment
  if (!s) {
    return (
      <Card>
        <SectionHeader title="Active Shipment" />
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: COLORS.textMuted,
            fontSize: 13,
          }}
        >
          No active shipment right now.
        </div>
      </Card>
    );
  }

  const canStartTransit = s.status === "assigned";
  const canDeliver = s.status === "in_transit";

  return (
    <Card>
      <SectionHeader title="Active Shipment" />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.orange,
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            {s.id}
          </div>
          <div
            style={{
              color: COLORS.textPrimary,
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {s.route}
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 12 }}>
            {s.cargo} · Pickup {s.pickup}
          </div>
        </div>
        <Badge status={s.status} />
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: COLORS.textMuted,
            marginBottom: 6,
          }}
        >
          <span>Route progress</span>
          <span style={{ color: COLORS.orange }}>{s.progress}%</span>
        </div>
        <div
          style={{
            height: 5,
            background: "#1f1f1f",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${s.progress}%`,
              background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      <ShipmentTimeline steps={s.timeline} />

      {/* Action buttons — PATCH /shipments/:id/status */}
      {(canStartTransit || canDeliver) && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {canStartTransit && (
            <Button
              variant="outline"
              style={{ opacity: isPending ? 0.6 : 1 }}
              onClick={() =>
                updateStatus({ shipmentId: s.id, status: "in_transit" })
              }
            >
              {isPending ? "Updating…" : "Start Transit"}
            </Button>
          )}
          {canDeliver && (
            <Button
              variant="primary"
              style={{ opacity: isPending ? 0.6 : 1 }}
              onClick={() =>
                updateStatus({ shipmentId: s.id, status: "delivered" })
              }
            >
              {isPending ? "Updating…" : "Mark Delivered"}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Recent bids card ──────────────────────────────────────────────────────────
function RecentBidsCard({ bids }) {
  return (
    <Card>
      <SectionHeader title="My Recent Bids" />
      {bids.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: COLORS.textMuted,
            fontSize: 13,
          }}
        >
          No bids placed yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {bids.map((b, i) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom:
                  i < bids.length - 1 ? `1px solid ${COLORS.border}` : "none",
              }}
            >
              <div>
                <div
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {b.shipment}
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  {b.route} · ETA {b.eta}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    color: COLORS.orange,
                    fontWeight: 700,
                    fontSize: 15,
                    fontFamily: FONTS.display,
                    letterSpacing: "0.05em",
                    marginBottom: 3,
                  }}
                >
                  {b.price}
                </div>
                <Badge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ShipmentTimeline({ steps }) {
  return (
    <div style={{ position: "relative", paddingLeft: 20 }}>
      <div
        style={{
          position: "absolute",
          left: 7,
          top: 4,
          bottom: 4,
          width: 1,
          background: "#2a2a2a",
        }}
      />
      {steps.map((t, i) => (
        <div key={i} style={{ position: "relative", marginBottom: 12 }}>
          <div
            style={{
              position: "absolute",
              left: -20,
              top: 3,
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: t.done
                ? COLORS.orange
                : t.active
                  ? "#60a5fa"
                  : "#1f1f1f",
              border: `2px solid ${t.done ? COLORS.orange : t.active ? "#60a5fa" : "#333"}`,
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: t.active
                ? COLORS.textPrimary
                : t.done
                  ? COLORS.textSecondary
                  : COLORS.textDim,
              fontWeight: t.active ? 600 : 400,
            }}
          >
            {t.label}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textDim }}>{t.meta}</div>
        </div>
      ))}
    </div>
  );
}

function buildTimeline(status) {
  return [
    { label: "Bid accepted", meta: "Accepted", done: true, active: false },
    { label: "Shipment assigned", meta: "Assigned", done: true, active: false },
    {
      label: "In transit",
      meta: "Departed",
      done: false,
      active: status === "in_transit",
    },
    {
      label: "Delivery pending",
      meta: "ETA pending",
      done: false,
      active: false,
    },
  ];
}
