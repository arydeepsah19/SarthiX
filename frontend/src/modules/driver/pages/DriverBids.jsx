import Card from "../../../components/ui/Card.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import DataTable, { TableRow, TableCell } from "../../../components/ui/DataTable.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import { useDriverBids } from "../../../hooks/useDriverBids.js";

const COLUMNS = ["Shipment", "Route", "My Bid", "ETA", "Status"];

export default function DriverBids() {
  const { data: myBids = [], isLoading, isError, error, refetch } = useDriverBids();

  if (isLoading) return <DashboardSkeleton cards={0} rows={2} />;

  if (isError) return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "#f87171", fontSize: 13 }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Failed to load bids</div>
      <div style={{ opacity: 0.7, marginBottom: 16 }}>{error.message}</div>
      <button onClick={refetch} style={{ background: "transparent", border: "1px solid #f87171", color: "#f87171", padding: "7px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
        Try again
      </button>
    </div>
  );

  return (
    <Card>
      <SectionHeader title={`All My Bids (${myBids.length})`} />
      {myBids.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: COLORS.textMuted, fontSize: 13 }}>
          No bids placed yet. Browse{" "}
          <span style={{ color: COLORS.orange, cursor: "pointer" }}>Open Shipments</span>{" "}
          to place your first bid.
        </div>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={myBids}
          renderRow={(b, i) => (
            <TableRow key={b.id} isLast={i === myBids.length - 1}>
              <TableCell color={COLORS.orange} bold>{b.shipment}</TableCell>
              <TableCell>{b.route}</TableCell>
              <TableCell>
                <span style={{ fontFamily: FONTS.display, fontSize: 16, color: COLORS.orange, letterSpacing: "0.05em" }}>
                  {b.price}
                </span>
              </TableCell>
              <TableCell color={COLORS.textSecondary}>{b.eta}</TableCell>
              <TableCell><Badge status={b.status} /></TableCell>
            </TableRow>
          )}
        />
      )}
    </Card>
  );
}