import { useEffect, useState } from "react";

import AppLayout from "../layouts/AppLayout";

import StatCard from "../components/ui/StatCard";

import { getDashboardStats } from "../api";

function DashboardPage({ token, onLogout }) {

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiring: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {

    try {

      const data =
        await getDashboardStats(token);

      setStats(data);

    } catch (err) {

      console.error(err);

    }

  }

  return (

    <AppLayout
      title="Dashboard"
      onLogout={onLogout}
    >

      <div className="vault-stats">

  <StatCard
    icon="🔐"
    title="Total"
    value={stats.total}
  />

  <StatCard
    icon="✅"
    title="Active"
    value={stats.active}
  />

  <StatCard
    icon="⏰"
    title="Expiring"
    value={stats.expiring}
  />

  <StatCard
    icon="❌"
    title="Revoked"
    value={stats.revoked ?? 0}
  />

</div>

      <div className="dashboard-grid">

        <section className="dashboard-card">

          <h2>
            ⚡ Quick Actions
          </h2>

          <button className="action-btn">
            ➕ Create Secret
          </button>

          <button className="action-btn">
            📊 View Reports
          </button>

        </section>

        <section className="dashboard-card">

          <h2>
            📜 Recent Activity
          </h2>

          <ul>

            <li>
              Secret Created
            </li>

            <li>
              Secret Revealed
            </li>

            <li>
              Secret Revoked
            </li>

          </ul>

        </section>

      </div>

    </AppLayout>

  );

}

export default DashboardPage;