import { useState } from "react";
import { initializeVault } from "../../api";

export default function VaultSetupModal({ token, onInitialized }) {
  const [mode, setMode] = useState("generated");
  const [vaultKey, setVaultKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // Once a key is generated, we stop and force the user to confirm
  // they've saved it before letting them continue — regardless of
  // whether the auto-download/auto-copy actually worked.
  const [revealedKey, setRevealedKey] = useState(null);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const handleInitialize = async () => {
    setError("");

    if (!acknowledged) {
      setError("Please confirm you understand the Vault Key warning above.");
      return;
    }

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

        try {
          await navigator.clipboard.writeText(generatedKey);
          setCopied(true);
        } catch {
          // ignore — the key is also shown on screen below as a fallback
        }

        // Show the key on screen and stop here — don't call
        // onInitialized() until the user confirms they've saved it.
        setRevealedKey(generatedKey);
        setLoading(false);
        return;
      }

      // Custom-key mode: the user already knows their key, so there's
      // nothing to reveal/confirm — proceed immediately.
      if (onInitialized) {
        onInitialized();
      }
    } catch (err) {
      setError(err.message || "Failed to initialize vault.");
    } finally {
      setLoading(false);
    }
  };

  async function handleCopyAgain() {
    try {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
    } catch {
      // clipboard blocked — the key is still visible on screen
    }
  }

  function handleContinue() {
    if (!savedConfirmed) {
      setError("Please confirm you've saved your Vault Key before continuing.");
      return;
    }
    if (onInitialized) {
      onInitialized();
    }
  }

  const WARNING = (
    <div className="alert alert-danger" style={{ marginBottom: 16 }}>
      <strong>⚠️ There is no way to recover your secrets if you lose this
      Vault Key.</strong> VaultFlow never stores it. If you forget it, your
      only option is to reset your vault, which permanently deletes every
      secret in it.
    </div>
  );

  // --- Step 2: key generated, force confirmation before continuing ---
  if (revealedKey) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title">🔐 Save Your Vault Key</span>
          </div>

          <div className="modal-body">
            {WARNING}

            <label>Your Vault Key</label>
            <input
              type="text"
              className="input"
              value={revealedKey}
              readOnly
              onFocus={(e) => e.target.select()}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyAgain}
            >
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
              I've saved my Vault Key somewhere safe (password manager,
              offline note, etc.)
            </label>

            {error && <p className="alert alert-danger">{error}</p>}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={!savedConfirmed}
            >
              Continue to VaultFlow
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 1: choose how the key is created ---
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

          {WARNING}

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

          <label className="checkbox-option" style={{ marginTop: 16 }}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            I understand losing my Vault Key means permanent loss of all
            my secrets
          </label>

          {error && <p className="alert alert-danger">{error}</p>}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={handleInitialize}
            disabled={loading || !acknowledged}
          >
            {loading ? "Initializing..." : "Initialize Vault"}
          </button>
        </div>
      </div>
    </div>
  );
}