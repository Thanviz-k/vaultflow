import { useState } from "react";

function VaultKeyModal({
  title = "Vault Key Verification",
  onSubmit,
  onCancel,
}) {
  const [vaultKey, setVaultKey] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!vaultKey.trim()) {
      alert("Please enter your Vault Key.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit(vaultKey);

      setVaultKey("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal vault-modal">

        <h2>{title}</h2>

        <p>
          Enter your Vault Key to continue.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="Vault Key"
            value={vaultKey}
            onChange={(e) =>
              setVaultKey(e.target.value)
            }
          />

          <div className="modal-actions">

            <button
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default VaultKeyModal;