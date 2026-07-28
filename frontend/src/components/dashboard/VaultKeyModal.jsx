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
            className="input"
            placeholder="Vault Key"
            value={vaultKey}
            autoFocus
            onChange={(e) =>
              setVaultKey(e.target.value)
            }
          />

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
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