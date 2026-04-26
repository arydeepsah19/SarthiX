import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Topbar from "../../components/layout/Topbar.jsx";
import PageWrapper from "../../components/ui/PageWrapper.jsx";
import { COLORS } from "../../components/ui/tokens.js";
import {
  IDash,
  IShipment,
  IBid,
  IBell,
  ISettings,
  IList,
  IMap,
} from "../../components/ui/Icons.jsx";
import { useNotifications } from "../../hooks/useNotifications.js";

import CompanyDashboard from "./pages/CompanyDashboard.jsx";
import CompanyShipments from "./pages/CompanyShipments.jsx";
import AllShipments from "./pages/AllShipments.jsx";
import TrackShipment from "./pages/TrackShipment.jsx";
import CompanyBids from "./pages/CompanyBids.jsx";
import CompanyNotifications from "./pages/CompanyNotifications.jsx";
import ProfilePage from "../shared/ProfilePage.jsx";

const SIDEBAR_W = 220;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <IDash size={17} /> },
  { id: "shipments", label: "Shipments", icon: <IShipment size={17} /> },
  { id: "all_shipments", label: "Marketplace", icon: <IList size={17} /> },
  { id: "bids", label: "Bid Management", icon: <IBid size={17} /> },
  { id: "track", label: "Track", icon: <IMap size={17} /> },
  { id: "notifications", label: "Notifications", icon: <IBell size={17} /> },
  { id: "account", label: "Account", icon: <ISettings size={17} /> },
];

const PAGE_TITLES = {
  dashboard: "Company Dashboard",
  shipments: "Shipments",
  all_shipments: "Shipment Marketplace",
  bids: "Bid Management",
  track: "Live Tracking",
  notifications: "Notifications",
  account: "Account",
};

function renderPage(page) {
  switch (page) {
    case "dashboard":
      return <CompanyDashboard />;
    case "shipments":
      return <CompanyShipments />;
    case "all_shipments":
      return <AllShipments />;
    case "bids":
      return <CompanyBids />;
    case "track":
      return <TrackShipment />;
    case "notifications":
      return <CompanyNotifications />;
    case "account":
      return <ProfilePage role="company" />;
    default:
      return <CompanyDashboard />;
  }
}

export default function CompanyApp() {
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <style>{`
        @media (min-width: 769px) { .app-main-content { margin-left: ${SIDEBAR_W}px !important; } }
        @media (max-width: 768px) { .app-main-content { margin-left: 0 !important; } }
      `}</style>

      <div
        style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `radial-gradient(ellipse 55% 35% at 75% 85%, #60a5fa06 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 15% 15%, #f9731404 0%, transparent 60%)`,
          }}
        />

        <Sidebar
          role="company"
          activePage={page}
          navItems={NAV_ITEMS}
          onNav={setPage}
          unreadCount={unread}
          appTitle="Shipper Control Hub"
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className="app-main-content"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
            minWidth: 0,
          }}
        >
          <Topbar
            pageTitle={PAGE_TITLES[page]}
            unreadCount={unread}
            onMenuClick={() => setMobileOpen(true)}
          />
          <main style={{ paddingTop: 60, flex: 1 }}>
            <PageWrapper>{renderPage(page)}</PageWrapper>
          </main>
        </div>
      </div>
    </>
  );
}
