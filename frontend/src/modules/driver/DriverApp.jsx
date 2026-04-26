import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Topbar from "../../components/layout/Topbar.jsx";
import PageWrapper from "../../components/ui/PageWrapper.jsx";
import { COLORS } from "../../components/ui/tokens.js";
import {
  IDash,
  IBid,
  ITruck,
  IPermit,
  ITrip,
  IBell,
  ISettings,
  IShipment,
} from "../../components/ui/Icons.jsx";
import { useNotifications } from "../../hooks/useNotifications.js";

import DriverDashboard from "./pages/DriverDashboard.jsx";
import DriverBids from "./pages/DriverBids.jsx";
import OpenShipments from "./pages/OpenShipments.jsx";
import DriverVehicles from "./pages/DriverVehicles.jsx";
import DriverPermits from "./pages/DriverPermits.jsx";
import DriverTrips from "./pages/DriverTrips.jsx";
import DriverNotifications from "./pages/DriverNotifications.jsx";
import ProfilePage from "../shared/ProfilePage.jsx";

const SIDEBAR_W = 220;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <IDash size={17} /> },
  {
    id: "open_shipments",
    label: "Open Shipments",
    icon: <IShipment size={17} />,
  },
  { id: "bids", label: "My Bids", icon: <IBid size={17} /> },
  { id: "vehicles", label: "Vehicles", icon: <ITruck size={17} /> },
  { id: "permits", label: "Permits", icon: <IPermit size={17} /> },
  { id: "trips", label: "Trip History", icon: <ITrip size={17} /> },
  { id: "notifications", label: "Notifications", icon: <IBell size={17} /> },
  { id: "account", label: "Account", icon: <ISettings size={17} /> },
];

const PAGE_TITLES = {
  dashboard: "Dashboard",
  open_shipments: "Open Shipments",
  bids: "My Bids",
  vehicles: "My Vehicles",
  permits: "Permit Compliance",
  trips: "Trip History",
  notifications: "Notifications",
  account: "Account",
};

function renderPage(page) {
  switch (page) {
    case "dashboard":
      return <DriverDashboard />;
    case "open_shipments":
      return <OpenShipments />;
    case "bids":
      return <DriverBids />;
    case "vehicles":
      return <DriverVehicles />;
    case "permits":
      return <DriverPermits />;
    case "trips":
      return <DriverTrips />;
    case "notifications":
      return <DriverNotifications />;
    case "account":
      return <ProfilePage role="driver" />;
    default:
      return <DriverDashboard />;
  }
}

export default function DriverApp() {
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <style>{`
        @media (min-width: 769px) {
          .app-main-content { margin-left: ${SIDEBAR_W}px !important; }
        }
        @media (max-width: 768px) {
          .app-main-content { margin-left: 0 !important; }
        }
          html, body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
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
            backgroundImage: `radial-gradient(ellipse 55% 35% at 75% 85%, #f9731608 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 15% 15%, #f9731604 0%, transparent 60%)`,
          }}
        />

        <Sidebar
          role="driver"
          activePage={page}
          navItems={NAV_ITEMS}
          onNav={setPage}
          unreadCount={unread}
          appTitle="Driver Command Center"
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
