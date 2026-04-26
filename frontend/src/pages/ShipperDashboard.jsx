import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Bell,
  LogOut,
  Plus,
  Package,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Weight,
  ChevronRight,
  Star,
  X,
  Menu,
  TrendingUp,
  Filter,
  Search,
  AlertCircle,
  Eye,
} from "lucide-react";

// ── Mock Data (replace with Supabase calls) ───────────────────────────────
const MOCK_STATS = {
  totalShipments: 34,
  activeShipments: 5,
  completedShipments: 29,
  totalSpent: 845000,
};

const MOCK_SHIPMENTS = [
  {
    id: 1,
    loadType: "Electronics",
    weightKg: 1200,
    pickupLocation: "Delhi",
    dropLocation: "Mumbai",
    distanceKm: 1415,
    minBidPrice: 18000,
    basePrice: 22000,
    biddingDeadline: "2026-03-16T18:00:00",
    status: "bidding",
    assignedDriver: null,
    bids: [
      {
        id: 1,
        driverName: "Rajesh Kumar",
        bidPrice: 19500,
        etaHours: 36,
        rating: 4.7,
      },
      {
        id: 2,
        driverName: "Amit Singh",
        bidPrice: 21000,
        etaHours: 30,
        rating: 4.9,
      },
      {
        id: 3,
        driverName: "Suresh Patel",
        bidPrice: 18800,
        etaHours: 40,
        rating: 4.5,
      },
    ],
  },
  {
    id: 2,
    loadType: "Textile",
    weightKg: 3400,
    pickupLocation: "Surat",
    dropLocation: "Kolkata",
    distanceKm: 1960,
    minBidPrice: 25000,
    basePrice: 30000,
    biddingDeadline: "2026-03-15T12:00:00",
    status: "assigned",
    assignedDriver: {
      name: "Vikram Mehta",
      rating: 4.8,
      phone: "+91 98765 43210",
    },
    bids: [],
  },
  {
    id: 3,
    loadType: "FMCG",
    weightKg: 800,
    pickupLocation: "Pune",
    dropLocation: "Hyderabad",
    distanceKm: 560,
    minBidPrice: 9000,
    basePrice: 12000,
    biddingDeadline: "2026-03-10T09:00:00",
    status: "completed",
    assignedDriver: {
      name: "Deepak Yadav",
      rating: 4.6,
      phone: "+91 91234 56789",
    },
    bids: [],
    rated: true,
  },
  {
    id: 4,
    loadType: "Auto Parts",
    weightKg: 5000,
    pickupLocation: "Chennai",
    dropLocation: "Bangalore",
    distanceKm: 346,
    minBidPrice: 7500,
    basePrice: 10000,
    biddingDeadline: "2026-03-18T15:00:00",
    status: "bidding",
    assignedDriver: null,
    bids: [
      {
        id: 4,
        driverName: "Manoj Tiwari",
        bidPrice: 8200,
        etaHours: 14,
        rating: 4.3,
      },
      {
        id: 5,
        driverName: "Ravi Sharma",
        bidPrice: 9000,
        etaHours: 12,
        rating: 4.8,
      },
    ],
  },
  {
    id: 5,
    loadType: "Pharma",
    weightKg: 600,
    pickupLocation: "Ahmedabad",
    dropLocation: "Delhi",
    distanceKm: 950,
    minBidPrice: 14000,
    basePrice: 17000,
    biddingDeadline: "2026-03-20T10:00:00",
    status: "open",
    assignedDriver: null,
    bids: [],
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "3 new bids received on Delhi → Mumbai Electronics shipment.",
    isRead: false,
    createdAt: "2026-03-14T10:30:00",
    type: "bid",
  },
  {
    id: 2,
    message: "Vikram Mehta has been assigned to Surat → Kolkata shipment.",
    isRead: false,
    createdAt: "2026-03-13T15:00:00",
    type: "assigned",
  },
  {
    id: 3,
    message: "FMCG shipment Pune → Hyderabad marked as completed.",
    isRead: true,
    createdAt: "2026-03-12T11:00:00",
    type: "completed",
  },
];
// ─────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: { label: "Open", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  bidding: { label: "Bidding", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  assigned: {
    label: "Assigned",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  completed: {
    label: "Completed",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
};

