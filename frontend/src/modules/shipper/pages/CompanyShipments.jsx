import { useState, useRef, useEffect } from "react";
import { useAxios } from "../../../lib/axios.js";
import TruckAvatar from "../../../components/ui/TruckAvatar.jsx";
import Card from "../../../components/ui/Card.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import {
  useCompanyShipments,
  usePostShipment,
  useShipmentDetail,
  useUpdateShipmentStatus,
} from "../../../hooks/useShipments.js";
import { useBidsForShipment, useAcceptBid } from "../../../hooks/useBids.js";
import {
  useUploadShipmentImage,
  useDeleteShipmentImage,
  uploadFileToSupabase,
} from "../../../hooks/useShipmentImages.js";
import { useHasRated, useSubmitRating } from "../../../hooks/useRatings.js";

const ALL_STATUSES = [
  "open",
  "assigned",
  "in_transit",
  "delivered",
  "cancelled",
];

const STATUS_COLOR = {
  open: "#60a5fa",
  assigned: "#fbbf24",
  in_transit: "#f97316",
  delivered: "#4ade80",
  cancelled: "#f87171",
};

// ── Persist prompted IDs in localStorage so modal never re-opens after refresh
const STORAGE_KEY = "rating_prompted_ids";
function getPromptedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function addPromptedId(id) {
  try {
    const ids = getPromptedIds();
    ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

export default function CompanyShipments() {
  const {
    data: shipments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCompanyShipments();
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [bidsFor, setBidsFor] = useState(null);
  const [trackFor, setTrackFor] = useState(null);
  const [rateFor, setRateFor] = useState(null);
  const axios = useAxios();
  const checkingRef = useRef(false); // prevent concurrent checks

  // ── Auto-open rating modal only for unrated deliveries never prompted before
  useEffect(() => {
    if (!shipments.length || checkingRef.current) return;

    const candidates = shipments.filter(
      (s) =>
        s.status === "delivered" && s.driverId && !getPromptedIds().has(s.id),
    );
    if (!candidates.length) return;

    checkingRef.current = true;
    (async () => {
      try {
        for (const shipment of candidates) {
          addPromptedId(shipment.id); // mark before check so we never re-check
          const { data } = await axios.get("/ratings/check", {
            params: { shipment_id: shipment.id },
          });
          if (!data?.rated) {
            setRateFor(shipment);
            break; // show one modal at a time
          }
        }
      } catch {
        // silently ignore — don't block UI if check fails
      } finally {
        checkingRef.current = false;
      }
    })();
  }, [shipments]);

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

  const counts = shipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const filtered =
    filter === "all" ? shipments : shipments.filter((s) => s.status === filter);

  return (
    <>
      {/* ── Filter bar ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <FilterChip
          label="All"
          count={shipments.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {ALL_STATUSES.map(
          (s) =>
            counts[s] > 0 && (
              <FilterChip
                key={s}
                label={s.replace(/_/g, " ")}
                count={counts[s]}
                active={filter === s}
                onClick={() => setFilter(s)}
              />
            ),
        )}
        <div style={{ marginLeft: "auto" }}>
          <Button onClick={() => setShowForm(true)}>+ Post Shipment</Button>
        </div>
      </div>

      {showForm && <PostShipmentForm onClose={() => setShowForm(false)} />}

      {/* ── Card grid ── */}
      {filtered.length === 0 ? (
        <Card>
          <div
            style={{
              textAlign: "center",
              padding: "36px 0",
              color: COLORS.textMuted,
              fontSize: 13,
            }}
          >
            No shipments
            {filter !== "all"
              ? ` with status "${filter.replace(/_/g, " ")}"`
              : ""}
            .
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              onViewBids={() => setBidsFor(s)}
              onTrack={() => setTrackFor(s)}
              onRate={() => setRateFor(s)}
            />
          ))}
        </div>
      )}

      {/* ── Bids dialog ── */}
      {bidsFor && (
        <BidsDialog shipment={bidsFor} onClose={() => setBidsFor(null)} />
      )}

      {/* ── Tracking dialog ── */}
      {trackFor && (
        <TrackingDialog shipment={trackFor} onClose={() => setTrackFor(null)} />
      )}

      {/* ── Rating modal ── */}
      {rateFor && (
        <RatingModal shipment={rateFor} onClose={() => setRateFor(null)} />
      )}
    </>
  );
}

