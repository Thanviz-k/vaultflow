import { useState } from "react";
import {
  createOwner,
  loginOwner,
} from "../api";


function AuthPage({ setToken }) {
  const [isRegister, setIsRegister] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginOwner(
        email,
        password
      );

      setToken(data.access_token);

    } catch (error) {
      setError(error.message);

    } finally {
      setLoading(false);
    }
  }


  async function handleRegister(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createOwner(
        name,
        email,
        password
      );

      setIsRegister(false);
      setName("");
      setPassword("");

    } catch (error) {
      setError(error.message);

    } finally {
      setLoading(false);
    }
  }


  function switchMode() {
    setIsRegister(!isRegister);
    setError("");
    setPassword("");
  }


  return (
    <main className="auth-page">

      <div className="auth-brand">
        <div className="brand-icon">
          🔐
        </div>

        <h1>VaultFlow</h1>

        <p>
          Secure secrets. Simple access.
        </p>
      </div>


      <section className="auth-card">

        <h2>
          {isRegister
            ? "Create Account"
            : "Welcome Back"}
        </h2>


        <p className="auth-subtitle">
          {isRegister
            ? "Create your VaultFlow account"
            : "Sign in to access your vault"}
        </p>


        <form
          onSubmit={
            isRegister
              ? handleRegister
              : handleLogin
          }
        >

          {isRegister && (
            <div className="auth-field">

              <label>
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                required
              />

            </div>
          )}


          <div className="auth-field">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
            />

          </div>


          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              required
            />

          </div>


          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>

        </form>


        <p className="auth-switch">

          {isRegister
            ? "Already have an account?"
            : "New user?"}


          <button
            type="button"
            onClick={switchMode}
          >
            {isRegister
              ? "Login"
              : "Create account"}
          </button>

        </p>

      </section>

    </main>
  );
}


export default AuthPage;