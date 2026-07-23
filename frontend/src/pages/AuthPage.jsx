import { useState } from "react";

import {
  createOwner,
  loginOwner,
} from "../api";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import StrengthMeter from "../components/ui/StrengthMeter";
import PasswordChecklist from "../components/ui/PasswordChecklist";
import Alert from "../components/ui/Alert";


function AuthPage({ setToken }) {

  // =========================
  // STATE
  // =========================

  const [isRegister, setIsRegister] =
    useState(false);

  const [registrationSuccess,
    setRegistrationSuccess] =
    useState(false);

  const [vaultKey,
    setVaultKey] =
    useState("");

  const [name,
    setName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [customPhrase,
    setCustomPhrase] =
    useState("");

  const [useCustomPhrase,
    setUseCustomPhrase] =
    useState(false);

  const [usedCustomPhrase, setUsedCustomPhrase] =
  useState(false);

  const [loading,
    setLoading] =
    useState(false);

  const [error,
    setError] =
    useState("");


  // =========================
  // LOGIN
  // =========================

  async function handleLogin(e) {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const data =
        await loginOwner(
          email,
          password
        );

      setToken(
        data.access_token
      );

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

// =========================
// REGISTER
// =========================


async function handleRegister(e) {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    await createOwner(
      name,
      email,
      password,
      useCustomPhrase ? "custom" : "generated"
    );

    alert("Account created successfully! Please login.");

    setName("");
    setEmail("");
    setPassword("");
    setCustomPhrase("");
    setUseCustomPhrase(false);

    setIsRegister(false);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

    
  // =========================
  // HELPERS
  // =========================

  function copyVaultKey() {

    navigator.clipboard.writeText(
      vaultKey
    );

  }

  function downloadVaultKey() {

    const blob =
      new Blob(
        [vaultKey],
        {
          type:
            "text/plain",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "vaultflow.key";

    link.click();

    URL.revokeObjectURL(
      url
    );

  }
  // =========================
  // SUCCESS SCREEN
  // =========================

  if (registrationSuccess) {

    return (

      <main className="auth-page">

        <Card className="auth-card">

          <h1>
  🎉 Account Created!
</h1>

{!usedCustomPhrase ? (

  <>

    <p>
      Your Vault Key has been generated successfully.
    </p>

    <div className="vault-key-box">

      <label>
        Vault Key
      </label>

      <textarea
        value={vaultKey}
        readOnly
        rows={4}
      />

    </div>

    <p className="vault-warning">

      ⚠️ Save this Vault Key safely.
      It will never be shown again.

    </p>

    <Button
      variant="secondary"
      onClick={copyVaultKey}
    >
      📋 Copy Vault Key
    </Button>

    <br />
    <br />

    <Button
      variant="secondary"
      onClick={downloadVaultKey}
    >
      ⬇ Download Again
    </Button>

  </>

) : (

  <>

    <p>

      ✅ Your custom Vault Key has been registered successfully.

    </p>

    <p className="vault-warning">

      ⚠️ Remember your custom Vault Key.
      It cannot be recovered if forgotten.

    </p>

  </>

)}

          <br />
          <br />

          <Button
            onClick={() => {

              setRegistrationSuccess(false);

              setIsRegister(false);

            }}
          >
            Continue to Login →
          </Button>

        </Card>

      </main>

    );

  }

  // =========================
  // MAIN UI
  // =========================

  return (

    <main className="auth-page">

      <Card className="auth-card">

        <h1>
          🔐 VaultFlow
        </h1>

        <p className="auth-subtitle">

          Secure Secrets.
          Simple Access.

        </p>

        {

          error && (

            <Alert type="error">

                  {error}

            </Alert>

          )

        }

        <h2>

          {

            isRegister

              ? "Create Account"

              : "Welcome Back"

          }

        </h2>

        <form

          onSubmit={

            isRegister

              ? handleRegister

              : handleLogin

          }

        >

          {

            isRegister && (

              <Input

                label="Name"

                value={name}

                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }

                placeholder="Enter your name"

                required

              />

            )

          }

          <Input

            label="Email"

            type="email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

            placeholder="you@example.com"

            required

          />

          <PasswordInput

            label="Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            placeholder="Enter your password"

            required

          />
          {
            isRegister && (
              <>
                <hr />

                <h3>
                  🔑 Vault Key
                </h3>

                <p className="auth-subtitle">
                  Choose how you want to protect
                  your encrypted secrets.
                </p>

                <label className="radio-option">
                  <input
                    type="radio"
                    checked={!useCustomPhrase}
                    onChange={() => setUseCustomPhrase(false)}
                  />
                  Generate Secure Vault Key ⭐ Recommended
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    checked={useCustomPhrase}
                    onChange={() => setUseCustomPhrase(true)}
                  />
                  Create My Own Vault Key
                </label>

                {useCustomPhrase && (
                  <>
                    <PasswordInput
                      label="Vault Key"
                      value={customPhrase}
                      onChange={(e) => setCustomPhrase(e.target.value)}
                      placeholder="Create your Vault Key"
                    />

                    <StrengthMeter value={customPhrase}/>


                    <PasswordChecklist value={customPhrase}/>

                  </>
                )}
              </>
            )
          }

          <Button

            type="submit"

            disabled={loading}

          >

            {

              loading

                ? "Please wait..."

                : isRegister

                  ? "Create Account"

                  : "Login"

            }

          </Button>
                    <p className="auth-switch">

            {

              isRegister

                ? "Already have an account?"

                : "New to VaultFlow?"

            }

            <button

              type="button"

              className="link-button"

              onClick={() => {

                setIsRegister(
                  !isRegister
                );

                setError("");

                setPassword("");

                setCustomPhrase("");

                setUseCustomPhrase(false);

              }}

            >

              {

                isRegister

                  ? "Login"

                  : "Create Account"

              }

            </button>

          </p>

        </form>

      </Card>

    </main>

  );

}

export default AuthPage;