const formatCurrency = (n) => "₹" + n.toLocaleString("en-IN");
const formatDeadline = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const EMPTY_FORM = {
  loadType: "",
  weightKg: "",
  pickupLocation: "",
  dropLocation: "",
  distanceKm: "",
  minBidPrice: "",
  basePrice: "",
  biddingDeadline: "",
};

export default function ShipperDashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("shipments");
  const [shipments, setShipments] = useState(MOCK_SHIPMENTS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Modals
  const [postModal, setPostModal] = useState(false);
  const [bidsModal, setBidsModal] = useState(null); // shipment to view bids
  const [rateModal, setRateModal] = useState(null); // shipment to rate
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredShipments = shipments.filter((s) => {
    const matchStatus = filter === "all" || s.status === filter;
    const matchSearch =
      s.loadType.toLowerCase().includes(search.toLowerCase()) ||
      s.pickupLocation.toLowerCase().includes(search.toLowerCase()) ||
      s.dropLocation.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handlePostShipment = () => {
    if (
      !form.loadType ||
      !form.pickupLocation ||
      !form.dropLocation ||
      !form.minBidPrice
    ) {
      setFormError("Please fill all required fields.");
      return;
    }
    const newShipment = {
      id: Date.now(),
      ...form,
      weightKg: parseInt(form.weightKg) || 0,
      distanceKm: parseInt(form.distanceKm) || 0,
      minBidPrice: parseInt(form.minBidPrice) || 0,
      basePrice: parseInt(form.basePrice) || 0,
      status: "open",
      assignedDriver: null,
      bids: [],
    };
    setShipments((prev) => [newShipment, ...prev]);
    setPostModal(false);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleSelectDriver = (shipmentId, bid) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              status: "assigned",
              assignedDriver: {
                name: bid.driverName,
                rating: bid.rating,
                phone: "+91 99999 00000",
              },
            }
          : s,
      ),
    );
    setBidsModal(null);
  };

  const handleRateSubmit = () => {
    setShipments((prev) =>
      prev.map((s) => (s.id === rateModal.id ? { ...s, rated: true } : s)),
    );
    setRateModal(null);
    setRating(0);
    setRatingComment("");
  };

  const tabs = [
    { id: "shipments", label: "My Shipments", icon: Package },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  const filters = ["all", "open", "bidding", "assigned", "completed"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --orange: #f97316; --orange-dim: rgba(249,115,22,0.12);
          --dark: #0a0a14; --surface: #111120; --card: #16162a;
          --border: rgba(249,115,22,0.12); --border-dim: rgba(255,255,255,0.06);
          --text: #e8e8f0; --muted: #6b6b8a;
          --green: #22c55e; --red: #ef4444; --blue: #3b82f6;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          min-height: 100vh; background: var(--dark);
          font-family: 'DM Sans', sans-serif; color: var(--text);
          display: flex;
        }
        .db-root::before {
          content: ''; position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
          background-size: 56px 56px; pointer-events: none;
        }

        /* Sidebar */
        .db-sidebar {
          width: 240px; flex-shrink: 0; background: var(--surface);
          border-right: 1px solid var(--border-dim);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          transition: transform 0.3s ease;
        }
        .db-sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 24px 20px; border-bottom: 1px solid var(--border-dim);
          font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
          letter-spacing: 0.12em; color: #fff; text-decoration: none;
        }
        .db-logo-icon {
          width: 32px; height: 32px; background: var(--orange);
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
        }
        .db-sidebar-logo span { color: var(--orange); }

        .db-sidebar-user {
          padding: 16px 20px; border-bottom: 1px solid var(--border-dim);
        }
        .db-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(59,130,246,0.15); border: 2px solid var(--blue);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem; color: var(--blue); margin-bottom: 8px;
        }
        .db-username { font-size: 0.85rem; font-weight: 600; color: var(--text); }
        .db-role { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); margin-top: 2px; }

        .db-sidebar-nav { flex: 1; padding: 12px 0; }
        .db-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 20px; cursor: pointer; font-size: 0.82rem;
          letter-spacing: 0.05em; color: var(--muted);
          border-left: 2px solid transparent; transition: all 0.18s;
        }
        .db-nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
        .db-nav-item.active { color: var(--orange); border-left-color: var(--orange); background: var(--orange-dim); }

        .db-post-btn {
          margin: 12px 16px; background: var(--orange); border: none; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; padding: 12px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
          transition: background 0.18s;
        }
        .db-post-btn:hover { background: #fb923c; }

        .db-sidebar-bottom { padding: 16px 20px; border-top: 1px solid var(--border-dim); }
        .db-signout {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.78rem; color: var(--muted); cursor: pointer;
          padding: 8px 0; background: none; border: none;
          transition: color 0.18s; font-family: 'DM Sans', sans-serif;
        }
        .db-signout:hover { color: var(--red); }

        /* Main */
        .db-main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; position: relative; z-index: 1; }

        /* Topbar */
        .db-topbar {
          position: sticky; top: 0; z-index: 40;
          background: rgba(10,10,20,0.88); backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-dim);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 64px;
        }
        .db-topbar-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 0.1em; }
        .db-topbar-right { display: flex; align-items: center; gap: 12px; }
        .db-notif-btn {
          position: relative; background: none; border: none;
          color: var(--muted); cursor: pointer; padding: 6px; display: flex; transition: color 0.18s;
        }
        .db-notif-btn:hover { color: var(--text); }
        .db-notif-badge {
          position: absolute; top: 2px; right: 2px; width: 16px; height: 16px;
          border-radius: 50%; background: var(--orange); color: #fff;
          font-size: 0.55rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
        }
        .db-hamburger { display: none; background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; }

        /* Notification drawer */
        .db-notif-drawer {
          position: fixed; top: 64px; right: 0; bottom: 0; width: 340px;
          background: var(--surface); border-left: 1px solid var(--border-dim);
          z-index: 100; overflow-y: auto;
          transform: translateX(100%);
          transition: transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .db-notif-drawer.open { transform: translateX(0); }
        .db-notif-hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border-dim);
          position: sticky; top: 0; background: var(--surface); z-index: 1;
        }
        .db-notif-hdr h3 { font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; }
        .db-notif-mark { background: none; border: none; color: var(--orange); font-size: 0.72rem; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-notif-item { padding: 14px 20px; border-bottom: 1px solid var(--border-dim); display: flex; gap: 12px; transition: background 0.18s; }
        .db-notif-item:hover { background: rgba(255,255,255,0.02); }
        .db-notif-item.unread { background: rgba(249,115,22,0.04); }
        .db-notif-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .db-notif-msg { font-size: 0.78rem; line-height: 1.5; color: var(--text); }
        .db-notif-time { font-size: 0.65rem; color: var(--muted); margin-top: 4px; }

        /* Content */
        .db-content { padding: 28px 32px; flex: 1; }

        /* Stats */
        .db-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        .db-stat-card {
          background: var(--card); border: 1px solid var(--border-dim); padding: 20px;
          clip-path: polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .db-stat-label { font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .db-stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.05em; line-height: 1; }
        .db-stat-sub { font-size: 0.7rem; color: var(--muted); margin-top: 4px; }

        /* Tabs */
        .db-tabs { display: flex; margin-bottom: 20px; border-bottom: 1px solid var(--border-dim); animation: fadeUp 0.4s ease 0.3s both; }
        .db-tab {
          display: flex; align-items: center; gap: 7px; padding: 10px 20px; cursor: pointer;
          font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--muted); background: none; border: none;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: all 0.18s; font-family: 'DM Sans', sans-serif;
        }
        .db-tab:hover { color: var(--text); }
        .db-tab.active { color: var(--orange); border-bottom-color: var(--orange); }

        /* Filters + search */
        .db-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; animation: fadeUp 0.4s ease 0.35s both; }
        .db-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .db-search {
          width: 100%; background: var(--card); border: 1px solid var(--border-dim);
          color: var(--text); font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; padding: 10px 16px 10px 38px; outline: none;
          transition: border-color 0.2s;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
        }
        .db-search:focus { border-color: rgba(249,115,22,0.4); }
        .db-search::placeholder { color: var(--muted); }
        .db-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--muted); }

        .db-filter-btn {
          padding: 9px 14px; background: var(--card); border: 1px solid var(--border-dim);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: all 0.18s;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
        }
        .db-filter-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
        .db-filter-btn.active { color: var(--orange); border-color: var(--orange); background: var(--orange-dim); }

        /* Shipment table */
        .db-table-wrap { overflow-x: auto; animation: fadeUp 0.4s ease 0.4s both; }
        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th {
          font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--muted); font-weight: 500; padding: 10px 16px;
          border-bottom: 1px solid var(--border-dim); text-align: left; white-space: nowrap;
        }
        .db-table td { padding: 14px 16px; border-bottom: 1px solid var(--border-dim); font-size: 0.82rem; vertical-align: middle; }
        .db-table tr:hover td { background: rgba(255,255,255,0.015); }

        .db-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
          border-radius: 2px;
        }
        .db-status-dot { width: 5px; height: 5px; border-radius: 50%; }

        .db-action-btn {
          padding: 6px 12px; font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 0.18s; border-radius: 2px;
          clip-path: polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px));
        }
        .db-action-btn.view-bids { background: var(--orange-dim); border: 1px solid rgba(249,115,22,0.3); color: var(--orange); }
        .db-action-btn.view-bids:hover { background: rgba(249,115,22,0.2); }
        .db-action-btn.rate { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: var(--green); }
        .db-action-btn.rate:hover { background: rgba(34,197,94,0.18); }
        .db-action-btn.rated { background: transparent; border: 1px solid var(--border-dim); color: var(--muted); cursor: default; clip-path: none; }

        .db-bid-count { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; }
        .db-bid-pill { background: var(--orange-dim); color: var(--orange); font-size: 0.62rem; font-weight: 700; padding: 1px 7px; border-radius: 10px; }

        /* Analytics */
        .db-analytics-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
        .db-an-card {
          background: var(--card); border: 1px solid var(--border-dim); padding: 24px;
          clip-path: polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));
          animation: fadeUp 0.4s ease both;
        }
        .db-an-label { font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
        .db-an-value { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; color: var(--text); }
        .db-an-sub { font-size: 0.72rem; color: var(--muted); margin-top: 4px; }

        /* Post Shipment Modal */
        .db-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .db-modal {
          background: var(--card); border: 1px solid var(--border);
          width: 520px; max-width: 94vw; max-height: 88vh; overflow-y: auto;
          padding: 32px;
          clip-path: polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));
          animation: modalIn 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .db-modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.08em; color: var(--text); margin-bottom: 4px; }
        .db-modal-sub { font-size: 0.78rem; color: var(--muted); margin-bottom: 24px; }
        .db-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .db-form-field { display: flex; flex-direction: column; gap: 7px; }
        .db-form-field.full { grid-column: 1/-1; }
        .db-form-label { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
        .db-form-input {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          padding: 10px 14px; outline: none; transition: border-color 0.2s;
          clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));
        }
        .db-form-input:focus { border-color: var(--orange); }
        .db-form-input::placeholder { color: var(--muted); }
        .db-form-error { color: var(--red); font-size: 0.72rem; margin-bottom: 12px; }
        .db-modal-actions { display: flex; gap: 10px; margin-top: 8px; }
        .db-btn-cancel {
          flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 0.78rem;
          letter-spacing: 0.1em; text-transform: uppercase; padding: 12px; cursor: pointer; transition: all 0.18s;
        }
        .db-btn-cancel:hover { color: var(--text); }
        .db-btn-submit {
          flex: 2; background: var(--orange); border: none; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; padding: 12px; cursor: pointer;
          clip-path: polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));
          transition: background 0.18s;
        }
        .db-btn-submit:hover { background: #fb923c; }

        /* Bids Modal */
        .db-bids-modal { width: 600px; }
        .db-bid-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid var(--border-dim);
        }
        .db-bid-driver { font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 3px; }
        .db-bid-meta { font-size: 0.72rem; color: var(--muted); display: flex; gap: 14px; }
        .db-bid-price { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: var(--green); letter-spacing: 0.05em; margin-right: 14px; }
        .db-select-btn {
          background: var(--orange); border: none; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 14px; cursor: pointer;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
          transition: background 0.18s; white-space: nowrap;
        }
        .db-select-btn:hover { background: #fb923c; }
        .db-no-bids { padding: 32px 0; text-align: center; color: var(--muted); font-size: 0.82rem; }

        /* Rate modal */
        .db-stars { display: flex; gap: 8px; margin-bottom: 16px; }
        .db-star { font-size: 2rem; cursor: pointer; transition: transform 0.15s; filter: grayscale(1) opacity(0.4); }
        .db-star.active { filter: none; transform: scale(1.15); }
        .db-star:hover { transform: scale(1.2); }
        .db-rate-textarea {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          padding: 10px 14px; outline: none; resize: vertical; min-height: 80px;
          transition: border-color 0.2s; margin-bottom: 16px;
        }
        .db-rate-textarea:focus { border-color: var(--orange); }
        .db-rate-textarea::placeholder { color: var(--muted); }

        @media (max-width: 900px) {
          .db-sidebar { transform: translateX(-100%); }
          .db-sidebar.open { transform: translateX(0); }
          .db-main { margin-left: 0; }
          .db-hamburger { display: flex; }
          .db-stats { grid-template-columns: repeat(2,1fr); }
          .db-content { padding: 20px 16px; }
          .db-topbar { padding: 0 16px; }
          .db-analytics-grid { grid-template-columns: 1fr; }
          .db-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`db-sidebar${sidebarOpen ? " open" : ""}`}>
        <a className="db-sidebar-logo" href="/">
          <div className="db-logo-icon">
            <Truck size={15} color="#fff" />
          </div>
          Sarth<span>ix</span>
        </a>

        <div className="db-sidebar-user">
          <div className="db-avatar">{user?.firstName?.[0] || "S"}</div>
          <div className="db-username">{user?.fullName || "Shipper"}</div>
          <div className="db-role">🏢 Company</div>
        </div>

        <nav className="db-sidebar-nav">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`db-nav-item${activeTab === tab.id ? " active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </div>
          ))}
        </nav>

        <button className="db-post-btn" onClick={() => setPostModal(true)}>
          <Plus size={14} /> Post Shipment
        </button>

        <div className="db-sidebar-bottom">
          <button
            className="db-signout"
            onClick={() => signOut(() => navigate("/login"))}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="db-main">
        <header className="db-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="db-hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <span className="db-topbar-title">
              {activeTab === "shipments" ? "My Shipments" : "Analytics"}
            </span>
          </div>
          <div className="db-topbar-right">
            <button
              className="db-notif-btn"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="db-notif-badge">{unreadCount}</span>
              )}
            </button>
          </div>
        </header>

        {/* Notification Drawer */}
        <div className={`db-notif-drawer${notifOpen ? " open" : ""}`}>
          <div className="db-notif-hdr">
            <h3>Notifications</h3>
            <button
              className="db-notif-mark"
              onClick={() =>
                setNotifications((p) => p.map((n) => ({ ...n, isRead: true })))
              }
            >
              Mark all read
            </button>
          </div>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`db-notif-item${!n.isRead ? " unread" : ""}`}
            >
              <div
                className="db-notif-dot"
                style={{
                  background:
                    n.type === "bid"
                      ? "var(--orange)"
                      : n.type === "completed"
                        ? "var(--green)"
                        : "var(--blue)",
                }}
              />
              <div>
                <div className="db-notif-msg">{n.message}</div>
                <div className="db-notif-time">
                  {new Date(n.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="db-content"
          onClick={() => {
            if (notifOpen) setNotifOpen(false);
          }}
        >
          {/* Stats */}
          <div className="db-stats">
            {[
              {
                label: "Total Shipments",
                value: MOCK_STATS.totalShipments,
                sub: "All time",
                color: "var(--text)",
              },
              {
                label: "Active",
                value: MOCK_STATS.activeShipments,
                sub: "Bidding or assigned",
                color: "var(--orange)",
              },
              {
                label: "Completed",
                value: MOCK_STATS.completedShipments,
                sub: "Delivered",
                color: "var(--green)",
              },
              {
                label: "Total Spent",
                value: formatCurrency(MOCK_STATS.totalSpent),
                sub: "Lifetime",
                color: "var(--blue)",
              },
            ].map(({ label, value, sub, color }, i) => (
              <div
                className="db-stat-card"
                key={label}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="db-stat-label">{label}</div>
                <div className="db-stat-value" style={{ color }}>
                  {value}
                </div>
                <div className="db-stat-sub">{sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="db-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`db-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Shipments Tab */}
          {activeTab === "shipments" && (
            <>
              <div className="db-toolbar">
                <div className="db-search-wrap">
                  <Search size={13} className="db-search-icon" />
                  <input
                    className="db-search"
                    placeholder="Search shipments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {filters.map((f) => (
                  <button
                    key={f}
                    className={`db-filter-btn${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "All" : STATUS_CONFIG[f]?.label}
                  </button>
                ))}
              </div>

              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Load</th>
                      <th>Weight</th>
                      <th>Min Bid</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Driver</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((s, i) => {
                      const cfg = STATUS_CONFIG[s.status];
                      return (
                        <tr
                          key={s.id}
                          style={{
                            animation: `fadeUp 0.35s ease ${i * 0.05}s both`,
                          }}
                        >
                          <td>
                            <div
                              style={{ fontWeight: 600, fontSize: "0.85rem" }}
                            >
                              {s.pickupLocation} → {s.dropLocation}
                            </div>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                color: "var(--muted)",
                              }}
                            >
                              {s.distanceKm} km
                            </div>
                          </td>
                          <td
                            style={{
                              color: "var(--orange)",
                              fontSize: "0.78rem",
                            }}
                          >
                            {s.loadType}
                          </td>
                          <td
                            style={{
                              color: "var(--muted)",
                              fontSize: "0.78rem",
                            }}
                          >
                            {s.weightKg.toLocaleString()} kg
                          </td>
                          <td
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: "1rem",
                              color: "var(--green)",
                            }}
                          >
                            {formatCurrency(s.minBidPrice)}
                          </td>
                          <td
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--muted)",
                            }}
                          >
                            {formatDeadline(s.biddingDeadline)}
                          </td>
                          <td>
                            <span
                              className="db-status-badge"
                              style={{ color: cfg.color, background: cfg.bg }}
                            >
                              <span
                                className="db-status-dot"
                                style={{ background: cfg.color }}
                              />
                              {cfg.label}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.78rem" }}>
                            {s.assignedDriver ? (
                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  {s.assignedDriver.name}
                                </div>
                                <div
                                  style={{
                                    color: "var(--muted)",
                                    fontSize: "0.65rem",
                                  }}
                                >
                                  ★ {s.assignedDriver.rating}
                                </div>
                              </div>
                            ) : s.bids.length > 0 ? (
                              <span className="db-bid-count">
                                <span className="db-bid-pill">
                                  {s.bids.length}
                                </span>{" "}
                                bids
                              </span>
                            ) : (
                              <span style={{ color: "var(--muted)" }}>—</span>
                            )}
                          </td>
                          <td>
                            {s.status === "bidding" && s.bids.length > 0 && (
                              <button
                                className="db-action-btn view-bids"
                                onClick={() => setBidsModal(s)}
                              >
                                <Eye
                                  size={11}
                                  style={{ display: "inline", marginRight: 4 }}
                                />
                                View Bids
                              </button>
                            )}
                            {s.status === "completed" && !s.rated && (
                              <button
                                className="db-action-btn rate"
                                onClick={() => setRateModal(s)}
                              >
                                ★ Rate Driver
                              </button>
                            )}
                            {s.status === "completed" && s.rated && (
                              <span className="db-action-btn rated">
                                ★ Rated
                              </span>
                            )}
                            {(s.status === "open" ||
                              s.status === "assigned") && (
                              <span
                                style={{
                                  color: "var(--muted)",
                                  fontSize: "0.72rem",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="db-analytics-grid">
              {[
                {
                  label: "Total Shipments Posted",
                  value: "34",
                  sub: "Since account creation",
                },
                {
                  label: "Avg. Bids Per Shipment",
                  value: "2.4",
                  sub: "Across all shipments",
                },
                {
                  label: "Avg. Spend Per Shipment",
                  value: formatCurrency(Math.round(845000 / 29)),
                  sub: "Based on completed trips",
                },
                {
                  label: "On-Time Delivery Rate",
                  value: "94%",
                  sub: "Based on ETA vs actual",
                },
              ].map(({ label, value, sub }, i) => (
                <div
                  className="db-an-card"
                  key={label}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="db-an-label">{label}</div>
                  <div className="db-an-value">{value}</div>
                  <div className="db-an-sub">{sub}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Post Shipment Modal */}
      {postModal && (
        <div className="db-overlay" onClick={() => setPostModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-title">Post New Shipment</div>
            <div className="db-modal-sub">
              Fill in shipment details to start receiving bids from drivers.
            </div>
            <div className="db-form-grid">
              {[
                {
                  key: "loadType",
                  label: "Load Type *",
                  placeholder: "e.g. Electronics",
                },
                {
                  key: "weightKg",
                  label: "Weight (kg) *",
                  placeholder: "e.g. 1200",
                  type: "number",
                },
                {
                  key: "pickupLocation",
                  label: "Pickup Location *",
                  placeholder: "e.g. Delhi",
                },
                {
                  key: "dropLocation",
                  label: "Drop Location *",
                  placeholder: "e.g. Mumbai",
                },
                {
                  key: "distanceKm",
                  label: "Distance (km)",
                  placeholder: "e.g. 1415",
                  type: "number",
                },
                {
                  key: "minBidPrice",
                  label: "Min Bid Price (₹) *",
                  placeholder: "e.g. 18000",
                  type: "number",
                },
                {
                  key: "basePrice",
                  label: "Base Price (₹)",
                  placeholder: "e.g. 22000",
                  type: "number",
                },
                {
                  key: "biddingDeadline",
                  label: "Bidding Deadline *",
                  type: "datetime-local",
                },
              ].map(({ key, label, placeholder, type }) => (
                <div className="db-form-field" key={key}>
                  <label className="db-form-label">{label}</label>
                  <input
                    className="db-form-input"
                    type={type || "text"}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            {formError && <div className="db-form-error">{formError}</div>}
            <div className="db-modal-actions">
              <button
                className="db-btn-cancel"
                onClick={() => setPostModal(false)}
              >
                Cancel
              </button>
              <button className="db-btn-submit" onClick={handlePostShipment}>
                Post Shipment →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bids Modal */}
      {bidsModal && (
        <div className="db-overlay" onClick={() => setBidsModal(null)}>
          <div
            className="db-modal db-bids-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="db-modal-title">Compare Bids</div>
            <div className="db-modal-sub">
              {bidsModal.pickupLocation} → {bidsModal.dropLocation} ·{" "}
              {bidsModal.loadType}
            </div>
            {bidsModal.bids.length === 0 ? (
              <div className="db-no-bids">No bids received yet.</div>
            ) : (
              bidsModal.bids
                .sort((a, b) => a.bidPrice - b.bidPrice)
                .map((bid) => (
                  <div key={bid.id} className="db-bid-row">
                    <div>
                      <div className="db-bid-driver">{bid.driverName}</div>
                      <div className="db-bid-meta">
                        <span>★ {bid.rating}</span>
                        <span>ETA: {bid.etaHours}h</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="db-bid-price">
                        {formatCurrency(bid.bidPrice)}
                      </span>
                      <button
                        className="db-select-btn"
                        onClick={() => handleSelectDriver(bidsModal.id, bid)}
                      >
                        Select Driver →
                      </button>
                    </div>
                  </div>
                ))
            )}
            <div className="db-modal-actions" style={{ marginTop: 20 }}>
              <button
                className="db-btn-cancel"
                onClick={() => setBidsModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Driver Modal */}
      {rateModal && (
        <div className="db-overlay" onClick={() => setRateModal(null)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-title">Rate Your Driver</div>
            <div className="db-modal-sub">
              {rateModal.assignedDriver?.name} · {rateModal.pickupLocation} →{" "}
              {rateModal.dropLocation}
            </div>
            <div className="db-form-label" style={{ marginBottom: 10 }}>
              Rating
            </div>
            <div className="db-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`db-star${rating >= s ? " active" : ""}`}
                  onClick={() => setRating(s)}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="db-form-label" style={{ marginBottom: 8 }}>
              Comment (optional)
            </div>
            <textarea
              className="db-rate-textarea"
              placeholder="How was the experience?"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />
            <div className="db-modal-actions">
              <button
                className="db-btn-cancel"
                onClick={() => setRateModal(null)}
              >
                Cancel
              </button>
              <button
                className="db-btn-submit"
                onClick={handleRateSubmit}
                disabled={!rating}
              >
                Submit Rating →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
