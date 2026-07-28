import "./Header.css";
import { Bell, User, LogOut, Sparkles } from "lucide-react";

function Header({ search, setSearch }) {
  return (
    <div className="dashboard-header">

      <div className="dashboard-title">
        <h1>Dashboard</h1>
        <p>Manage all your secrets in one place.</p>
      </div>

      <div className="dashboard-actions">

        <input
          type="text"
          placeholder="Search secrets..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="create-btn">
          + Create Secret
        </button>

        {/* icon buttons row - matches bell/profile style */}
        <div className="icon-btn-group">
          <button className="icon-btn ai-icon-btn" title="AI Assistant">
            <Sparkles size={18} />
          </button>

          <button className="icon-btn" title="Notifications">
            <Bell size={18} />
          </button>

          <button className="icon-btn" title="Profile">
            <User size={18} />
          </button>

          <button className="logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>

      </div>

    </div>
  );
}

export default Header;