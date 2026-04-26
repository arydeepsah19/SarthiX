import { useState, useRef } from "react";
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
import {
  useDriverDashboard,
  useDriverActiveShipments,
} from "../../../hooks/useDriverDashboard.js";
import { useUpdateShipmentStatus } from "../../../hooks/useShipments.js";
import {
  useUploadShipmentImage,
  uploadFileToSupabase,
} from "../../../hooks/useShipmentImages.js";
import { useDriverBids } from "../../../hooks/useDriverBids.js";
import { useLocationBroadcast } from "../../../hooks/useTracking.js";

export default function DriverDashboard() {
  const { data: apiData, isLoading: dashLoading } = useDriverDashboard();
  const { data: activeShipments = [], isLoading: activeLoading } =
    useDriverActiveShipments();
  const { data: myBids = [], isLoading: bidsLoading } = useDriverBids();

  // Must be before early returns (Rules of Hooks)
  const inTransitIds = activeShipments
    .filter((s) => s.status === "in_transit")
    .map((s) => s.id);
  useLocationBroadcast(inTransitIds);

  const isLoading = dashLoading || activeLoading || bidsLoading;
  if (isLoading) return <DashboardSkeleton rows={2} cards={5} />;
  if (!apiData) return null;

  const { stats, rating, ratingCount } = apiData;

  return (
    <>
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
          value={activeShipments.length || stats.activeShipments}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        <ActiveShipmentsCard shipments={activeShipments} />
        <RecentBidsCard bids={myBids.slice(0, 4)} />
      </div>
    </>
  );
}

// ── Active shipments card ─────────────────────────────────────────────────────
function ActiveShipmentsCard({ shipments }) {
  const {
    mutate: updateStatus,
    isPending,
    variables,
  } = useUpdateShipmentStatus();
  const [deliverFor, setDeliverFor] = useState(null);

  if (shipments.length === 0) {
    return (
      <Card>
        <SectionHeader title="Active Shipments" />
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: COLORS.textMuted,
            fontSize: 13,
          }}
        >
          No active shipments right now.
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <SectionHeader title={`Active Shipments (${shipments.length})`} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {shipments.map((s, i) => {
            const canStartTransit = s.status === "assigned";
            const canDeliver = s.status === "in_transit";
            const isUpdating = isPending && variables?.shipmentId === s.id;
            const progress = s.status === "in_transit" ? 50 : 10;

            return (
              <div
                key={s.id}
                style={{
                  paddingBottom: i < shipments.length - 1 ? 14 : 0,
                  borderBottom:
                    i < shipments.length - 1
                      ? `1px solid ${COLORS.border}`
                      : "none",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        color: COLORS.textPrimary,
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.route}
                    </div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11 }}>
                      {s.loadType || "Cargo"}
                      {s.distanceKm ? ` · ${s.distanceKm} km` : ""}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {s.status === "in_transit" && (
                      <span
                        style={{
                          fontSize: 9,
                          color: "#f97316",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#f97316",
                            display: "inline-block",
                            animation: "livePulse 1.4s ease-in-out infinite",
                          }}
                        />
                        LIVE
                        <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
                      </span>
                    )}
                    <Badge status={s.status} />
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      color: COLORS.textMuted,
                      marginBottom: 4,
                    }}
                  >
                    <span>Progress</span>
                    <span style={{ color: COLORS.orange }}>{progress}%</span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "#1f1f1f",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
                        borderRadius: 4,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>

                <ShipmentTimeline steps={buildTimeline(s.status)} />

                {/* Action buttons */}
                {(canStartTransit || canDeliver) && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {canStartTransit && (
                      <Button
                        variant="outline"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          opacity: isUpdating ? 0.6 : 1,
                        }}
                        onClick={() =>
                          updateStatus({
                            shipmentId: s.id,
                            status: "in_transit",
                          })
                        }
                      >
                        {isUpdating ? "Updating…" : "🚛 Start Transit"}
                      </Button>
                    )}
                    {canDeliver && (
                      <Button
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          background: "linear-gradient(135deg,#4ade80,#16a34a)",
                          opacity: isUpdating ? 0.6 : 1,
                        }}
                        onClick={() => setDeliverFor(s)}
                      >
                        {isUpdating ? "Updating…" : "📸 Mark Delivered"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Proof of delivery modal */}
      {deliverFor && (
        <ProofOfDeliveryModal
          shipment={deliverFor}
          onConfirm={() => {
            updateStatus({ shipmentId: deliverFor.id, status: "delivered" });
            setDeliverFor(null);
          }}
          onClose={() => setDeliverFor(null)}
        />
      )}
    </>
  );
}

