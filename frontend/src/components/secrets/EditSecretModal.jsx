import { useState } from "react";
import { X, Pencil } from "lucide-react";
import { updateSecret } from "../../api";

function EditSecretModal({
  secret,
  token,
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState(secret.name);
  const [value, setValue] = useState("");
  const [vaultKey, setVaultKey] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const expiry =
        expiresInDays === "No-expire"
          ? null
          : Number(expiresInDays);

      await updateSecret(
        secret.id,
        name,
        value,
        vaultKey,
        expiry,
        token
      );

      onSuccess();
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
              <Pencil size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Edit Secret
            </h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="modal-body">
            <div className="form-group">
              <label>Secret Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Secret Name"
                required
              />
            </div>

            <div className="form-group">
              <label>New Secret Value</label>
              <input
                type="password"
                className="input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="New Secret Value"
                autoComplete="off"
                required
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
                autoComplete="off"
                required
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
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Secret"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSecretModal;
