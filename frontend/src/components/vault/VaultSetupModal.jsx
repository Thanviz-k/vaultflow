import { useState } from "react";
import { initializeVault } from "../../api";

export default function VaultSetupModal({
  open,
  token,
  onInitialized,
}) {
  const [mode, setMode] = useState("generated");
  const [vaultKey, setVaultKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

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

      // Auto copy
      await navigator.clipboard.writeText(generatedKey);

      // Auto download
      const fileContent = `====================================
VaultFlow Vault Key
====================================

Vault Key:
${generatedKey}

IMPORTANT:
• Keep this key safe.
• VaultFlow cannot recover it if lost.
====================================
`;

      const blob = new Blob([fileContent], {
        type: "text/plain",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "vaultflow-vault-key.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    if (onInitialized) {
      onInitialized();
    }
  } catch (err) {
    setError(
      err?.response?.data?.detail ||
        "Failed to initialize vault."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold mb-2">
          Initialize Your Vault
        </h2>

        <p className="text-gray-600 mb-6">
          Your vault must be initialized before storing secrets.
        </p>

        <div className="space-y-4">

          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={mode === "generated"}
              onChange={() => setMode("generated")}
            />
            <span>Generate Secure Vault Key</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={mode === "custom"}
              onChange={() => setMode("custom")}
            />
            <span>Use My Own Vault Key</span>
          </label>

          {mode === "custom" && (
            <input
              type="password"
              placeholder="Enter Vault Key"
              className="w-full border rounded-lg px-3 py-2"
              value={vaultKey}
              onChange={(e) => setVaultKey(e.target.value)}
            />
          )}

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-60"
          >
            {loading ? "Initializing..." : "Initialize Vault"}
          </button>

        </div>

      </div>
    </div>
  );
}