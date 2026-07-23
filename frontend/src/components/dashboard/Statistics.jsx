import StatCard from "../ui/StatCard";

function Statistics({ stats }) {
  return (
    <div className="statistics-grid">
      <StatCard
        icon="🔐"
        title="Total Secrets"
        value={stats.total}
        color="#2563EB"
      />

      <StatCard
        icon="✅"
        title="Active Secrets"
        value={stats.active}
        color="#16A34A"
      />

      <StatCard
        icon="❌"
        title="Expired Secrets"
        value={stats.expired ?? 0}
        color="#DC2626"
      />

      <StatCard
        icon="⏰"
        title="Expiring Soon"
        value={stats.expiring}
        color="#EA580C"
      />
    </div>
  );
}

export default Statistics;