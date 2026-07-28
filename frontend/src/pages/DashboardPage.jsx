import { useEffect, useState } from "react";
import { Plus, Search, FileDown } from "lucide-react";

import AppLayout from "../layouts/AppLayout";

import { getMySecrets, getVaultStatus } from "../api";
import { exportSecretsAsMarkdown } from "../utils/exportSecretsMarkdown";

import VaultSetupModal from "../components/vault/VaultSetupModal";
import AIAgentCard from "../components/dashboard/AIAgentCard";
import SecretCard from "../components/secrets/SecretCard";
import SecretForm from "../components/SecretForm";

import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";

const FILTERS = ["All", "Active", "Expired", "Revoked"];
const FILTER_CLASS = {
  All: "total",
  Active: "active",
  Expired: "expired",
  Revoked: "revoked",
};

function DashboardPage({ token, onLogout }) {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

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
      setSecrets(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleVaultInitialized() {
    setShowVaultModal(false);
    loadSecrets();
  }

  const counts = {
    All: secrets.length,
    Active: secrets.filter((s) => s.status === "Active").length,
    Expired: secrets.filter((s) => s.status === "Expired").length,
    Revoked: secrets.filter((s) => s.status === "Revoked").length,
  };

  const filteredSecrets = secrets.filter((secret) => {
    const statusMatch = filter === "All" ? true : secret.status === filter;

    const query = search.trim().toLowerCase();
    const searchMatch =
      query === "" ||
      secret.name?.toLowerCase().includes(query) ||
      secret.type?.toLowerCase().includes(query) ||
      secret.status?.toLowerCase().includes(query);

    return statusMatch && searchMatch;
  });

  if (loading) {
    return <LoadingSpinner text="Loading Dashboard..." />;
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <>
      {showVaultModal && (
        <VaultSetupModal
          token={token}
          onInitialized={handleVaultInitialized}
        />
      )}

      <AppLayout title="Dashboard" onLogout={onLogout}>
        <div className="dashboard-page">
          <div className="dashboard-hero">
            <div>
              <h1>Dashboard</h1>
              <p>Manage all your encrypted secrets in one place.</p>
            </div>
          </div>

          <div className="stats-grid">
            {FILTERS.map((item) => (
              <div
                key={item}
                className={`stat-card ${FILTER_CLASS[item]} ${
                  filter === item ? "selected" : ""
                }`}
                onClick={() => setFilter(item)}
              >
                <div className="stat-left">
                  <h3>{item}</h3>
                </div>
                <div className="stat-right">
                  <span>{counts[item]}</span>
                </div>
              </div>
            ))}
          </div>

          <AIAgentCard />

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

            <div className="toolbar-right" style={{ gap: "12px" }}>
              <button
                className="btn btn-export"
                onClick={() => exportSecretsAsMarkdown(secrets)}
                disabled={secrets.length === 0}
              >
                <FileDown size={18} />
                Export .md
              </button>

              <button
                className="create-btn"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={18} />
                Create Secret
              </button>
            </div>
          </div>

          {showCreate && (
            <SecretForm
              token={token}
              onSuccess={async () => {
                setShowCreate(false);
                await loadSecrets();
              }}
              onCancel={() => setShowCreate(false)}
            />
          )}

          {filteredSecrets.length === 0 ? (
            <div className="empty-state">
              {secrets.length === 0 ? (
                <>
                  <h2>No Secrets Found</h2>
                  <p>Create your first encrypted secret to get started.</p>
                  <button
                    className="create-btn"
                    onClick={() => setShowCreate(true)}
                  >
                    <Plus size={18} />
                    Create Secret
                  </button>
                </>
              ) : (
                <>
                  <h2>No Matching Secrets</h2>
                  <p>Try a different search term or filter.</p>
                </>
              )}
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
        </div>
      </AppLayout>
    </>
  );
}

export default DashboardPage;
