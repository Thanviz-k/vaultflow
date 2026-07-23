import { useState } from "react";
import { createSecret } from "../api";

function SecretForm({ token, onSecretCreated }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [vaultKey, setVaultKey] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const expiry =
        expiresInDays === "No-expire"
          ? null
          : Number(expiresInDays);

      const data = await createSecret(
        name,
        value,
        vaultKey,
        expiry,
        token
      );

      setResult(data);

      setName("");
      setValue("");
      setVaultKey("");
      setExpiresInDays("30");

      if (onSecretCreated) {
        await onSecretCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Create Secret</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label>Secret Name</label>
          <br />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Secret Value</label>
          <br />
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter API key, token, or database password"
            required
            autoComplete="off"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Vault Key</label>
          <br />
          <input
            type="password"
            value={vaultKey}
            onChange={(e) => setVaultKey(e.target.value)}
            placeholder="Enter your Vault Key"
            required
            autoComplete="off"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Expiry</label>
          <br />
          <select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="No-expire">No Expiry</option>
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Secret"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {result && (
        <div className="secret-result">
          <div className="success-badge">
            ✓ Secret Created Successfully
          </div>

          <div className="result-row">
            <span>Secret ID</span>
            <code>{result.id}</code>
          </div>

          <div className="result-row">
            <span>Name</span>
            <strong>{result.name}</strong>
          </div>

          <div className="result-row">
            <span>Message</span>
            <strong>{result.message}</strong>
          </div>

          <div className="result-row">
            <span>Expires</span>
            <strong>
              {result.expires_at
                ? new Date(result.expires_at).toLocaleString()
                : "No Expiry"}
            </strong>
          </div>
        </div>
      )}
    </section>
  );
}

export default SecretForm;