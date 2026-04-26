import Card from "../../../components/ui/Card.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Stars from "../../../components/ui/Stars.jsx";
import DataTable, {
  TableRow,
  TableCell,
} from "../../../components/ui/DataTable.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import { useDriverTrips } from "../../../hooks/useDriverTrips.js";
import { useDriverDashboard } from "../../../hooks/useDriverDashboard.js";

const COLUMNS = ["Trip ID", "Route", "Date", "Earning", "Rating"];

export default function DriverTrips() {
  const { data: trips = [], isLoading: tripsLoading } = useDriverTrips();
  const { data: dashData, isLoading: dashLoading } = useDriverDashboard();

  if (tripsLoading || dashLoading)
    return <DashboardSkeleton cards={3} rows={1} />;

  return (
    <>
      {/* ── Summary chips ── */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* ✅ Fix: was dashData?.totalTrips — correct path is dashData?.stats?.tripsCompleted */}
        <SummaryChip
          label="Total Trips"
          value={dashData?.stats?.tripsCompleted ?? 0}
        />

        {/* ✅ Fix: was dashData?.totalEarnings — correct path is dashData?.stats?.totalEarnings */}
        {/* totalEarnings is already formatted as "₹X" by normalise() so render directly */}
        <SummaryChip
          label="Total Earned"
          value={dashData?.stats?.totalEarnings ?? "₹0"}
          color={COLORS.orange}
        />

        {/* ✅ Fix: was dashData?.avgRating — correct path is dashData?.rating */}
        <SummaryChip
          label="Avg Rating"
          value={
            dashData?.rating ? `${Number(dashData.rating).toFixed(1)}★` : "–"
          }
          color="#fbbf24"
        />
      </div>

      <Card>
        <SectionHeader title="Trip History" />
        {trips.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "28px 0",
              color: COLORS.textMuted,
              fontSize: 13,
            }}
          >
            No completed trips yet.
          </div>
        ) : (
          <DataTable
            columns={COLUMNS}
            rows={trips}
            renderRow={(t, i) => (
              <TableRow key={t.id} isLast={i === trips.length - 1}>
                <TableCell color={COLORS.orange} bold>
                  TRP-{String(t.id).slice(0, 5).toUpperCase()}
                </TableCell>
                <TableCell>{t.route}</TableCell>
                {/* ✅ Fix: was t.completed_at — normalise() maps this field to t.date */}
                <TableCell color={COLORS.textMuted}>{t.date}</TableCell>
                <TableCell>
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 16,
                      color: "#4ade80",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t.earning}
                  </span>
                </TableCell>
                <TableCell>
                  {t.rating ? (
                    <Stars value={t.rating} />
                  ) : (
                    <span style={{ color: COLORS.textDim, fontSize: 12 }}>
                      Not rated
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )}
          />
        )}
      </Card>
    </>
  );
}

function SummaryChip({ label, value, color = COLORS.textPrimary }) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: `1px solid ${COLORS.borderMid}`,
        borderRadius: 8,
        padding: "12px 20px",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: COLORS.textMuted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
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
