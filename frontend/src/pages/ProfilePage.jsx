import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  HelpCircle,
  X,
} from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import VaultSetupModal from "../components/vault/VaultSetupModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";

import { getMyProfile, rotateVaultKey, forceResetVault } from "../api";
import { formatDate } from "../utils/formatDate";

function ProfilePage({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showChangeKey, setShowChangeKey] = useState(false);
  const [showForgotKey, setShowForgotKey] = useState(false);
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

          <div className="alert alert-info" style={{ marginTop: 16 }}>
            <span>🔐</span>
            <span>
              Changing your Vault Key re-encrypts all of your existing
              secrets under the new key.
              <strong> Your secrets are kept — nothing is deleted</strong> as
              long as you know your current Vault Key.
            </span>
          </div>

          <div
            className="modal-footer"
            style={{
              padding: 0,
              borderTop: "none",
              justifyContent: "flex-start",
              marginTop: 20,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-danger"
              onClick={() => setShowChangeKey(true)}
              disabled={!profile.vault_initialized}
            >
              <KeyRound size={18} />
              Change Vault Key
            </button>

            <button
              className="btn btn-outline"
              onClick={() => setShowForgotKey(true)}
              disabled={!profile.vault_initialized}
            >
              <HelpCircle size={18} />
              Forgot Vault Key?
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
            loadProfile();
          }}
        />
      )}

      {showForgotKey && (
        <ForgotVaultKeyModal
          token={token}
          onClose={() => setShowForgotKey(false)}
          onConfirmed={() => {
            setShowForgotKey(false);
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

// Used when the owner KNOWS their current Vault Key and wants to change it.
// This re-encrypts every secret under the new key — nothing is deleted.
// If the new key is auto-generated, we force a "confirm you saved it" step
// before closing, same pattern as initial vault setup.
function ChangeVaultKeyModal({ token, onClose, onConfirmed }) {
  const [currentVaultKey, setCurrentVaultKey] = useState("");
  const [mode, setMode] = useState("generated");
  const [newVaultKey, setNewVaultKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [revealedKey, setRevealedKey] = useState(null);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const canSubmit =
    currentVaultKey.trim().length > 0 &&
    (mode === "generated" || newVaultKey.trim().length >= 8);

  async function downloadAndCopyKey(key) {
    const fileContent = `====================================
VaultFlow Vault Key
====================================

Vault Key:
${key}

IMPORTANT:
- Keep this key safe.
- VaultFlow cannot recover it if lost.
====================================
`;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vaultflow-vault-key.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
    } catch {
      // ignore — the key is still shown/typed by the user as a fallback
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const data = await rotateVaultKey(
        currentVaultKey,
        mode,
        mode === "custom" ? newVaultKey.trim() : null,
        token
      );

      if (mode === "generated" && data.generated_vault_key) {
        await downloadAndCopyKey(data.generated_vault_key);
        // Force confirmation before closing, same as initial vault setup
        setRevealedKey(data.generated_vault_key);
        setLoading(false);
        return;
      }

      // Custom key: auto-download it too, then we're done
      if (mode === "custom") {
        await downloadAndCopyKey(newVaultKey.trim());
      }

      onConfirmed();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyAgain() {
    try {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
    } catch {
      // clipboard blocked — the key is still visible on screen
    }
  }

  // --- Step 2: generated key shown, force confirmation before closing ---
  if (revealedKey) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <div>
              <h2>
                <KeyRound size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Save Your New Vault Key
              </h2>
              <p>Your secrets have already been re-encrypted with this key.</p>
            </div>
          </div>

          <div className="modal-body">
            <div className="alert alert-danger">
              <span>⚠️</span>
              <span>
                There is no way to recover your secrets if you lose this
                Vault Key. VaultFlow never stores it.
              </span>
            </div>

            <div className="form-group">
              <label>Your New Vault Key</label>
              <input
                type="text"
                className="input"
                value={revealedKey}
                readOnly
                onFocus={(e) => e.target.select()}
              />
            </div>

            <button type="button" className="btn btn-secondary" onClick={handleCopyAgain}>
              Copy Vault Key
            </button>

            {copied && (
              <p className="alert alert-success">
                Vault Key copied to clipboard and downloaded as
                vaultflow-vault-key.txt.
              </p>
            )}

            <label className="checkbox-option" style={{ marginTop: 16 }}>
              <input
                type="checkbox"
                checked={savedConfirmed}
                onChange={(e) => setSavedConfirmed(e.target.checked)}
              />
              I've saved my new Vault Key somewhere safe.
            </label>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-primary"
              disabled={!savedConfirmed}
              onClick={onConfirmed}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 1: enter current key, choose how the new key is created ---
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>
              <KeyRound size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Change Vault Key
            </h2>
            <p>Your secrets will be re-encrypted with the new key. Nothing is deleted.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="modal-body">
            <div className="form-group">
              <label>Current Vault Key</label>
              <input
                type="password"
                className="input"
                value={currentVaultKey}
                onChange={(e) => setCurrentVaultKey(e.target.value)}
                placeholder="Enter your current Vault Key"
                autoComplete="off"
                autoFocus
                required
              />
            </div>

            <label className="radio-option">
              <input
                type="radio"
                checked={mode === "generated"}
                onChange={() => setMode("generated")}
              />
              Generate Secure New Vault Key ⭐ Recommended
            </label>

            <label className="radio-option">
              <input
                type="radio"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
              />
              Use My Own New Vault Key
            </label>

            {mode === "custom" && (
              <input
                type="password"
                className="input"
                placeholder="Enter your new Vault Key (min 8 characters)"
                value={newVaultKey}
                onChange={(e) => setNewVaultKey(e.target.value)}
              />
            )}

            {error && <p className="alert alert-danger">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || loading}
            >
              {loading ? "Changing Vault Key..." : "Change Vault Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Used when the owner does NOT remember their current Vault Key.
// There is no field to enter it — verification against a key you don't
// remember is impossible, and without the old key there is no way to
// re-encrypt existing secrets, cryptographically. The only safe action is
// a full DELETE, gated by the owner's authenticated session (JWT) plus a
// typed confirm phrase. This is the one place secrets genuinely can't be
// preserved — hence the "reset" / "delete" language stays here.
function ForgotVaultKeyModal({ token, onClose, onConfirmed }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const CONFIRM_PHRASE = "DELETE MY SECRETS";
  const canSubmit = confirmText === CONFIRM_PHRASE;

  async function handleConfirm(e) {
    e.preventDefault();

    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      await forceResetVault(token);
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
              <HelpCircle size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Forgot Vault Key
            </h2>
            <p>
              Since you don't remember your Vault Key, it can't be verified.
              The only option is to wipe your vault and set a new key.
            </p>
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
                confirm, and there is no way to recover them afterward.
              </span>
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
                autoFocus
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