import { useState } from "react";
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

        <h2>Edit Secret</h2>

        <form onSubmit={handleUpdate}>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Secret Name"
            required
          />

          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="New Secret Value"
            required
          />

          <input
            type="password"
            value={vaultKey}
            onChange={(e) => setVaultKey(e.target.value)}
            placeholder="Vault Key"
            required
          />

          <select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
          >
            <option value="No-expire">No Expiry</option>
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
          </select>

          {error && (
            <p style={{ color: "red" }}>
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Secret"}
            </button>

            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default EditSecretModal;