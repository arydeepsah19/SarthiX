import Card from "../../../components/ui/Card.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import DataTable, {
  TableRow,
  TableCell,
} from "../../../components/ui/DataTable.jsx";
import { COLORS } from "../../../components/ui/tokens.js";
import { ICheck, IAlert, IXCircle } from "../../../components/ui/Icons.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { useState } from "react";
import { usePermits, useAddPermit } from "../../../hooks/usePermits.js";
// ← removed ErrorBanner import (file doesn't exist)

const COLUMNS = [
  "Permit Type",
  "Permit No.",
  "Valid From",
  "Expiry Date",
  "Status",
  "Action",
];

export default function DriverPermits() {
  const {
    data: permits = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePermits();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <DashboardSkeleton cards={3} rows={1} />;

  // ── inline error state — no ErrorBanner needed ──────────────────────────
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
          Failed to load permits
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

  const counts = permits.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    { active: 0, warning: 0, expired: 0 },
  );
  const expiringSoon = permits.filter((p) => p.status === "warning");

  return (
    <>
      {/* ── Summary cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        <PermitSummaryCard
          label="ACTIVE"
          count={counts.active}
          color="#4ade80"
          bg="#052e16"
          borderColor="#22543d"
          icon={<ICheck size={16} />}
          sub="Permit Valid"
          barWidth={80}
        />
        <PermitSummaryCard
          label="WARNING"
          count={counts.warning}
          color="#fbbf24"
          bg="#1c1a07"
          borderColor="#4a3d00"
          icon={<IAlert size={16} />}
          sub="Expires < 30 Days"
          barWidth={40}
        />
        <PermitSummaryCard
          label="EXPIRED"
          count={counts.expired}
          color="#f87171"
          bg="#1c0909"
          borderColor="#4a1a1a"
          icon={<IXCircle size={16} />}
          sub="Expired"
          barWidth={0}
        />
      </div>

      {/* ── Warning banner ── */}
      {counts.warning > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#1c1a07",
            border: "1px solid #4a3d0055",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 13,
            color: "#fbbf24",
          }}
        >
          <IAlert size={15} />
          <span>
            <strong>{counts.warning}</strong> permit
            {counts.warning > 1 ? "s" : ""} need attention and{" "}
            {counts.warning > 1 ? "are" : "is"} about to expire soon.
          </span>
        </div>
      )}

      {/* ── Expiring soon highlight ── */}
      {expiringSoon.length > 0 && (
        <Card>
          <SectionHeader title="Expiring Soon" />
          {expiringSoon.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom:
                  i < expiringSoon.length - 1
                    ? `1px solid ${COLORS.border}`
                    : "none",
              }}
            >
              <div>
                <div
                  style={{
                    color: COLORS.textPrimary,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {p.type}
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  {p.number} · Expires {p.expiry}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: "#2a2a1a",
                    color: "#fbbf24",
                    padding: "2px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {p.daysLeft} days left
                </span>
                <Button variant="outline" size="sm">
                  Renew
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* ── Full permits table ── */}
      <Card>
        <SectionHeader
          title="All Permits"
          action="Add Permit"
          onAction={() => setShowForm(true)}
        />
        {showForm && <AddPermitForm onClose={() => setShowForm(false)} />}

        {permits.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "28px 0",
              color: COLORS.textMuted,
              fontSize: 13,
            }}
          >
            No permits found. Add your first permit above.
          </div>
        ) : (
          <DataTable
            columns={COLUMNS}
            rows={permits} // ← was data.permits
            renderRow={(p, i) => (
              <TableRow key={i} isLast={i === permits.length - 1}>
                {" "}
                {/* ← was data.permits.length */}
                <TableCell bold>{p.type}</TableCell>
                <TableCell color={COLORS.orange}>{p.number}</TableCell>
                <TableCell color={COLORS.textSecondary}>{p.from}</TableCell>
                <TableCell color={COLORS.textSecondary}>{p.expiry}</TableCell>
                <TableCell>
                  <Badge status={p.status} />
                </TableCell>
                <TableCell>
                  <Button
                    variant={p.status === "expired" ? "primary" : "ghost"}
                    size="sm"
                  >
                    {p.status === "expired" ? "Renew" : "Update"}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          />
        )}

        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#fbbf24",
            fontSize: 12,
            borderTop: `1px solid ${COLORS.border}`,
            paddingTop: 14,
          }}
        >
          <IAlert size={14} />
          <span>
            Expired permits can lead to heavy penalties and operational delays.
          </span>
        </div>
      </Card>
    </>
  );
}

// ── PermitSummaryCard ─────────────────────────────────────────────────────────
function PermitSummaryCard({
  label,
  count,
  color,
  bg,
  borderColor,
  icon,
  sub,
  barWidth,
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${borderColor}55`,
        borderRadius: 10,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          color,
        }}
      >
        {icon}
        <span
          style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em" }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 700,
          color,
          fontFamily: "'Bebas Neue', cursive",
          lineHeight: 1,
        }}
      >
        {count}
      </div>
      <div style={{ fontSize: 12, color: color + "aa", marginTop: 6 }}>
        {sub}
      </div>
      <div
        style={{
          height: 4,
          background: "#00000044",
          borderRadius: 2,
          marginTop: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            background: color,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

// ── AddPermitForm ─────────────────────────────────────────────────────────────
function AddPermitForm({ onClose }) {
  const { mutate: addPermit, isPending } = useAddPermit();
  const [form, setForm] = useState({
    permit_number: "",
    permit_type: "",
    valid_from: "",
    expiry_date: "",
  });
  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = () => {
    if (!form.permit_number || !form.permit_type || !form.valid_from) return;
    addPermit(form, { onSuccess: onClose });
  };

  return (
    <div
      style={{
        background: "#111",
        border: `1px solid ${COLORS.borderMid}`,
        borderRadius: 10,
        padding: "18px 20px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {[
          {
            name: "permit_type",
            label: "Permit Type",
            type: "select", // 👈 add type
          },
          {
            name: "permit_number",
            label: "Permit Number",
            placeholder: "e.g. #RJ14-AB1234",
          },
          { name: "valid_from", label: "Valid From", type: "date" },
          { name: "expiry_date", label: "Expiry Date", type: "date" },
        ].map(({ name, placeholder, type = "text", label }) => (
          <div
            key={name}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <label style={{ fontSize: 12, color: "#aaa" }}>{label}</label>

            {type === "select" ? (
              <select
                name={name}
                value={form[name]}
                onChange={handle}
                style={{
                  background: "#0a0a0a",
                  border: `1px solid ${COLORS.borderHi}`,
                  color: COLORS.textPrimary,
                  padding: "9px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                }}
              >
                <option value="">Select Permit Type</option>

                {/* 👇 values MUST match your ENUM */}
                <option value="national">All India Permit</option>
                <option value="state">State Permit</option>
              </select>
            ) : (
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={handle}
                style={{
                  background: "#0a0a0a",
                  border: `1px solid ${COLORS.borderHi}`,
                  color: COLORS.textPrimary,
                  padding: "9px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={submit} style={{ opacity: isPending ? 0.6 : 1 }}>
          {isPending ? "Saving…" : "Add Permit"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
