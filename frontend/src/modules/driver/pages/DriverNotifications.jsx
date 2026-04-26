import SectionHeader from "../../../components/ui/SectionHeader.jsx";
import NotificationList from "../../../components/ui/NotificationList.jsx";
import DashboardSkeleton from "../../../components/ui/DashboardSkeleton.jsx";
import ErrorBanner from "../../../components/ui/ErrorBanner.jsx";
import {
  useNotifications,
  useMarkNotificationRead,
} from "../../../hooks/useNotifications.js";
export default function DriverNotifications() {
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
      <ErrorBanner
        message={error.message}
        onRetry={refetch}
        context="notifications"
      />
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
