import Card from "../../../components/ui/Card.jsx";
import StatCard from "../../../components/ui/StatCard.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import {
  IShipment,
  ITruck,
  ICheck,
  IXCircle,
  IDash,
} from "../../../components/ui/Icons.jsx";
import { useCompanyDashboard } from "../../../hooks/useCompanyDashboard.js";
import { useCompanyShipments } from "../../../hooks/useShipments.js";
import { useBidsForShipment, useAcceptBid } from "../../../hooks/useBids.js";

export default function CompanyDashboard() {
  const {
    data: dashData,
    isLoading: dashLoading,
    isError,
    error,
    refetch,
  } = useCompanyDashboard();
  const { data: shipments = [], isLoading: shipLoading } =
    useCompanyShipments();

  if (dashLoading || shipLoading)
    return <DashboardSkeleton cards={5} rows={2} />;

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
          Failed to load dashboard
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

  const stats = dashData?.stats ?? {};
  const openShipments = shipments.filter((s) => s.status === "open");

  return (
    <>
      {/* Stat cards — scroll horizontally on very small screens */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard
          label="Total Shipments"
          value={stats.total ?? 0}
          color={COLORS.textPrimary}
          sub="all time"
          icon={<IShipment size={40} />}
        />
        <StatCard
          label="Active"
          value={stats.active ?? 0}
          color="#fbbf24"
          sub="open/assigned/transit"
          icon={<ITruck size={40} />}
        />
        <StatCard
          label="Completed"
          value={stats.completed ?? 0}
          color="#4ade80"
          sub="delivered"
          icon={<ICheck size={40} />}
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled ?? 0}
          color="#f87171"
          sub="all time"
          icon={<IXCircle size={40} />}
        />
        <StatCard
          label="Total Spent"
          value={stats.spent ?? "₹0"}
          color={COLORS.orange}
          sub="on trips"
          icon={<IDash size={40} />}
        />
      </div>

      {/* Two-column grid — stacks on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <RecentShipmentsCard shipments={shipments} />
        <BidInboxCard openShipments={openShipments} />
      </div>

      <ShipmentBreakdownCard stats={stats} />
    </>
  );
}

function RecentShipmentsCard({ shipments }) {
  return (
    <Card>
      <SectionHeader title="Recent Shipments" action="Post Shipment" />
      {shipments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: COLORS.textMuted,
            fontSize: 13,
          }}
        >
          No shipments yet.
        </div>
      ) : (
        shipments.slice(0, 5).map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: i < 4 ? `1px solid ${COLORS.border}` : "none",
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  color: COLORS.orange,
                  fontSize: 12,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {String(s.id).slice(0, 8).toUpperCase()}
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
                {s.route}
              </div>
              <div
                style={{ color: COLORS.textDim, fontSize: 11, marginTop: 2 }}
              >
                {s.posted}
              </div>
            </div>
            <Badge status={s.status} />
          </div>
        ))
      )}
    </Card>
  );
}

function BidInboxCard({ openShipments }) {
  const firstOpen = openShipments[0];
  const { data: bids = [] } = useBidsForShipment(firstOpen?.id);
  const { mutate: acceptBid, isPending, variables } = useAcceptBid();

  return (
    <Card>
      <SectionHeader title="Bid Inbox" />
      {!firstOpen ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: COLORS.textMuted,
            fontSize: 13,
          }}
        >
          No open shipments with bids.
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: 12,
              color: COLORS.textMuted,
              marginBottom: 12,
              padding: "6px 10px",
              background: "#111",
              borderRadius: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {String(firstOpen.id).slice(0, 8).toUpperCase()} · {firstOpen.route}
          </div>
          {bids.length === 0 && (
            <div style={{ color: COLORS.textDim, fontSize: 13 }}>
              No bids yet.
            </div>
          )}
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
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.driver}
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  ETA {b.eta}
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
                <div
                  style={{
                    color: COLORS.orange,
                    fontWeight: 700,
                    fontFamily: FONTS.display,
                    fontSize: 16,
                  }}
                >
                  {b.price}
                </div>
                <Button
                  size="sm"
                  style={{
                    opacity: isPending && variables?.bidId === b.id ? 0.6 : 1,
                  }}
                  onClick={() =>
                    acceptBid({ bidId: b.id, shipmentId: firstOpen.id })
                  }
                >
                  {isPending && variables?.bidId === b.id ? "…" : "Accept"}
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </Card>
  );
}

function ShipmentBreakdownCard({ stats }) {
  const total = stats.total || 1;
  const segments = [
    {
      label: "Delivered",
      count: stats.completed ?? 0,
      color: "#4ade80",
      pct: Math.round(((stats.completed ?? 0) / total) * 100),
    },
    {
      label: "Active",
      count: stats.active ?? 0,
      color: "#60a5fa",
      pct: Math.round(((stats.active ?? 0) / total) * 100),
    },
    {
      label: "Cancelled",
      count: stats.cancelled ?? 0,
      color: "#f87171",
      pct: Math.round(((stats.cancelled ?? 0) / total) * 100),
    },
  ];
  const cx = 50,
    cy = 50,
    r = 36,
    circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Card>
      <SectionHeader title="Shipment Breakdown" />
      {/* Stack vertically on very small screens */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <svg
          width={100}
          height={100}
          viewBox="0 0 100 100"
          style={{ flexShrink: 0 }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1f1f1f"
            strokeWidth={14}
          />
          {segments.map((seg, i) => {
            const dashLen = (seg.pct / 100) * circ;
            const el = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={14}
                strokeDasharray={`${dashLen} ${circ - dashLen}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
              />
            );
            offset += dashLen;
            return el;
          })}
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={COLORS.textPrimary}
            fontFamily={FONTS.display}
          >
            {stats.total ?? 0}
          </text>
        </svg>

        <div
          style={{
            flex: 1,
            minWidth: 140,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {segments.map((seg) => (
            <div
              key={seg.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: seg.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, color: COLORS.textSecondary }}>
                {seg.label} ({seg.count})
              </span>
              <span style={{ color: seg.color, fontWeight: 700 }}>
                {seg.pct}%
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            borderLeft: `1px solid ${COLORS.borderMid}`,
            paddingLeft: "clamp(14px, 3vw, 28px)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Total Spent
          </div>
          <div
            style={{
              fontSize: "clamp(20px, 3vw, 26px)",
              fontWeight: 700,
              color: COLORS.orange,
              fontFamily: FONTS.display,
              marginTop: 4,
            }}
          >
            {stats.spent ?? "₹0"}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>
            lifetime spend
          </div>
        </div>
      </div>
    </Card>
  );
}
