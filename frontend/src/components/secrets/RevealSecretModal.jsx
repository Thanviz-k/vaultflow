import { useState } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  X,
  ShieldCheck,
} from "lucide-react";

import { revealSecret } from "../../api";

function RevealSecretModal({

  secret,

  token,

  onClose,

}) {

  const [vaultKey, setVaultKey] =
    useState("");

  const [revealedSecret,
    setRevealedSecret] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [error,
    setError] =
    useState("");

  const [showVaultKey,
    setShowVaultKey] =
    useState(false);

  const [showSecret,
    setShowSecret] =
    useState(false);

  async function handleReveal() {

    setLoading(true);

    setError("");

    try {

      const data =
        await revealSecret(

          secret.id,

          vaultKey,

          token,

        );

      setRevealedSecret(
        data.value
      );

      setShowSecret(true);

    }

    catch (err) {

      setError(
        err.message
      );

    }

    finally {

      setLoading(false);

    }

  }

  function copySecret() {

    navigator.clipboard.writeText(
      revealedSecret
    );

  }
    return (

    <div className="modal-overlay">

      <div className="modal">

        <div className="modal-header">

          <div>

            <h2>

              <ShieldCheck size={22} />

              Reveal Secret

            </h2>

            <p>

              Enter the Vault Key used when this secret was created.

            </p>

          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >

            <X size={20} />

          </button>

        </div>

        <div className="input-group">

          <label>

            Vault Key

          </label>

          <div className="password-wrapper">

            <input
              type={
                showVaultKey
                  ? "text"
                  : "password"
              }
              value={vaultKey}
              onChange={(e) =>
                setVaultKey(e.target.value)
              }
              placeholder="Enter your Vault Key"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowVaultKey(
                  !showVaultKey
                )
              }
            >

              {showVaultKey
                ? <EyeOff size={18} />
                : <Eye size={18} />}

            </button>

          </div>

        </div>

        {error && (

          <div className="alert-error">

            {error}

          </div>

        )}

        <button
          className="primary-btn"
          onClick={handleReveal}
          disabled={loading}
        >

          {loading
            ? "Revealing..."
            : "Reveal Secret"}

        </button>

        {revealedSecret && (

          <>

            <hr />

            <div className="input-group">

              <label>

                Secret

              </label>

              <div className="password-wrapper">

                <input
                  readOnly
                  type={
                    showSecret
                      ? "text"
                      : "password"
                  }
                  value={revealedSecret}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowSecret(
                      !showSecret
                    )
                  }
                >

                  {showSecret
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}

                </button>

              </div>

            </div>

            <button
              className="secondary-btn"
              onClick={copySecret}
            >

              <Copy size={18} />

              Copy Secret

            </button>

          </>

        )}

      </div>

    </div>

  );

}

export default RevealSecretModal;

 