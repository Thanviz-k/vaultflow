import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";

function NotificationsPage({ token, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadNotifications() {
    setLoading(true);
    fetch("http://127.0.0.1:8000/notifications/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadNotifications();
  }, [token]);

  function markAsRead(id) {
    fetch(`http://127.0.0.1:8000/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => loadNotifications());
  }

  function markAllRead() {
    fetch("http://127.0.0.1:8000/notifications/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => loadNotifications());
  }

  return (
    <AppLayout title="Notifications" onLogout={onLogout} token={token}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0 }}>Notifications</h2>
          <button className="mark-all-btn" onClick={markAllRead}>
            Mark all as read
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && notifications.length === 0 && (
          <p style={{ color: "#888" }}>No notifications yet.</p>
        )}

        {!loading &&
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`notif-card ${n.is_read ? "read" : "unread"}`}
              style={{ cursor: n.is_read ? "default" : "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong className="notif-title">{n.title}</strong>
                <span className="notif-time">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="notif-message">{n.message}</p>
            </div>
          ))}
      </div>
    </AppLayout>
  );
}

export default NotificationsPage;
