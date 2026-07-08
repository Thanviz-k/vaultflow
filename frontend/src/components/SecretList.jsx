import { useState } from "react";

import {
  revokeSecret,
  revealSecret,
} from "../api";


function SecretList({
  secrets,
  token,
  onSecretRevoked,
}) {
  const [
    revokingId,
    setRevokingId,
  ] = useState(null);

  const [
    revealId,
    setRevealId,
  ] = useState(null);

  const [
    clientHalves,
    setClientHalves,
  ] = useState({});

  const [
    revealedValues,
    setRevealedValues,
  ] = useState({});

  const [
    revealingId,
    setRevealingId,
  ] = useState(null);

  const [
    copiedId,
    setCopiedId,
  ] = useState(null);

  const [error, setError] =
    useState("");


  async function handleRevoke(
    secretId
  ) {
    setError("");
    setRevokingId(secretId);

    try {
      await revokeSecret(
        secretId,
        token
      );

      if (onSecretRevoked) {
        await onSecretRevoked();
      }

    } catch (error) {
      setError(error.message);

    } finally {
      setRevokingId(null);
    }
  }


  async function handleReveal(
    secretId
  ) {
    const clientHalf =
      clientHalves[secretId];

    if (!clientHalf?.trim()) {
      setError(
        "Enter the client half first."
      );

      return;
    }

    setError("");
    setRevealingId(secretId);

    try {
      const data = await revealSecret(
        secretId,
        clientHalf.trim(),
        token
      );

      setRevealedValues(
        (previous) => ({
          ...previous,
          [secretId]: data.value,
        })
      );

    } catch (error) {
      setError(error.message);

    } finally {
      setRevealingId(null);
    }
  }


  function handleHide(secretId) {
    setRevealedValues(
      (previous) => {
        const updated = {
          ...previous,
        };

        delete updated[secretId];

        return updated;
      }
    );
  }


  async function handleCopy(
    secretId,
    value
  ) {
    await navigator.clipboard.writeText(
      value
    );

    setCopiedId(secretId);

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  }


  if (secrets.length === 0) {
    return (
      <p>
        No secrets created yet.
      </p>
    );
  }


  return (
    <div className="secret-list">

      {error && (
        <p className="secret-error">
          {error}
        </p>
      )}


      {secrets.map((secret) => {

        const isRevealOpen =
          revealId === secret.id;

        const revealedValue =
          revealedValues[secret.id];


        return (
          <article
            key={secret.id}
            className={
              `secret-card status-${secret.status}`
            }
          >

            <div className="secret-card-header">

              <div>
                <h3>
                  {secret.name}
                </h3>

                <span
                  className={
                    `status-badge ${secret.status}`
                  }
                >
                  {secret.status}
                </span>
              </div>

            </div>


            <div className="secret-details">

              <p>
                <strong>
                  Created:
                </strong>{" "}

                {new Date(
                  secret.created_at
                ).toLocaleString()}
              </p>


              <p>
                <strong>
                  Expires:
                </strong>{" "}

                {secret.expires_at
                  ? new Date(
                      secret.expires_at
                    ).toLocaleString()
                  : "No Expiry"}
              </p>

            </div>


            {secret.status ===
              "active" && (

              <div className="secret-actions">

                <button
                  type="button"
                  className="reveal-button"
                  onClick={() => {
                    setError("");

                    setRevealId(
                      isRevealOpen
                        ? null
                        : secret.id
                    );
                  }}
                >
                  {isRevealOpen
                    ? "CLOSE REVEAL"
                    : "REVEAL SECRET"}
                </button>


                <button
                  type="button"
                  className="revoke-button"
                  disabled={
                    revokingId ===
                    secret.id
                  }
                  onClick={() =>
                    handleRevoke(
                      secret.id
                    )
                  }
                >
                  {revokingId ===
                  secret.id
                    ? "REVOKING..."
                    : "REVOKE"}
                </button>

              </div>
            )}


            {isRevealOpen &&
              secret.status ===
                "active" && (

              <div className="reveal-panel">

                <label>
                  Client Half
                </label>


                <div className="reveal-input-row">

                  <input
                    type="password"
                    value={
                      clientHalves[
                        secret.id
                      ] || ""
                    }
                    onChange={(e) =>
                      setClientHalves(
                        (previous) => ({
                          ...previous,

                          [secret.id]:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Paste your client half"
                    autoComplete="off"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      handleReveal(
                        secret.id
                      )
                    }
                    disabled={
                      revealingId ===
                      secret.id
                    }
                  >
                    {revealingId ===
                    secret.id
                      ? "VERIFYING..."
                      : "UNLOCK"}
                  </button>

                </div>


                {revealedValue !==
                  undefined && (

                  <div className="revealed-secret">

                    <div>
                      <span>
                        DECRYPTED VALUE
                      </span>

                      <code>
                        {revealedValue}
                      </code>
                    </div>


                    <div className="revealed-actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            secret.id,
                            revealedValue
                          )
                        }
                      >
                        {copiedId ===
                        secret.id
                          ? "COPIED ✓"
                          : "COPY"}
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          handleHide(
                            secret.id
                          )
                        }
                      >
                        HIDE
                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}

          </article>
        );
      })}

    </div>
  );
}


export default SecretList;