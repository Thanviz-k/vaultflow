import { useState } from "react";
import { X } from "lucide-react";
import { createSecret } from "../api";

function SecretForm({ token, onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [error, setError] = useState("");

  const [showVaultKeyPrompt, setShowVaultKeyPrompt] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    // Name/value/expiry are ready — now ask for the Vault Key in a
    // separate popup before actually creating the secret.
    setShowVaultKeyPrompt(true);
  }

  async function handleVaultKeyConfirm(vaultKey) {
    const expiry =
      expiresInDays === "No-expire" ? null : Number(expiresInDays);

    await createSecret(name, value, vaultKey, expiry, token);

    setName("");
    setValue("");
    setExpiresInDays("30");
    setShowVaultKeyPrompt(false);

    if (onSuccess) {
      await onSuccess();
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create Secret</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Secret Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Stripe API Key"
            required
          />
        </div>
        <div className="form-group">
          <label>Secret Value</label>
          <input
            type="password"
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter API key, token, or database password"
            required
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label>Expiry</label>
          <select
            className="input"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
          >
            <option value="No-expire">No Expiry</option>
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
          </select>
        </div>
        {error && <p className="alert alert-danger">{error}</p>}
        <div className="modal-footer" style={{ padding: 0, borderTop: "none" }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn create-btn">
            Create Secret
          </button>
        </div>
      </form>

      {showVaultKeyPrompt && (
        <VaultKeyPromptModal
          onConfirm={handleVaultKeyConfirm}
          onClose={() => setShowVaultKeyPrompt(false)}
        />
      )}
    </div>
  );
}

// Popup shown only after the main Create Secret form is submitted.
// Asking for the Vault Key here (rather than inline in the form) keeps
// it visually and mentally separate from the secret's own name/value.
function VaultKeyPromptModal({ onConfirm, onClose }) {
  const [vaultKey, setVaultKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!vaultKey.trim()) return;

    setLoading(true);
    setError("");

    try {
      await onConfirm(vaultKey);
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
            <h2>Enter Vault Key</h2>
            <p>Your Vault Key is required to encrypt this secret.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Vault Key</label>
              <input
                type="password"
                className="input"
                value={vaultKey}
                onChange={(e) => setVaultKey(e.target.value)}
                placeholder="Enter your Vault Key"
                autoComplete="off"
                autoFocus
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
              className="btn create-btn"
              disabled={loading || !vaultKey.trim()}
            >
              {loading ? "Creating..." : "Create Secret"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SecretForm;