// ── Shipment card ─────────────────────────────────────────────────────────────
function ShipmentCard({ shipment: s, onViewBids, onTrack, onRate }) {
  const { data: detail } = useShipmentDetail(s.id);
  const { data: hasRated } = useHasRated(
    s.status === "delivered" ? s.id : null,
  );
  const images = detail?.images ?? [];
  const [lightboxImg, setLightboxImg] = useState(null);
  const statusColor = STATUS_COLOR[s.status] ?? COLORS.textMuted;

  return (
    <>
      <div
        style={{
          background: "#0e0e0e",
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "border-color 0.15s",
        }}
      >
        <ImageSlider
          images={images}
          onImageClick={setLightboxImg}
          statusColor={statusColor}
          shipmentId={s.id}
        />

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
              gap: 8,
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

          {/* Status row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Badge status={s.status} />
            <div style={{ display: "flex", gap: 16 }}>
              <Stat label="Bids" value={s.bids ?? 0} color="#60a5fa" />
              <Stat label="Posted" value={s.posted} color={COLORS.textDim} />
            </div>
          </div>

          {/* Chips */}
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
            <DetailChip
              label="Min Bid"
              value={s.minBid || "–"}
              accent={COLORS.orange}
            />
          </div>
          {s.deadlineFmt && (
            <DetailChip
              label="Bid Deadline"
              value={s.deadlineFmt}
              accent="#fbbf24"
            />
          )}

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: "auto",
              flexWrap: "wrap",
            }}
          >
            {s.status === "open" && (
              <Button
                variant="outline"
                size="sm"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={onViewBids}
              >
                View Bids{" "}
                {s.bids > 0 && (
                  <span
                    style={{
                      background: COLORS.orange,
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 6px",
                      fontSize: 10,
                      marginLeft: 4,
                    }}
                  >
                    {s.bids}
                  </span>
                )}
              </Button>
            )}
            {s.status === "assigned" && <MaterialLoadedBtn shipmentId={s.id} />}
            {s.status === "in_transit" && (
              <Button
                variant="outline"
                size="sm"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  borderColor: "#f97316",
                  color: "#f97316",
                }}
                onClick={onTrack}
              >
                🗺️ Track Live
              </Button>
            )}

            {/* ── Delivered: Rate Driver or ✓ Rated ── */}
            {s.status === "delivered" &&
              (hasRated ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#4ade80",
                    padding: "7px 0",
                  }}
                >
                  <span>★</span> Rated
                </div>
              ) : (
                <Button
                  size="sm"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
                    border: "none",
                    color: "#fff",
                  }}
                  onClick={onRate}
                >
                  ⭐ Rate Driver
                </Button>
              ))}
          </div>
        </div>
      </div>

      {lightboxImg && (
        <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />
      )}
    </>
  );
}

