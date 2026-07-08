import { useState } from "react";

import {
  createSecret,
} from "../api";



function SecretForm({
  token,
  onSecretCreated,
}) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const [
    expiresInDays,
    setExpiresInDays,
  ] = useState("30");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


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
        expiry,
        token
      );


      setResult(data);

      setName("");


      if (onSecretCreated) {
        await onSecretCreated();
      }

    } catch (error) {
      setError(error.message);

    } finally {
      setLoading(false);
    }
  }


  return (
    <section>
      <h2>Create Secret</h2>


      <form onSubmit={handleSubmit}>

        <div
          style={{
            marginBottom: "12px",
          }}
        >
          <label>
            Secret Name
          </label>

          <br />

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "8px",
            }}
          />
        </div>
          <div
  style={{
    marginBottom: "12px",
  }}
>
  <label>
    Secret Value
  </label>

  <br />

  <input
    type="password"
    value={value}
    onChange={(e) =>
      setValue(e.target.value)
    }
    placeholder="Enter API key, token, or database password"
    required
    autoComplete="off"
    style={{
      width: "100%",
      padding: "8px",
    }}
  />
</div>

        <div
          style={{
            marginBottom: "12px",
          }}
        >

          <label>
            Expiry
          </label>

          <br />

          <select
            value={expiresInDays}
            onChange={(e) =>
              setExpiresInDays(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "8px",
            }}
          >
            <option value="No-expire">
              No Expiry
            </option>

            <option value="1">
              1 Day
            </option>

            <option value="7">
              7 Days
            </option>

            <option value="15">
              15 Days
            </option>

            <option value="30">
              30 Days
            </option>
          </select>
        </div>


        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Secret"}
        </button>

      </form>


      {error && (
        <p>{error}</p>
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

          <div className="client-half-box">
            <div>
              <strong>Client Half</strong>

              <p className="warning-text">
                Save this now. You may need it to verify
                the secret later.
              </p>
            </div>

            <div className="copy-row">
              <code>{result.client_half}</code>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    result.client_half
                  );

                  alert("Client Half copied!");
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <div className="result-row">
            <span>Expires</span>

            <strong>
              {result.expires_at
                ? new Date(
                    result.expires_at
                  ).toLocaleString()
                : "No Expiry"}
            </strong>
          </div>
        </div>
      )}

    </section>
  );
}

export default SecretForm;