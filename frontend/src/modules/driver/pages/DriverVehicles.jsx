import { useState, useRef } from "react";
import Card from "../../../components/ui/Card.jsx";
import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import { COLORS, FONTS } from "../../../components/ui/tokens.js";
import { ITruck } from "../../../components/ui/Icons.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import {
  useVehicles,
  useAddVehicle,
  useDeleteVehicle,
  useEditVehicle,
  useUpdatePhone,
  uploadVehicleDocument,
} from "../../../hooks/useVehicles.js";
import { useUser } from "@clerk/clerk-react";

export default function DriverVehicles() {
  const {
    data: vehicles = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useVehicles();
  const { mutate: addVehicle, isPending: adding } = useAddVehicle();
  const { mutate: deleteVehicle, isPending: deleting } = useDeleteVehicle();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  if (isLoading) return <DashboardSkeleton cards={2} rows={0} />;

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
          Failed to load vehicles
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

  return (
    <>
      <SectionHeader
        title="My Vehicles"
        action="Add Vehicle"
        onAction={() => {
          setShowForm(true);
          setEditingId(null);
        }}
      />

      {showForm && (
        <VehicleForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) =>
            addVehicle(data, { onSuccess: () => setShowForm(false) })
          }
          isPending={adding}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {vehicles.map((v) =>
          editingId === v.id ? (
            <VehicleEditCard
              key={v.id}
              vehicle={v}
              onClose={() => setEditingId(null)}
            />
          ) : (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={() => setEditingId(v.id)}
              onDelete={() => deleteVehicle(v.id)}
              deleting={deleting}
            />
          ),
        )}
        <AddVehiclePlaceholder onClick={() => setShowForm(true)} />
      </div>
    </>
  );
}

// ── Vehicle card ──────────────────────────────────────────────────────────────
function VehicleCard({ vehicle: v, onEdit, onDelete, deleting }) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            color: COLORS.orange,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ITruck size={18} />
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              letterSpacing: "0.08em",
            }}
          >
            {v.reg}
          </span>
        </div>
        <Badge status={v.status} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 14,
        }}
      >
        <InfoRow label="Type" value={v.type || "–"} />
        <InfoRow label="Capacity" value={v.capacity || "–"} />
      </div>

      {/* Document badge */}
      {v.documentUrl ? (
        <a
          href={v.documentUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "#60a5fa",
            background: "#1a1a2a",
            border: "1px solid #1e3a5f",
            borderRadius: 6,
            padding: "5px 10px",
            marginBottom: 14,
            textDecoration: "none",
          }}
        >
          <DocIcon />
          View document
        </a>
      ) : (
        <div
          style={{
            fontSize: 12,
            color: COLORS.textDim,
            marginBottom: 14,
            padding: "5px 0",
          }}
        >
          No document uploaded
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="ghost"
          style={{ flex: 1, justifyContent: "center" }}
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          style={{ flex: 1, justifyContent: "center" }}
          onClick={onDelete}
        >
          {deleting ? "Removing…" : "Remove"}
        </Button>
      </div>
    </Card>
  );
}

