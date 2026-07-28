import { useState } from "react";
import { initializeVault } from "../../api";

export default function VaultSetupModal({ token, onInitialized }) {
  const [mode, setMode] = useState("generated");
  const [vaultKey, setVaultKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInitialize = async () => {
    setError("");

    if (mode === "custom" && vaultKey.trim().length < 8) {
      setError("Vault key must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const data = await initializeVault(
        mode,
        mode === "custom" ? vaultKey : null,
        token
      );

      if (mode === "generated" && data.generated_vault_key) {
        const generatedKey = data.generated_vault_key;

        // Auto download — happens immediately, no extra click needed
        const fileContent = `====================================
VaultFlow Vault Key
====================================

Vault Key:
${generatedKey}

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

        // Best-effort auto copy (some browsers block clipboard writes
        // outside a direct user gesture, so this can silently no-op)
        try {
          await navigator.clipboard.writeText(generatedKey);
          setCopied(true);
        } catch {
          // ignore — copy button below still works
        }
      }

      if (onInitialized) {
        onInitialized();
      }
    } catch (err) {
      setError(err.message || "Failed to initialize vault.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">🔐 Set Up Your Vault</span>
        </div>

        <div className="modal-body">
          <p className="card-description">
            Your Vault Key encrypts every secret you store. Choose
            how you want it created.
          </p>

          <label className="radio-option">
            <input
              type="radio"
              checked={mode === "generated"}
              onChange={() => setMode("generated")}
            />
            Generate Secure Vault Key ⭐ Recommended
          </label>

          <label className="radio-option">
            <input
              type="radio"
              checked={mode === "custom"}
              onChange={() => setMode("custom")}
            />
            Use My Own Vault Key
          </label>

          {mode === "custom" && (
            <input
              type="password"
              className="input"
              placeholder="Enter your Vault Key"
              value={vaultKey}
              onChange={(e) => setVaultKey(e.target.value)}
            />
          )}

          {error && <p className="alert alert-danger">{error}</p>}

          {copied && (
            <p className="alert alert-success">
              Vault Key copied to clipboard and downloaded.
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={handleInitialize}
            disabled={loading}
          >
            {loading ? "Initializing..." : "Initialize Vault"}
          </button>
        </div>
      </div>
    </div>
  );
}
