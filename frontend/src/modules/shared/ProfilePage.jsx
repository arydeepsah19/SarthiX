import { useState, useRef } from "react";
import Card from "../../components/ui/Card.jsx";
import SectionHeader from "../../components/ui/SectionHeader.jsx";
import { InputField, SelectField } from "../../components/ui/InputField.jsx";
import Button from "../../components/ui/Button.jsx";
import { COLORS, FONTS } from "../../components/ui/tokens.js";
import { IEdit } from "../../components/ui/Icons.jsx";
import { useUser } from "@clerk/clerk-react";
import { useVehicles } from "../../hooks/useVehicles.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import { useAvatarUpload } from "../../hooks/useAvatarUpload.js";
import {
  useSubmitVerification,
  uploadVerificationDoc,
} from "../../hooks/useVerification.js";
import TruckAvatar from "../../components/ui/TruckAvatar.jsx";


// Driver gets an extra "Verification" tab; company does not
const DRIVER_TABS = [
  "Profile Info",
  "Verification",
  "Password & Security",
  "Payment Settings",
  "Notifications",
];
const COMPANY_TABS = [
  "Profile Info",
  "Password & Security",
  "Payment Settings",
  "Notifications",
];

export default function ProfilePage({ role }) {
  const { user, isLoaded } = useUser();
  const { data: dbUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState(0);
  const { data: vehicles = [] } = useVehicles();

  if (!isLoaded || !user)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 0",
          color: COLORS.textMuted,
          fontSize: 13,
        }}
      >
        Loading profile…
      </div>
    );

  const TABS = role === "driver" ? DRIVER_TABS : COMPANY_TABS;
  const name = user.fullName ?? user.firstName ?? "Unknown";
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const phone = user.primaryPhoneNumber?.phoneNumber ?? "";
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "–";
  const plan =
    user.publicMetadata?.plan ??
    (role === "company" ? "ENTERPRISE" : "PREMIUM");
  const address = user.publicMetadata?.address ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const avatarUrl = dbUser?.avatar_url ?? null;

  return (
    <>
      {/* ── Profile header card ── */}
      <Card padding="28px 28px">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <AvatarUploader
            avatarUrl={avatarUrl}
            initials={initials}
            userId={dbUser?.id ?? user.id}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                  fontFamily: FONTS.display,
                  letterSpacing: "0.05em",
                }}
              >
                {name}
              </div>
              {/* Verification badge in header */}
              {role === "driver" && dbUser && (
                <VerificationBadge
                  status={dbUser.verification_status}
                  size="md"
                />
              )}
            </div>
            <div
              style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 3 }}
            >
              {email}
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <PlanBadge plan={plan} />
              <span
                style={{
                  background: "#1a1a1a",
                  color: COLORS.textDim,
                  padding: "3px 12px",
                  borderRadius: 4,
                  fontSize: 11,
                }}
              >
                Since {memberSince}
              </span>
            </div>
          </div>
          <Button icon={<IEdit size={14} />}>Edit Profile</Button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 24,
            borderBottom: `1px solid ${COLORS.borderMid}`,
            overflowX: "auto",
          }}
        >
          {TABS.map((t, i) => (
            <div
              key={t}
              onClick={() => setActiveTab(i)}
              style={{
                fontSize: 13,
                fontWeight: i === activeTab ? 700 : 400,
                color: i === activeTab ? COLORS.orange : COLORS.textMuted,
                paddingBottom: 10,
                cursor: "pointer",
                whiteSpace: "nowrap",
                borderBottom:
                  i === activeTab
                    ? `2px solid ${COLORS.orange}`
                    : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t}
              {/* Dot indicator on Verification tab when pending */}
              {t === "Verification" &&
                dbUser?.verification_status === "pending" && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#fbbf24",
                      display: "inline-block",
                    }}
                  />
                )}
              {t === "Verification" &&
                dbUser?.verification_status === "unverified" && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f87171",
                      display: "inline-block",
                    }}
                  />
                )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Tab content ── */}
      {TABS[activeTab] === "Profile Info" && (
        <Card>
          <SectionHeader title="Profile Information" />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: COLORS.textMuted,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Full Name
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {name.split(" ").map((n, i) => (
                    <InputField key={i} defaultValue={n} style={{ flex: 1 }} />
                  ))}
                </div>
              </div>
              <InputField label="Email Address" defaultValue={email} />
              {role === "driver" && vehicles.length > 0 && (
                <SelectField
                  label="Primary Vehicle"
                  options={vehicles.map((v) => v.reg)}
                  defaultValue={vehicles[0]?.reg}
                  accentColor={COLORS.orange}
                />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InputField label="Phone Number" defaultValue={phone} />
              <InputField label="Address" defaultValue={address} />
              <div
                style={{
                  background: COLORS.bgInput,
                  border: `1px solid ${COLORS.borderHi}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.textMuted,
                    marginBottom: 5,
                  }}
                >
                  Account Plan
                </div>
                <div
                  style={{
                    color: COLORS.orange,
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: "0.08em",
                  }}
                >
                  {plan}
                </div>
                <div
                  style={{ fontSize: 12, color: COLORS.textDim, marginTop: 6 }}
                >
                  Member since {memberSince}
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 24,
            }}
          >
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>
      )}

      {/* ── Verification tab (driver only) ── */}
      {TABS[activeTab] === "Verification" && role === "driver" && (
        <VerificationTab dbUser={dbUser} />
      )}

      {/* ── Other tabs ── */}
      {TABS[activeTab] !== "Profile Info" &&
        TABS[activeTab] !== "Verification" && (
          <Card>
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: COLORS.textMuted,
                fontSize: 13,
              }}
            >
              This section connects to Clerk's account management.
            </div>
          </Card>
        )}
    </>
  );
}

// ── Verification tab ──────────────────────────────────────────────────────────
function VerificationTab({ dbUser }) {
  const {
    mutate: submit,
    isPending,
    isError,
    error,
    isSuccess,
  } = useSubmitVerification();

  const [aadhaar, setAadhaar] = useState(dbUser?.aadhaar_number ?? "");
  const [license, setLicense] = useState(dbUser?.license_number ?? "");
  const [docUrl, setDocUrl] = useState(dbUser?.verification_doc_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);
  const fileRef = useRef(null);

  const status = dbUser?.verification_status ?? "unverified";
  const isVerified = status === "verified";
  const isPending_ = status === "pending";
  const isRejected = status === "rejected";

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const url = await uploadVerificationDoc(file, dbUser?.id);
      setDocUrl(url);
    } catch (err) {
      setUploadErr(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!docUrl) return;
    submit({
      aadhaar_number: aadhaar,
      license_number: license,
      verification_doc_url: docUrl,
    });
  };

  return (
    <Card>
      <SectionHeader title="Identity Verification" />

      {/* ── Status banner ── */}
      <StatusBanner
        status={status}
        submittedAt={dbUser?.verification_submitted_at}
      />

      {/* ── Form — only shown when unverified or rejected ── */}
      {!isVerified && !isPending_ && (
        <div style={{ marginTop: 24 }}>
          <p
            style={{
              fontSize: 13,
              color: COLORS.textMuted,
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            Upload any one government-issued ID along with a clear photo of the
            document. Your details are only visible to admins and are never
            shared with shippers.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* Aadhaar */}
            <div>
              <label style={labelStyle}>Aadhaar Number</label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                value={aadhaar}
                onChange={(e) =>
                  setAadhaar(e.target.value.replace(/[^0-9 ]/g, ""))
                }
                style={inputStyle}
              />
            </div>

            {/* License */}
            <div>
              <label style={labelStyle}>Driving License Number</label>
              <input
                type="text"
                placeholder="e.g. PB0320230012345"
                value={license}
                onChange={(e) => setLicense(e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Doc upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Document Photo</label>
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              style={{
                border: `2px dashed ${docUrl ? COLORS.orange : COLORS.borderHi}`,
                borderRadius: 10,
                padding: "24px 20px",
                textAlign: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                background: docUrl ? "#1a0f00" : "#0a0a0a",
                transition: "all 0.2s",
              }}
            >
              {uploading ? (
                <div style={{ color: COLORS.textMuted, fontSize: 13 }}>
                  Uploading…
                </div>
              ) : docUrl ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <img
                    src={docUrl}
                    alt="Document preview"
                    style={{
                      maxHeight: 120,
                      maxWidth: "100%",
                      borderRadius: 6,
                      objectFit: "contain",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: COLORS.orange,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Document uploaded — click to replace
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 32, opacity: 0.4 }}>📄</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                    Click to upload Aadhaar / License photo
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textDim }}>
                    JPG, PNG or PDF · Max 5 MB
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {uploadErr && (
              <div style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>
                {uploadErr}
              </div>
            )}
          </div>

          {isError && (
            <div style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>
              {error?.message ?? "Submission failed. Please try again."}
            </div>
          )}

          {isSuccess && (
            <div style={{ color: "#4ade80", fontSize: 12, marginBottom: 12 }}>
              ✓ Submitted! We'll review your documents shortly.
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 8,
            }}
          >
            <Button
              variant="primary"
              onClick={handleSubmit}
              style={{ opacity: isPending || uploading || !docUrl ? 0.6 : 1 }}
            >
              {isPending
                ? "Submitting…"
                : isRejected
                  ? "Resubmit Documents"
                  : "Submit for Verification"}
            </Button>
          </div>
        </div>
      )}

      {/* Pending — show what was submitted, read-only */}
      {isPending_ && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
              opacity: 0.7,
            }}
          >
            <ReadOnlyField
              label="Aadhaar Number"
              value={dbUser?.aadhaar_number || "—"}
            />
            <ReadOnlyField
              label="License Number"
              value={dbUser?.license_number || "—"}
            />
          </div>
          {dbUser?.verification_doc_url && (
            <div>
              <label style={labelStyle}>Submitted Document</label>
              <img
                src={dbUser.verification_doc_url}
                alt="Submitted document"
                style={{
                  maxHeight: 160,
                  maxWidth: "100%",
                  borderRadius: 8,
                  objectFit: "contain",
                  border: `1px solid ${COLORS.borderMid}`,
                }}
              />
            </div>
          )}
          <p
            style={{
              fontSize: 12,
              color: COLORS.textDim,
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            Your documents are under review. You'll be able to place bids as
            soon as an admin approves your profile. This usually takes 1–2
            business days.
          </p>
        </div>
      )}
    </Card>
  );
}

// ── Status banner ─────────────────────────────────────────────────────────────
function StatusBanner({ status, submittedAt }) {
  const config = {
    unverified: {
      bg: "#1c0909",
      border: "#4a1a1a",
      color: "#f87171",
      icon: "⚠️",
      title: "Not Verified",
      desc: "Your account is unverified. Submit your documents to get verified and build trust with shippers.",
    },
    pending: {
      bg: "#1a1500",
      border: "#4a3a00",
      color: "#fbbf24",
      icon: "🕐",
      title: "Under Review",
      desc: submittedAt
        ? `Submitted on ${new Date(submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}. Usually reviewed within 1–2 business days.`
        : "Your documents are being reviewed by our team.",
    },
    verified: {
      bg: "#0a1a0a",
      border: "#1a4a1a",
      color: "#4ade80",
      icon: "✅",
      title: "Verified Driver",
      desc: "Your identity has been verified. Shippers can see your verified badge on all your bids.",
    },
    rejected: {
      bg: "#1c0909",
      border: "#4a1a1a",
      color: "#f87171",
      icon: "❌",
      title: "Verification Rejected",
      desc: "Your documents could not be verified. Please re-upload clear, valid documents.",
    },
  };

  const c = config[status] ?? config.unverified;

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{c.icon}</div>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: c.color,
            marginBottom: 4,
          }}
        >
          {c.title}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
          {c.desc}
        </div>
      </div>
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        <VerificationBadge status={status} size="sm" />
      </div>
    </div>
  );
}

// ── Verification badge — used here AND exported for BidCard ──────────────────
export function VerificationBadge({ status, size = "sm" }) {
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div
        style={{
          ...inputStyle,
          color: COLORS.textSecondary,
          cursor: "default",
          userSelect: "text",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 11,
  color: COLORS.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: 7,
};

const inputStyle = {
  width: "100%",
  background: "#0a0a0a",
  border: `1px solid ${COLORS.borderHi}`,
  color: COLORS.textPrimary,
  padding: "10px 14px",
  borderRadius: 8,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

// ── Avatar uploader (unchanged) ───────────────────────────────────────────────
function AvatarUploader({ avatarUrl, initials, userId }) {
  const { mutate: uploadAvatar, isPending, isError, error } = useAvatarUpload();
  const [preview, setPreview] = useState(null);
  const [hovered, setHovered] = useState(false);
  const fileRef = useRef(null);
  const displayUrl = preview ?? avatarUrl ?? null;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    uploadAvatar({ file, userId }, { onError: () => setPreview(null) });
    e.target.value = "";
  };

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => fileRef.current?.click()}
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <TruckAvatar
          seed={userId}
          size={90}
          avatarUrl={displayUrl}
          style={{
            border: `3px solid ${COLORS.orange}`,
            boxShadow: `0 0 24px ${COLORS.orangeGlow}`,
          }}
        />
        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {isPending ? (
              <div style={{ color: "#fff", fontSize: 10 }}>Uploading…</div>
            ) : (
              <>
                <div style={{ fontSize: 18 }}>📷</div>
                <div style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>
                  {displayUrl ? "Change" : "Upload photo"}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      {isPending && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: COLORS.orange,
            border: `2px solid ${COLORS.bg}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
          }}
        >
          ⏳
        </div>
      )}
      {!displayUrl && !isPending && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: COLORS.orange,
            border: `2px solid ${COLORS.bg}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            cursor: "pointer",
          }}
          onClick={() => fileRef.current?.click()}
        >
          📷
        </div>
      )}
      {isError && (
        <div
          style={{
            position: "absolute",
            bottom: -28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1c0909",
            border: "1px solid #f87171",
            color: "#f87171",
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 4,
            whiteSpace: "nowrap",
          }}
        >
          {error?.message ?? "Upload failed"}
        </div>
      )}
    </div>
  );
}

function PlanBadge({ plan }) {
  const isEnterprise = plan === "ENTERPRISE";
  return (
    <span
      style={{
        background: isEnterprise ? "#1a2a3a" : "#7c2d12",
        color: isEnterprise ? "#60a5fa" : "#fb923c",
        padding: "3px 12px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
      }}
    >
      {plan}
    </span>
  );
}