// ── Add vehicle form ──────────────────────────────────────────────────────────
function VehicleForm({ onClose, onSubmit, isPending }) {
  const { user } = useUser();
  const { mutate: updatePhone } = useUpdatePhone();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    vehicle_number: "", // ← matches table column
    vehicle_type: "",
    capacity_kg: "", // ← matches table column
  });
  const [phone, setPhone] = useState(
    user?.primaryPhoneNumber?.phoneNumber ?? "",
  );
  const [docFile, setDocFile] = useState(null); // File object
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setUploadError("Only PDF, DOC, DOCX files are allowed.");
      return;
    }
    setUploadError(null);
    setDocFile(file);
  };

  const submit = async () => {
    if (!form.vehicle_number) return;
    setUploading(true);
    setUploadError(null);

    try {
      let document_url = null;

      // Upload document first if selected
      if (docFile) {
        document_url = await uploadVehicleDocument(
          docFile,
          form.vehicle_number,
        );
      }

      // Save phone number to users table if changed
      if (phone && phone !== (user?.primaryPhoneNumber?.phoneNumber ?? "")) {
        updatePhone(phone);
      }

      onSubmit({ ...form, document_url });
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card style={{ marginBottom: 14 }}>
      <SectionHeader title="New Vehicle" />

      {/* Vehicle fields */}
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
            name: "vehicle_number",
            placeholder: "Vehicle No. e.g. MH12AB1234",
          },
          { name: "vehicle_type", placeholder: "Vehicle Type e.g. Truck" },
          { name: "capacity_kg", placeholder: "Capacity e.g. 10000 (kg)" },
        ].map(({ name, placeholder }) => (
          <input
            key={name}
            name={name}
            placeholder={placeholder}
            value={form[name]}
            onChange={handle}
            style={inputStyle}
          />
        ))}

        {/* Phone number — saves to users table */}
        <input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
          type="tel"
        />
      </div>

      {/* Document upload */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Vehicle Document (PDF / DOC / DOCX)</label>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `1px dashed ${docFile ? "#60a5fa" : COLORS.borderHi}`,
            borderRadius: 8,
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: docFile ? "#1a1a2a" : "transparent",
            transition: "all 0.15s",
          }}
        >
          <DocIcon color={docFile ? "#60a5fa" : COLORS.textDim} />
          <div>
            <div
              style={{
                fontSize: 13,
                color: docFile ? "#60a5fa" : COLORS.textMuted,
              }}
            >
              {docFile ? docFile.name : "Click to upload document"}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>
              PDF, DOC, DOCX · Max 10MB
            </div>
          </div>
          {docFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDocFile(null);
              }}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: COLORS.textDim,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {uploadError && (
          <div style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
            {uploadError}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Button
          onClick={submit}
          style={{ opacity: isPending || uploading ? 0.6 : 1 }}
        >
          {uploading ? "Uploading…" : isPending ? "Saving…" : "Add Vehicle"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

// ── Edit vehicle form ─────────────────────────────────────────────────────────
function VehicleEditCard({ vehicle, onClose }) {
  const { mutate: editVehicle, isPending } = useEditVehicle();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    vehicle_number: vehicle.reg,
    vehicle_type: vehicle.type,
    capacity_kg: vehicle.capacity,
  });
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setUploadError("Only PDF, DOC, DOCX allowed.");
      return;
    }
    setUploadError(null);
    setDocFile(file);
  };

  const submit = async () => {
    setUploading(true);
    setUploadError(null);
    try {
      let document_url = vehicle.documentUrl; // keep existing if no new file
      if (docFile) {
        document_url = await uploadVehicleDocument(docFile, vehicle.id);
      }
      editVehicle(
        { id: vehicle.id, ...form, document_url },
        { onSuccess: onClose },
      );
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { name: "vehicle_number", placeholder: "Vehicle No." },
          { name: "vehicle_type", placeholder: "Vehicle Type" },
          { name: "capacity_kg", placeholder: "Capacity (kg)" },
        ].map(({ name, placeholder }) => (
          <input
            key={name}
            name={name}
            placeholder={placeholder}
            value={form[name]}
            onChange={handle}
            style={inputStyle}
          />
        ))}

        {/* Document upload */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1px dashed ${docFile ? "#60a5fa" : COLORS.borderHi}`,
              borderRadius: 8,
              padding: "10px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: docFile ? "#1a1a2a" : "transparent",
            }}
          >
            <DocIcon color={docFile ? "#60a5fa" : COLORS.textDim} />
            <span
              style={{
                fontSize: 12,
                color: docFile ? "#60a5fa" : COLORS.textMuted,
              }}
            >
              {docFile
                ? docFile.name
                : vehicle.documentUrl
                  ? "Replace document"
                  : "Upload document"}
            </span>
          </div>
          {vehicle.documentUrl && !docFile && (
            <a
              href={vehicle.documentUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#60a5fa",
                marginTop: 4,
                textDecoration: "none",
              }}
            >
              <DocIcon size={12} /> View current document
            </a>
          )}
          {uploadError && (
            <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>
              {uploadError}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Button
            style={{ flex: 1, justifyContent: "center" }}
            onClick={submit}
          >
            {uploading ? "Uploading…" : isPending ? "Saving…" : "Save"}
          </Button>
          <Button
            variant="ghost"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
    >
      <span style={{ color: COLORS.textMuted }}>{label}</span>
      <span style={{ color: COLORS.textSecondary }}>{value}</span>
    </div>
  );
}

function AddVehiclePlaceholder({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `1px dashed ${COLORS.borderHi}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        minHeight: 160,
        cursor: "pointer",
        color: COLORS.textDim,
      }}
    >
      <div style={{ fontSize: 28, color: COLORS.borderHi }}>+</div>
      <span style={{ fontSize: 13 }}>Add new vehicle</span>
    </div>
  );
}

function DocIcon({ color = "#60a5fa", size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
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
