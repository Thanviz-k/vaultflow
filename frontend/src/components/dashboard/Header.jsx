import "./Header.css";
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

        <button className="ai-btn">
          AI Assistant
        </button>

      </div>

    </div>
  );
}

export default Header;