// ── Proof of Delivery Modal ───────────────────────────────────────────────────
function ProofOfDeliveryModal({ shipment, onConfirm, onClose }) {
  const fileRef = useRef(null);
  const { mutate: uploadImage, isPending: saving } = useUploadShipmentImage(
    shipment.id,
  );
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const busy = uploading || saving;

  const handleFiles = (e) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4 - photos.length);
    if (!files.length) return;
    setPhotos((p) => [
      ...p,
      ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);
    e.target.value = "";
  };

  const handleConfirm = async () => {
    setError(null);
    setUploading(true);
    try {
      for (const photo of photos) {
        const url = await uploadFileToSupabase(photo.file, shipment.id);
        await new Promise((res, rej) =>
          uploadImage(url, { onSuccess: res, onError: rej }),
        );
      }
      setConfirmed(true);
      setTimeout(onConfirm, 900);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onClick={!confirmed ? onClose : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 600,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px,3vw,24px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0c0c0c",
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 500,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 22px 16px",
            borderBottom: `1px solid ${COLORS.borderMid}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: confirmed ? "#4ade80" : COLORS.textPrimary,
                marginBottom: 4,
              }}
            >
              {confirmed ? "✓ Delivery Confirmed!" : "📸 Proof of Delivery"}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>
              {confirmed
                ? "Marking shipment as delivered…"
                : `${shipment.pickup} → ${shipment.drop}`}
            </div>
          </div>
          {!confirmed && (
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                color: COLORS.textMuted,
                width: 32,
                height: 32,
                borderRadius: "50%",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px" }}>
          {confirmed ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 15, color: "#4ade80", fontWeight: 600 }}>
                Shipment delivered successfully
              </div>
              <div
                style={{ fontSize: 12, color: COLORS.textDim, marginTop: 6 }}
              >
                Shipper will be notified
              </div>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div
                style={{
                  background: "rgba(74,222,128,0.07)",
                  border: "1px solid rgba(74,222,128,0.18)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 18,
                  fontSize: 12,
                  color: "#4ade80",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ flexShrink: 0 }}>ℹ️</span>
                <span>
                  Upload delivery photos as proof. Photos are optional but
                  recommended to avoid disputes. Max 4 images.
                </span>
              </div>

              {/* Photo grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {photos.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#111",
                    }}
                  >
                    <img
                      src={p.preview}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#f87171",
                        border: "none",
                        color: "#fff",
                        fontSize: 9,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 3,
                        left: 3,
                        background: "rgba(0,0,0,0.7)",
                        borderRadius: 3,
                        padding: "1px 5px",
                        fontSize: 9,
                        color: "#fff",
                      }}
                    >
                      {i + 1}
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 4 - photos.length) }).map(
                  (_, i) => (
                    <div
                      key={`e-${i}`}
                      onClick={() => fileRef.current?.click()}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 8,
                        border: `1px dashed ${photos.length === 0 && i === 0 ? COLORS.orange : COLORS.borderHi}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        cursor: "pointer",
                        background:
                          photos.length === 0 && i === 0
                            ? COLORS.orangeSubtle
                            : "transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>📷</span>
                      <span
                        style={{
                          fontSize: 9,
                          color:
                            photos.length === 0 && i === 0
                              ? COLORS.orange
                              : COLORS.textDim,
                        }}
                      >
                        Add
                      </span>
                    </div>
                  ),
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                style={{ display: "none" }}
              />

              {photos.length > 0 && photos.length < 4 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: `1px dashed ${COLORS.borderHi}`,
                    color: COLORS.textMuted,
                    padding: "8px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                    marginBottom: 14,
                  }}
                >
                  + Add more ({photos.length}/4)
                </button>
              )}

              {error && (
                <div
                  style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  onClick={handleConfirm}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    background: "linear-gradient(135deg,#4ade80,#16a34a)",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {busy
                    ? "Uploading…"
                    : photos.length > 0
                      ? "✓ Upload & Confirm Delivery"
                      : "✓ Confirm Delivery (No Photos)"}
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textDim,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                This action cannot be undone. Shipper will be notified.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
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
                  {b.shipment}
                </div>
                <div
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.route} · ETA {b.eta}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
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
        <div key={i} style={{ position: "relative", marginBottom: 8 }}>
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
              fontSize: 12,
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
        </div>
      ))}
    </div>
  );
}

function buildTimeline(status) {
  return [
    { label: "Bid accepted", done: true, active: false },
    { label: "Shipment assigned", done: true, active: false },
    {
      label: "In transit",
      done: status === "in_transit" || status === "delivered",
      active: status === "in_transit",
    },
    { label: "Delivered", done: status === "delivered", active: false },
  ];
}
