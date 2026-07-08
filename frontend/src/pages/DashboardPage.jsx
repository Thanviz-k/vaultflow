import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getMySecrets,
} from "../api";

import SecretForm
  from "../components/SecretForm";

import SecretList
  from "../components/SecretList";


function DashboardPage({
  token,
  onLogout,
}) {
  const navigate = useNavigate();

  const [mySecrets, setMySecrets] =
    useState([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");


  const loadMySecrets =
    useCallback(async () => {
      setError("");

      try {
        const data =
          await getMySecrets(token);

        setMySecrets(data);

      } catch (error) {
        setError(error.message);

      } finally {
        setLoading(false);
      }
    }, [token]);


  useEffect(() => {
    loadMySecrets();
  }, [loadMySecrets]);


  function handleLogout() {
    onLogout();
    navigate("/");
  }


  /*
    COUNTERS
  */

  const counts = useMemo(() => {
    return {
      total: mySecrets.length,

      active: mySecrets.filter(
        (secret) =>
          secret.status === "active"
      ).length,

      expired: mySecrets.filter(
        (secret) =>
          secret.status === "expired"
      ).length,

      revoked: mySecrets.filter(
        (secret) =>
          secret.status === "revoked"
      ).length,
    };
  }, [mySecrets]);


  /*
    FILTER + SEARCH
  */

  const filteredSecrets = useMemo(() => {
    return mySecrets.filter((secret) => {

      const matchesStatus =
        activeFilter === "all" ||
        secret.status === activeFilter;

      const matchesSearch =
        secret.name
          .toLowerCase()
          .includes(
            searchTerm
              .trim()
              .toLowerCase()
          );

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    mySecrets,
    activeFilter,
    searchTerm,
  ]);


  return (
    <main className="vault-dashboard">

      {/* HEADER */}

      <header className="vault-header">

        <div>
          <span className="vault-eyebrow">
            DIGITAL SECRET VAULT
          </span>

          <h1>VaultFlow</h1>

          <p>
            Secure secrets. Controlled access.
          </p>
        </div>


        <div className="vault-header-actions">

          <div className="vault-status">
            <span className="vault-status-light" />
            SYSTEM SECURE
          </div>

          <Link
            to="/reports"
            className="vault-nav-link"
          >
            Intelligence Reports
          </Link>

          <button
            type="button"
            className="vault-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ERROR */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* STATS */}

      <section className="vault-stats">

        <button
          type="button"
          className={
            activeFilter === "all"
              ? "stat-card selected"
              : "stat-card"
          }
          onClick={() =>
            setActiveFilter("all")
          }
        >
          <span className="stat-code">
            VF-01
          </span>

          <strong>
            {counts.total}
          </strong>

          <span className="stat-name">
            TOTAL SECRETS
          </span>
        </button>


        <button
          type="button"
          className={
            activeFilter === "active"
              ? "stat-card selected"
              : "stat-card"
          }
          onClick={() =>
            setActiveFilter("active")
          }
        >
          <span className="stat-code">
            VF-02
          </span>

          <strong>
            {counts.active}
          </strong>

          <span className="stat-name">
            ACTIVE
          </span>
        </button>


        <button
          type="button"
          className={
            activeFilter === "expired"
              ? "stat-card selected"
              : "stat-card"
          }
          onClick={() =>
            setActiveFilter("expired")
          }
        >
          <span className="stat-code">
            VF-03
          </span>

          <strong>
            {counts.expired}
          </strong>

          <span className="stat-name">
            EXPIRED
          </span>
        </button>


        <button
          type="button"
          className={
            activeFilter === "revoked"
              ? "stat-card selected"
              : "stat-card"
          }
          onClick={() =>
            setActiveFilter("revoked")
          }
        >
          <span className="stat-code">
            VF-04
          </span>

          <strong>
            {counts.revoked}
          </strong>

          <span className="stat-name">
            REVOKED
          </span>
        </button>

      </section>


      {/* CREATE SECRET */}

      <section className="dashboard-section">

        <div className="section-title-row">
          <div>
            <span className="section-index">
              01 / SECURE STORAGE
            </span>

            <h2>Create New Secret</h2>
          </div>
        </div>


        <SecretForm
          token={token}
          onSecretCreated={
            loadMySecrets
          }
        />

      </section>


      {/* VAULT CONTENTS */}

      <section className="dashboard-section">

        <div className="section-title-row">

          <div>
            <span className="section-index">
              02 / VAULT CONTENTS
            </span>

            <h2>Stored Secrets</h2>
          </div>


          <span className="result-count">
            {filteredSecrets.length}
            {" "}
            RESULT
            {filteredSecrets.length !== 1
              ? "S"
              : ""}
          </span>

        </div>


        {/* SEARCH */}

        <div className="vault-search">

          <span className="search-symbol">
            ⌕
          </span>

          <input
            type="search"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Search vault by secret name..."
          />

        </div>


        {/* FILTER BUTTONS */}

        <div className="vault-filter-bar">

          {[
            "all",
            "active",
            "expired",
            "revoked",
          ].map((filter) => (

            <button
              key={filter}
              type="button"
              className={
                activeFilter === filter
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() =>
                setActiveFilter(filter)
              }
            >
              {filter.toUpperCase()}

              <span>
                {filter === "all"
                  ? counts.total
                  : counts[filter]}
              </span>
            </button>

          ))}

        </div>


        {/* LIST */}

        {loading ? (
          <div className="vault-loading">
            ACCESSING VAULT...
          </div>
        ) : (
          <SecretList
            secrets={filteredSecrets}
            token={token}
            onSecretRevoked={
              loadMySecrets
            }
          />
        )}

      </section>

    </main>
  );
}


export default DashboardPage;