// ── Rating Modal ──────────────────────────────────────────────────────────────
function RatingModal({ shipment, onClose }) {
  const {
    mutate: submitRating,
    isPending,
    isError,
    error,
    isSuccess,
  } = useSubmitRating();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  // Close with Escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Auto-close after success
  useEffect(() => {
    if (done) {
      const t = setTimeout(onClose, 1800);
      return () => clearTimeout(t);
    }
  }, [done, onClose]);

  const handleSubmit = () => {
    if (stars === 0) return;
    submitRating(
      {
        shipment_id: shipment.id,
        rating: stars,
        comment: comment.trim() || null,
      },
      { onSuccess: () => setDone(true) },
    );
  };

  const displayStars = hovered || stars;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 600,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0e0e0e",
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 18,
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(0,0,0,0.9)",
        }}
      >
        {/* ── Top accent strip ── */}
        <div
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
          }}
        />

        <div style={{ padding: "28px 28px 24px" }}>
          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#4ade80",
                  fontFamily: FONTS.display,
                  marginBottom: 8,
                }}
              >
                Rating Submitted!
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                Thank you for your feedback.
              </div>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 22,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      fontFamily: FONTS.display,
                      marginBottom: 6,
                    }}
                  >
                    Rate the Driver
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <LocationPill label={shipment.pickup} type="pickup" />
                    <span style={{ color: COLORS.textDim, fontSize: 12 }}>
                      →
                    </span>
                    <LocationPill label={shipment.drop} type="drop" />
                  </div>
                </div>
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
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* ── Star picker ── */}
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: COLORS.textDim,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 14,
                  }}
                >
                  How was the delivery?
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center", gap: 10 }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setStars(n)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 2px",
                        transition: "transform 0.15s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 36,
                          display: "block",
                          color:
                            n <= displayStars ? "#fbbf24" : COLORS.borderHi,
                          transform:
                            n <= displayStars ? "scale(1.15)" : "scale(1)",
                          transition: "all 0.15s",
                          filter:
                            n <= displayStars
                              ? "drop-shadow(0 0 6px #fbbf2466)"
                              : "none",
                        }}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                {/* Label under stars */}
                <div style={{ height: 20, marginTop: 8 }}>
                  {displayStars > 0 && (
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: COLORS.orange,
                      }}
                    >
                      {
                        ["", "Poor", "Fair", "Good", "Great", "Excellent!"][
                          displayStars
                        ]
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* ── Comment box ── */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Comment{" "}
                  <span style={{ color: COLORS.textDim, fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  placeholder="How was punctuality, handling, communication…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={300}
                  style={{
                    width: "100%",
                    background: "#0a0a0a",
                    border: `1px solid ${COLORS.borderHi}`,
                    color: COLORS.textPrimary,
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                  }}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: 10,
                    color: COLORS.textDim,
                    marginTop: 4,
                  }}
                >
                  {comment.length}/300
                </div>
              </div>

              {isError && (
                <div
                  style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}
                >
                  {error?.message ?? "Failed to submit. Please try again."}
                </div>
              )}

              {/* ── Actions ── */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleSubmit}
                  disabled={stars === 0 || isPending}
                  style={{
                    flex: 1,
                    background:
                      stars === 0
                        ? "#1a1a1a"
                        : `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
                    border: "none",
                    color: stars === 0 ? COLORS.textDim : "#fff",
                    padding: "12px 0",
                    borderRadius: 9,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor:
                      stars === 0 || isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {isPending ? "Submitting…" : "Submit Rating"}
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: "12px 18px",
                    background: "transparent",
                    border: `1px solid ${COLORS.borderMid}`,
                    color: COLORS.textMuted,
                    borderRadius: 9,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Skip
                </button>
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: COLORS.textDim,
                  marginTop: 12,
                }}
              >
                You can always rate later from the delivered shipments tab
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Image slider ──────────────────────────────────────────────────────────────
function ImageSlider({ images, onImageClick, statusColor, shipmentId }) {
  const [idx, setIdx] = useState(0);
  const { mutate: deleteImage } = useDeleteShipmentImage(shipmentId);
  const fileRef = useRef(null);
  const { mutate: uploadImage, isPending: saving } =
    useUploadShipmentImage(shipmentId);
  const [uploading, setUploading] = useState(false);

  const busy = uploading || saving;
  const canUpload = images.length < 4;
  const hasImages = images.length > 0;

  useEffect(() => {
    if (idx >= images.length && images.length > 0) setIdx(images.length - 1);
  }, [images.length]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4 - images.length);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadFileToSupabase(file, shipmentId);
        await new Promise((res, rej) =>
          uploadImage(url, { onSuccess: res, onError: rej }),
        );
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#080808",
        borderBottom: `1px solid ${COLORS.borderMid}`,
      }}
    >
      <div style={{ height: 3, background: statusColor }} />

      {hasImages ? (
        <>
          <div
            style={{
              height: 200,
              overflow: "hidden",
              cursor: "zoom-in",
              position: "relative",
            }}
            onClick={() => onImageClick(images[idx]?.image_url)}
          >
            <img
              src={images[idx]?.image_url}
              alt={`Shipment image ${idx + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: 10,
                padding: "3px 7px",
                borderRadius: 4,
              }}
            >
              🔍 Click to enlarge
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "8px 10px",
              alignItems: "center",
            }}
          >
            {images.map((img, i) => (
              <div key={img.id ?? i} style={{ position: "relative" }}>
                <img
                  src={img.image_url}
                  alt=""
                  onClick={() => setIdx(i)}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 6,
                    cursor: "pointer",
                    border: `2px solid ${i === idx ? COLORS.orange : "transparent"}`,
                    opacity: i === idx ? 1 : 0.6,
                    transition: "all 0.15s",
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                  }}
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#f87171",
                    border: "none",
                    color: "#fff",
                    fontSize: 9,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length > 1 && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                <NavBtn
                  onClick={() =>
                    setIdx((i) => (i - 1 + images.length) % images.length)
                  }
                >
                  ‹
                </NavBtn>
                <NavBtn onClick={() => setIdx((i) => (i + 1) % images.length)}>
                  ›
                </NavBtn>
              </div>
            )}
            {canUpload && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    border: `1px dashed ${COLORS.borderHi}`,
                    background: "transparent",
                    color: COLORS.textDim,
                    cursor: "pointer",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: busy ? 0.5 : 1,
                  }}
                >
                  {busy ? "…" : "+"}
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            height: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: COLORS.textDim,
          }}
        >
          <div style={{ fontSize: 32, opacity: 0.3 }}>📦</div>
          <div style={{ fontSize: 12 }}>No photos yet</div>
          {canUpload && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  background: "transparent",
                  border: `1px dashed ${COLORS.orange}`,
                  color: COLORS.orange,
                  padding: "5px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {busy ? "Uploading…" : "+ Upload Photos"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 26,
        height: 26,
        borderRadius: 5,
        background: "#1a1a1a",
        border: `1px solid ${COLORS.borderHi}`,
        color: COLORS.textSecondary,
        cursor: "pointer",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

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

function BidsDialog({ shipment, onClose }) {
  const { data: bids = [], isLoading } = useBidsForShipment(shipment.id);
  const { mutate: acceptBid, isPending: accepting } = useAcceptBid();
  const [acceptingId, setAcceptingId] = useState(null);

  const handleAccept = (bid) => {
    setAcceptingId(bid.id);
    acceptBid(
      { bidId: bid.id, shipmentId: shipment.id },
      { onSuccess: onClose, onSettled: () => setAcceptingId(null) },
    );
  };

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
        zIndex: 500,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0e0e0e",
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 620,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px 24px 18px",
            borderBottom: `1px solid ${COLORS.borderMid}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.textPrimary,
                marginBottom: 4,
              }}
            >
              Bids for Shipment
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LocationPill label={shipment.pickup} type="pickup" />
              <span style={{ color: COLORS.textDim, fontWeight: 700 }}>→</span>
              <LocationPill label={shipment.drop} type="drop" />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: COLORS.textMuted,
              width: 34,
              height: 34,
              borderRadius: "50%",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px" }}>
          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: COLORS.textMuted,
                fontSize: 13,
              }}
            >
              Loading bids…
            </div>
          ) : bids.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: COLORS.textMuted,
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              No bids yet. Drivers will see your shipment on Open Shipments.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  canAccept={shipment.status === "open"}
                  isAccepting={acceptingId === bid.id && accepting}
                  onAccept={() => handleAccept(bid)}
                />
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "14px 24px",
            borderTop: `1px solid ${COLORS.borderMid}`,
            fontSize: 12,
            color: COLORS.textDim,
            flexShrink: 0,
          }}
        >
          {bids.length > 0 &&
            `${bids.length} bid${bids.length > 1 ? "s" : ""} received · Accepting a bid will assign the driver and close bidding.`}
        </div>
      </div>
    </div>
  );
}

function BidCard({ bid, canAccept, isAccepting, onAccept }) {
  const wasEdited =
    bid.updated_at && bid.created_at && bid.updated_at !== bid.created_at;
  return (
    <div
      style={{
        background: "#141414",
        border: `1px solid ${wasEdited ? "#60a5fa33" : COLORS.borderMid}`,
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <TruckAvatar
        seed={bid.driverId}
        size={56}
        avatarUrl={bid.avatarUrl}
        style={{ border: `2px solid ${COLORS.borderHi}`, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: COLORS.textPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {bid.driver}
          </div>
          <VerificationBadge status={bid.verificationStatus} size="sm" />
          {wasEdited && (
            <span
              style={{
                background: "#1a2a1a",
                border: "1px solid #22543d",
                color: "#4ade80",
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
              title={`Last edited: ${new Date(bid.updated_at).toLocaleString("en-IN")}`}
            >
              Edited
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <StarRating value={bid.rating} />
          {bid.tripsCompleted != null && (
            <span
              style={{
                fontSize: 11,
                color: COLORS.textMuted,
                background: "#1a1a1a",
                border: `1px solid ${COLORS.borderHi}`,
                padding: "2px 7px",
                borderRadius: 4,
              }}
            >
              🚛 {bid.tripsCompleted} trips
            </span>
          )}
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>
            ETA {bid.eta}
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: COLORS.orange,
            fontFamily: FONTS.display,
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          {bid.price}
        </div>
        {canAccept && bid.status === "pending" ? (
          <button
            onClick={onAccept}
            disabled={isAccepting}
            style={{
              background: isAccepting
                ? "#1a0d00"
                : `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDark})`,
              border: "none",
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              cursor: isAccepting ? "not-allowed" : "pointer",
              opacity: isAccepting ? 0.7 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {isAccepting ? "Accepting…" : "Accept Bid"}
          </button>
        ) : (
          <Badge status={bid.status} />
        )}
      </div>
    </div>
  );
}

function StarRating({ value = 0 }) {
  const stars = Math.round(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: 11,
            color: s <= stars ? "#fbbf24" : COLORS.borderHi,
          }}
        >
          ★
        </span>
      ))}
      <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 2 }}>
        {value ? Number(value).toFixed(1) : "New"}
      </span>
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

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
      <div
        style={{
          fontSize: 10,
          color: COLORS.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? COLORS.orangeSubtle : "#111",
        border: `1px solid ${active ? COLORS.orange : COLORS.borderMid}`,
        color: active ? COLORS.orange : COLORS.textMuted,
        padding: "5px 14px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        textTransform: "capitalize",
      }}
    >
      {label}
      <span
        style={{
          background: active ? COLORS.orange : COLORS.borderHi,
          color: active ? "#fff" : COLORS.textMuted,
          padding: "1px 6px",
          borderRadius: 10,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {count}
      </span>
    </button>
  );
}

export function ShipmentImageUploader({ shipmentId, readOnly = false }) {
  const { data: shipment } = useShipmentDetail(shipmentId);
  const { mutate: uploadImage, isPending: saving } =
    useUploadShipmentImage(shipmentId);
  const { mutate: deleteImage, isPending: deleting } =
    useDeleteShipmentImage(shipmentId);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [replaceId, setReplaceId] = useState(null);
  const fileRef = useRef(null);

  const savedImages = shipment?.images ?? [];
  const totalCount = savedImages.length + previews.length;
  const canUpload = !readOnly && totalCount < 4;
  const busy = uploading || saving || deleting;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (replaceId) {
      setUploadError(null);
      setUploading(true);
      try {
        await new Promise((res, rej) =>
          deleteImage(replaceId, { onSuccess: res, onError: rej }),
        );
        const url = await uploadFileToSupabase(files[0], shipmentId);
        await new Promise((res, rej) =>
          uploadImage(url, { onSuccess: res, onError: rej }),
        );
      } catch (err) {
        setUploadError(err.message);
      } finally {
        setUploading(false);
        setReplaceId(null);
        e.target.value = "";
      }
      return;
    }
    const allowed = files.slice(0, 4 - totalCount);
    if (!allowed.length) return;
    setUploadError(null);
    setUploading(true);
    setPreviews((p) => [...p, ...allowed.map((f) => URL.createObjectURL(f))]);
    try {
      for (const file of allowed) {
        const url = await uploadFileToSupabase(file, shipmentId);
        await new Promise((res, rej) =>
          uploadImage(url, { onSuccess: res, onError: rej }),
        );
      }
      setPreviews([]);
    } catch (err) {
      setUploadError(err.message);
      setPreviews([]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {savedImages.map((img, i) => (
          <ImageThumb
            key={img.id ?? i}
            src={img.image_url}
            index={i}
            readOnly={readOnly}
            onDelete={() => deleteImage(img.id)}
            onReplace={() => {
              setReplaceId(img.id);
              fileRef.current?.click();
            }}
            isDeleting={deleting}
          />
        ))}
        {previews.map((src, i) => (
          <ImageThumb
            key={`p-${i}`}
            src={src}
            index={savedImages.length + i}
            isPreview
          />
        ))}
        {!readOnly &&
          Array.from({ length: Math.max(0, 4 - totalCount) }).map((_, i) => (
            <div
              key={`e-${i}`}
              onClick={
                canUpload && !busy
                  ? () => {
                      setReplaceId(null);
                      fileRef.current?.click();
                    }
                  : undefined
              }
              style={{
                aspectRatio: "1",
                border: `1px dashed ${COLORS.borderHi}`,
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                cursor: canUpload ? "pointer" : "default",
                color: COLORS.textDim,
                fontSize: 11,
              }}
            >
              <div style={{ fontSize: 20, color: COLORS.borderHi }}>+</div>
              <span>Add</span>
            </div>
          ))}
        {readOnly &&
          Array.from({ length: Math.max(0, 4 - savedImages.length) }).map(
            (_, i) => (
              <div
                key={`er-${i}`}
                style={{
                  aspectRatio: "1",
                  border: `1px dashed ${COLORS.borderHi}`,
                  borderRadius: 8,
                  background: "#0a0a0a",
                }}
              />
            ),
          )}
      </div>
      {!readOnly && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple={!replaceId}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {canUpload && (
            <button
              onClick={() => {
                setReplaceId(null);
                fileRef.current?.click();
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: `1px dashed ${COLORS.orange}`,
                color: COLORS.orange,
                padding: "9px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Processing…" : `Upload Images (${totalCount}/4)`}
            </button>
          )}
        </>
      )}
      {uploadError && (
        <div style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
          {uploadError}
        </div>
      )}
      {!readOnly && (
        <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 6 }}>
          Max 4 · Hover to replace or delete
        </div>
      )}
    </div>
  );
}

function ImageThumb({
  src,
  index,
  isPreview = false,
  readOnly = false,
  onDelete,
  onReplace,
  isDeleting,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: "1",
        borderRadius: 8,
        overflow: "hidden",
        background: "#111",
        position: "relative",
        opacity: isPreview ? 0.5 : 1,
      }}
    >
      <img
        src={src}
        alt={`Image ${index + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          background: "rgba(0,0,0,0.65)",
          color: "#fff",
          fontSize: 10,
          padding: "1px 5px",
          borderRadius: 3,
        }}
      >
        {isPreview ? "…" : index + 1}
      </div>
      {!readOnly && !isPreview && hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <button
            onClick={onReplace}
            style={{
              background: "#1a1a2a",
              border: "1px solid #60a5fa",
              color: "#60a5fa",
              padding: "4px 10px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              width: "80%",
            }}
          >
            ✏️ Replace
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            style={{
              background: "#1c0909",
              border: "1px solid #f87171",
              color: "#f87171",
              padding: "4px 10px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              width: "80%",
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}

function PostShipmentForm({ onClose }) {
  const { mutate: postShipment, isPending } = usePostShipment();
  const [form, setForm] = useState({
    pickup_location: "",
    drop_location: "",
    distance_km: "",
    load_type: "",
    weight_kg: "",
    base_price: "",
    min_bid_price: "",
    bidding_deadline: "",
  });
  const [createdId, setCreatedId] = useState(null);
  const [formError, setFormError] = useState(null);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = () => {
    if (!form.pickup_location || !form.drop_location) {
      setFormError("Pickup and drop location required.");
      return;
    }
    setFormError(null);
    postShipment(form, {
      onSuccess: (data) => setCreatedId(data?.data?.id ?? data?.id ?? null),
      onError: (err) => setFormError(err.message),
    });
  };

  if (createdId)
    return (
      <Card style={{ marginBottom: 4 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#052e16",
              border: "1px solid #22543d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>
              Shipment posted!
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>
              Add up to 4 images (optional)
            </div>
          </div>
        </div>
        <ShipmentImageUploader shipmentId={createdId} />
        <div style={{ marginTop: 16 }}>
          <Button onClick={onClose}>Done</Button>
        </div>
      </Card>
    );

  return (
    <Card style={{ marginBottom: 4 }}>
      <SectionHeader title="New Shipment" />
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Route</label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            name="pickup_location"
            placeholder="Pickup location"
            value={form.pickup_location}
            onChange={handle}
            style={inputStyle}
          />
          <div style={{ color: COLORS.textDim, fontWeight: 700, fontSize: 16 }}>
            →
          </div>
          <input
            name="drop_location"
            placeholder="Drop location"
            value={form.drop_location}
            onChange={handle}
            style={inputStyle}
          />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Shipment Details</label>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <input
            name="load_type"
            placeholder="Load type e.g. General"
            value={form.load_type}
            onChange={handle}
            style={inputStyle}
          />
          <input
            name="weight_kg"
            placeholder="Weight (kg)"
            value={form.weight_kg}
            onChange={handle}
            style={inputStyle}
            type="number"
          />
          <input
            name="distance_km"
            placeholder="Distance (km)"
            value={form.distance_km}
            onChange={handle}
            style={inputStyle}
            type="number"
          />
          <input
            name="base_price"
            placeholder="Base price (₹)"
            value={form.base_price}
            onChange={handle}
            style={inputStyle}
            type="number"
          />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Bidding</label>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <input
            name="min_bid_price"
            placeholder="Min bid (₹)"
            value={form.min_bid_price}
            onChange={handle}
            style={inputStyle}
            type="number"
          />
          <input
            name="bidding_deadline"
            placeholder="Bid deadline"
            value={form.bidding_deadline}
            onChange={handle}
            style={inputStyle}
            type="datetime-local"
          />
        </div>
      </div>
      {formError && (
        <div style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}>
          {formError}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={submit} style={{ opacity: isPending ? 0.6 : 1 }}>
          {isPending ? "Posting…" : "Post Shipment & Add Images →"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

const labelStyle = {
  fontSize: 11,
  color: COLORS.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: 8,
};
const inputStyle = {
  width: "100%",
  background: "#0a0a0a",
  border: `1px solid ${COLORS.borderHi}`,
  color: COLORS.textPrimary,
  padding: "9px 14px",
  borderRadius: 8,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

function TrackingDialog({ shipment: s, onClose }) {
  const { data: location } = useLiveLocation(s.id);
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
        zIndex: 500,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px,3vw,24px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0e0e0e",
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1px solid ${COLORS.borderMid}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.textPrimary,
                marginBottom: 4,
              }}
            >
              Live Tracking
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LocationPill label={s.pickup} type="pickup" />
              <span style={{ color: COLORS.textDim }}>→</span>
              <LocationPill label={s.drop} type="drop" />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: COLORS.textMuted,
              width: 34,
              height: 34,
              borderRadius: "50%",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflow: "hidden", padding: 16 }}>
          <LiveMap
            lat={location?.lat ? parseFloat(location.lat) : null}
            lng={location?.lng ? parseFloat(location.lng) : null}
            pickup={s.pickup}
            drop={s.drop}
            updatedAt={location?.updated_at}
            height={380}
          />
          {location && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                background: "#111",
                borderRadius: 8,
                fontSize: 11,
                color: COLORS.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>📍</span>
              <span>
                Last updated:{" "}
                <span style={{ color: COLORS.textSecondary }}>
                  {new Date(location.updated_at).toLocaleTimeString("en-IN")}
                </span>
              </span>
              <span style={{ marginLeft: "auto", fontFamily: "monospace" }}>
                {parseFloat(location.lat).toFixed(5)},{" "}
                {parseFloat(location.lng).toFixed(5)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MaterialLoadedBtn({ shipmentId }) {
  const axios = useAxios();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const notify = async () => {
    setLoading(true);
    try {
      await axios.post(`/shipments/${shipmentId}/notify`, {
        message: "Material is loaded and ready. Please start your journey.",
      });
      setSent(true);
    } catch (e) {
      console.error("Notify failed:", e.message);
    } finally {
      setLoading(false);
    }
  };
  if (sent)
    return (
      <div
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 12,
          color: "#4ade80",
          padding: "7px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
      >
        ✓ Driver notified
      </div>
    );
  return (
    <Button
      size="sm"
      style={{ flex: 1, justifyContent: "center", opacity: loading ? 0.6 : 1 }}
      onClick={notify}
    >
      {loading ? "Notifying…" : "✓ Material Loaded"}
    </Button>
  );
}

function VerificationBadge({ status, size = "sm" }) {
  const cfg = {
    verified: {
      bg: "#0a1a0a",
      border: "#22543d",
      color: "#4ade80",
      icon: "✓",
      label: "Verified",
    },
    pending: {
      bg: "#1a1500",
      border: "#4a3a00",
      color: "#fbbf24",
      icon: "⏳",
      label: "Pending",
    },
    rejected: {
      bg: "#1c0909",
      border: "#4a1a1a",
      color: "#f87171",
      icon: "✕",
      label: "Rejected",
    },
    unverified: {
      bg: "#111",
      border: "#333",
      color: "#6b7280",
      icon: "?",
      label: "Unverified",
    },
  };
  const c = cfg[status] ?? cfg.unverified;
  const sm = size === "sm";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: sm ? 10 : 12,
        fontWeight: 700,
        padding: sm ? "2px 8px" : "4px 12px",
        borderRadius: 4,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: sm ? 9 : 11 }}>{c.icon}</span>
      {c.label}
    </span>
  );
}
