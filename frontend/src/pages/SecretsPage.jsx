import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import { getMySecrets } from "../api";

import AppLayout from "../layouts/AppLayout";

import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";

import SecretCard from "../components/secrets/SecretCard";
import SecretForm from "../components/SecretForm";

function SecretsPage({ token, onLogout }) {

  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {

    loadSecrets();

  }, []);

  async function loadSecrets() {

    setLoading(true);
    setError("");

    try {

      const data = await getMySecrets(token);

      setSecrets(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }

  const filteredSecrets = secrets.filter((secret) => {

    const statusMatch =
      filter === "All"
        ? true
        : secret.status === filter;

    const searchMatch =
      secret.name
        .toLowerCase()
        .includes(search.toLowerCase());

    return statusMatch && searchMatch;

  });

  if (loading) {

    return (
      <LoadingSpinner
        text="Loading your secrets..."
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

    <AppLayout
      title="Secrets"
      onLogout={onLogout}
    >

      <div className="page-header">

        <div>

          <h1>Secrets</h1>

          <p>

            Securely manage all your encrypted secrets.

          </p>

        </div>

        <button
          className="primary-btn"
          onClick={() => setShowCreate(true)}
        >

          <Plus size={18} />

          Create Secret

        </button>

      </div>

      <div className="search-box">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search secrets..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      <div className="filter-tabs">

        {[
          "All",
          "Active",
          "Expired",
          "Revoked",
        ].map((item) => (

          <button
            key={item}
            className={
              filter === item
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(item)
            }
          >

            {item}

          </button>

        ))}

      </div>

      {showCreate && (

        <SecretForm
          token={token}
          onSuccess={() => {

            setShowCreate(false);

            loadSecrets();

          }}
          onCancel={() => {

            setShowCreate(false);

          }}
        />

      )}

      {filteredSecrets.length === 0 ? (

        <div className="empty-state">

          <h2>

            No Secrets Found

          </h2>

          <p>

            Create your first encrypted secret.

          </p>

          <button
            className="primary-btn"
            onClick={() =>
              setShowCreate(true)
            }
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
              refresh={loadSecrets}
            />

          ))}

        </div>

      )}

    </AppLayout>

  );

}

export default SecretsPage;