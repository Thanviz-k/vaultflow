import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Bell,
  UserCircle,
  Sparkles
} from "lucide-react";

function Navbar({ title, onLogout, token }) {

  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    function loadUnreadCount() {
      fetch("http://127.0.0.1:8000/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.unread_count))
        .catch(() => {});
    }

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [token]);

  return (

    <header className="navbar">

      <div>
        <h1>{title}</h1>
      </div>

      <div className="navbar-actions">

        <button
          className="btn btn-icon"
          title="AI Assistant"
          onClick={() => navigate("/ai")}
        >
          <Sparkles size={20} />
        </button>

        <button
          className="btn btn-icon notification-btn"
          title="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          className="btn btn-icon"
          title="Profile"
          onClick={() => navigate("/profile")}
        >
          <UserCircle size={22} />
        </button>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </header>

  );

}

export default Navbar;