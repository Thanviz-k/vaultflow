import { useState } from "react";

import { createOwner, loginOwner } from "../api";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import PasswordChecklist from "../components/ui/PasswordChecklist";
import StrengthMeter from "../components/ui/StrengthMeter";
import Alert from "../components/ui/Alert";

function AuthPage({ setToken }) {
  // =========================
  // STATE
  // =========================

  const [isRegister, setIsRegister] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOGIN
  // =========================

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await loginOwner(email, password);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
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
      await createOwner(name, email, password, "generated");

      setAccountCreated(true);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    setAccountCreated(false);
    setIsRegister(false);
    setError("");
  }

  // =========================
  // SUCCESS SCREEN
  // =========================

  if (accountCreated) {
    return (
      <main className="auth-page">
        <Card className="auth-card">
          <h1>🎉 Account Created!</h1>

          <p className="auth-subtitle">
            Log in, then set up your Vault Key on the dashboard.
            That's the key that encrypts your secrets — you'll get
            the option to auto-generate and download it there.
          </p>

          <Button onClick={goToLogin}>Continue to Login →</Button>
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
        <h1>🔐 VaultFlow</h1>

        <p className="auth-subtitle">
          Secure Secrets. Simple Access.
        </p>

        {error && <Alert type="error">{error}</Alert>}

        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>

        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {isRegister && password && (
            <>
              <StrengthMeter value={password} />
              <PasswordChecklist value={password} />
            </>
          )}

          <Button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Account"
              : "Login"}
          </Button>

          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to VaultFlow?"}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setPassword("");
              }}
            >
              {isRegister ? "Login" : "Create Account"}
            </button>
          </p>
        </form>
      </Card>
    </main>
  );
}

export default AuthPage;