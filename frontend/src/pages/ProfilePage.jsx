import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  X,
} from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import VaultSetupModal from "../components/vault/VaultSetupModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";

import { getMyProfile, resetVault } from "../api";
import { formatDate } from "../utils/formatDate";

function ProfilePage({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showChangeKey, setShowChangeKey] = useState(false);
  const [showVaultSetup, setShowVaultSetup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getMyProfile(token);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleVaultReplaced() {
    setShowVaultSetup(false);
    loadProfile();
  }

  if (loading) {
    return <LoadingSpinner text="Loading Profile..." />;
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <AppLayout title="Profile" onLogout={onLogout}>
      <div className="dashboard-page">
        <div className="dashboard-hero">
          <div>
            <h1>Your Profile</h1>
            <p>View your account details and manage your Vault Key.</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2 className="card-title">
              <UserCircle size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Account Details
            </h2>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail-item">
              <UserCircle size={18} />
              <div>
                <small>NAME</small>
                <strong>{profile.name}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <Mail size={18} />
              <div>
                <small>EMAIL</small>
                <strong>{profile.email}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <CalendarDays size={18} />
              <div>
                <small>MEMBER SINCE</small>
                <strong>{formatDate(profile.created_at)}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              {profile.vault_initialized ? (
                <ShieldCheck size={18} color="#16A34A" />
              ) : (
                <ShieldAlert size={18} color="#D97706" />
              )}
              <div>
                <small>VAULT STATUS</small>
                <strong>
                  {profile.vault_initialized ? "Initialized" : "Not Set Up"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card danger-zone">
          <div className="card-header">
            <h2 className="card-title">
              <KeyRound size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Vault Key
            </h2>
          </div>

          <p className="card-description">
            Your Vault Key encrypts every secret you store. VaultFlow never
            stores it in a recoverable form, so it cannot be reset or
            recovered on your behalf.
          </p>

          <div className="alert alert-warning" style={{ marginTop: 16 }}>
            <span>⚠️</span>
            <span>
              Changing your Vault Key requires wiping your current vault.
              <strong> All existing secrets will be permanently deleted and
              cannot be recovered</strong> — there is no way to re-encrypt
              them with a new key without the old one.
            </span>
          </div>

          <div className="modal-footer" style={{ padding: 0, borderTop: "none", justifyContent: "flex-start", marginTop: 20 }}>
            <button
              className="btn btn-danger"
              onClick={() => setShowChangeKey(true)}
              disabled={!profile.vault_initialized}
            >
              <KeyRound size={18} />
              Change Vault Key
            </button>
          </div>

          {!profile.vault_initialized && (
            <p className="card-description" style={{ marginTop: 10 }}>
              Your vault isn't set up yet, so there's no key to change. Set
              one up from the Dashboard first.
            </p>
          )}
        </div>
      </div>

      {showChangeKey && (
        <ChangeVaultKeyModal
          token={token}
          onClose={() => setShowChangeKey(false)}
          onConfirmed={() => {
            setShowChangeKey(false);
            setShowVaultSetup(true);
          }}
        />
      )}

      {showVaultSetup && (
        <VaultSetupModal
          token={token}
          onInitialized={handleVaultReplaced}
        />
      )}
    </AppLayout>
  );
}

function ChangeVaultKeyModal({ token, onClose, onConfirmed }) {
  const [vaultKey, setVaultKey] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const CONFIRM_PHRASE = "DELETE MY SECRETS";
  const canSubmit =
    vaultKey.trim().length > 0 && confirmText === CONFIRM_PHRASE;

  async function handleConfirm(e) {
    e.preventDefault();

    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      await resetVault(vaultKey, token);
      onConfirmed();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>
              <AlertTriangle size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Change Vault Key
            </h2>
            <p>This will permanently delete all of your current secrets.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="modal-body">
            <div className="alert alert-danger">
              <span>❌</span>
              <span>
                This action cannot be undone. Every secret in your vault will
                be permanently and irreversibly deleted the moment you
                confirm.
              </span>
            </div>

            <div className="form-group">
              <label>Current Vault Key</label>
              <input
                type="password"
                className="input"
                value={vaultKey}
                onChange={(e) => setVaultKey(e.target.value)}
                placeholder="Enter your current Vault Key"
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Type <strong>{CONFIRM_PHRASE}</strong> to confirm
              </label>
              <input
                className="input"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                autoComplete="off"
                required
              />
            </div>

            {error && <p className="alert alert-danger">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-danger"
              disabled={!canSubmit || loading}
            >
              {loading ? "Deleting Secrets..." : "Delete Secrets & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
