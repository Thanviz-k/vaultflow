import AppLayout from "../layouts/AppLayout";

function SettingsPage({ onLogout }) {
  return (
    <AppLayout
      title="Settings"
      onLogout={onLogout}
    >
      <div className="page-card">

        <h1>⚙️ Settings</h1>

        <p>
          Configure your VaultFlow preferences.
        </p>

        <hr />

        <h3>Coming Soon</h3>

        <ul>
          <li>🌙 Dark Mode</li>
          <li>🔔 Notification Preferences</li>
          <li>🔑 Change Password</li>
          <li>📧 Email Preferences</li>
          <li>🛡 Security Settings</li>
          <li>📤 Export Data</li>
        </ul>

      </div>
    </AppLayout>
  );
}

export default SettingsPage;