import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import NotificationList from "../../../components/ui/NotificationList.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import {
  useNotifications,
  useMarkNotificationRead,
} from "../../../hooks/useNotifications.js";

export default function CompanyNotifications() {
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();

  if (isLoading) return <DashboardSkeleton cards={0} rows={1} />;

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
          Failed to load notifications
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

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <SectionHeader
        title={`Notifications${unread > 0 ? ` · ${unread} unread` : ""}`}
      />
      <NotificationList notifications={notifications} onMarkRead={markRead} />
    </>
  );
}
