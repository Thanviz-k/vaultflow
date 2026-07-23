import { useState } from "react";
import { initializeVault } from "../../api";

function VaultSetupModal({ token, onComplete }) {

  const [mode, setMode] = useState("generated");
  const [vaultKey, setVaultKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {

    setLoading(true);
    setError("");

    try {

      const result = await initializeVault(
        mode,
        vaultKey,
        token
      );

      if (result.generated_key) {
        alert(
          "Save this Vault Key safely:\n\n" +
          result.generated_key
        );
      }

      alert("Vault initialized successfully.");

      onComplete();

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="vault-modal-overlay">

      <div className="vault-modal">

        <h2>🔐 Setup Your Vault</h2>

        <p>
          Choose how you want to secure your Vault.
        </p>

        <label>

          <input
            type="radio"
            checked={mode === "generated"}
            onChange={() => setMode("generated")}
          />

          Generate Secure Vault Key

        </label>

        <label>

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
            placeholder="Enter your Vault Key"
            value={vaultKey}
            onChange={(e) =>
              setVaultKey(e.target.value)
            }
          />

        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
        >

          {loading
            ? "Initializing..."
            : "Initialize Vault"}

        </button>

      </div>

    </div>

  );

}

export default VaultSetupModal;