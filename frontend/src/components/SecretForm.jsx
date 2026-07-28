import { useState } from "react";
import { createSecret } from "../api";

function SecretForm({ token, onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [vaultKey, setVaultKey] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const expiry =
        expiresInDays === "No-expire" ? null : Number(expiresInDays);

      await createSecret(name, value, vaultKey, expiry, token);

      setName("");
      setValue("");
      setVaultKey("");
      setExpiresInDays("30");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <label>Vault Key</label>
          <input
            type="password"
            className="input"
            value={vaultKey}
            onChange={(e) => setVaultKey(e.target.value)}
            placeholder="Enter your Vault Key"
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

          <button type="submit" className="btn create-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Secret"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SecretForm;
