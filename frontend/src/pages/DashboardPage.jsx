import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import AppLayout from "../layouts/AppLayout";

import {
  getMySecrets,
  getVaultStatus,
} from "../api";

import VaultSetupModal from "../components/vault/VaultSetupModal";
import SecretCard from "../components/secrets/SecretCard";
import SecretForm from "../components/SecretForm";
import "../styles/dashboard.css";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";

function DashboardPage({ token, onLogout }) {

  console.log("Token:", token);

  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const totalSecrets = secrets.length;

const activeSecrets = secrets.filter(
  (secret) => secret.status.toLowerCase() === "active"
).length;

const expiredSecrets = secrets.filter(
  (secret) => secret.status.toLowerCase() === "expired"
).length;

const revokedSecrets = secrets.filter(
  (secret) => secret.status.toLowerCase() === "revoked"
).length;

  useEffect(() => {
    initializeDashboard();
  }, []);

  async function initializeDashboard() {
    try {

      const vaultStatus = await getVaultStatus(token);

      if (!vaultStatus.initialized) {
        setShowVaultModal(true);
      }

      await loadSecrets();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSecrets() {
    try {

      const data = await getMySecrets(token);
      console.log("Secrets:", data);
       

      setSecrets(data);

    } catch (err) {
      setError(err.message);
    }
  }

  function handleVaultInitialized() {
    setShowVaultModal(false);
    loadSecrets();
  }

const filteredSecrets = secrets.filter((secret) => {

  const statusMatch =
    filter === "All"
      ? true
      : secret.status.toLowerCase() === filter.toLowerCase();

  const searchMatch =
    secret.name
      .toLowerCase()
      .includes(search.toLowerCase());

  return statusMatch && searchMatch;

});

  if (loading) {
    return (
      <LoadingSpinner
        text="Loading Dashboard..."
      />
    );
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
      </Alert>
    );
  }

  return (
    <>
      {showVaultModal && (
        <VaultSetupModal
          token={token}
          onComplete={handleVaultInitialized}
        />
      )}

      <AppLayout title="Dashboard" onLogout={onLogout}>

  {/* Hero */}
  <section className="dashboard-hero">
    <div>
      <h1>Dashboard</h1>
      <p>
        Manage and protect your encrypted secrets securely.
      </p>
    </div>
  </section>

  {/* Statistics */}
  <section className="stats-grid">

  <div
    className={`stat-card total ${filter === "All" ? "selected" : ""}`}
    onClick={() => setFilter("All")}
  >
    <div className="stat-left">
      <h3>Total</h3>
    </div>

    <div className="stat-right">
      <span>{totalSecrets}</span>
    </div>
  </div>

  <div
    className={`stat-card active ${filter === "Active" ? "selected" : ""}`}
    onClick={() => setFilter("Active")}
  >
    <div className="stat-left">
      <h3>Active</h3>
    </div>

    <div className="stat-right">
      <span>{activeSecrets}</span>
    </div>
  </div>

  <div
    className={`stat-card expired ${filter === "Expired" ? "selected" : ""}`}
    onClick={() => setFilter("Expired")}
  >
    <div className="stat-left">
      <h3>Expired</h3>
    </div>

    <div className="stat-right">
      <span>{expiredSecrets}</span>
    </div>
  </div>

  <div
    className={`stat-card revoked ${filter === "Revoked" ? "selected" : ""}`}
    onClick={() => setFilter("Revoked")}
  >
    <div className="stat-left">
      <h3>Revoked</h3>
    </div>

    <div className="stat-right">
      <span>{revokedSecrets}</span>
    </div>
  </div>

</section>

  {/* Toolbar */}
  <div className="toolbar">

  <div className="toolbar-left">

    <div className="search-box">

      <Search size={18} />

      <input
        type="text"
        placeholder="Search secrets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>

  </div>

  <div className="toolbar-right">

    <button
      className="create-btn"
      onClick={() => setShowCreate(true)}
    >
      <Plus size={18} />
      Create Secret
    </button>

  </div>

</div>

 

  {/* Create Secret Modal */}
  {showCreate && (

    <SecretForm
      token={token}
      onSuccess={() => {
        setShowCreate(false);
        loadSecrets();
      }}
      onCancel={() => setShowCreate(false)}
    />

  )}

  {/* Empty State */}
  {filteredSecrets.length === 0 ? (

    <div className="empty-state">

      <h2>No Secrets</h2>

      <p>Create your first encrypted secret.</p>

      <button
        className="btn btn-primary"
        onClick={() => setShowCreate(true)}
      >
        <Plus size={18} />
        Create Secret
      </button>

    </div>

  ) : (

    <div className="secret-grid">

      {filteredSecrets.map((secret) => (

        <SecretCard
          key={secret.id}
          secret={secret}
          token={token}
          onRefresh={loadSecrets}
        />

      ))}

    </div>

  )}

</AppLayout>
    </>
  );
}

export default DashboardPage;