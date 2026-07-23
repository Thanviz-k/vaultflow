import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import SecretsPage from "./pages/SecretsPage";
import SettingsPage from "./pages/SettingsPage";
import AIAssistantPage from "./pages/AIAssistantPage";

function App() {

  const [token, setTokenState] = useState(
    () => sessionStorage.getItem("vaultflow_token") || ""
  );

  function setToken(newToken) {

    setTokenState(newToken);

    if (newToken) {
      sessionStorage.setItem(
        "vaultflow_token",
        newToken
      );
    } else {
      sessionStorage.removeItem(
        "vaultflow_token"
      );
    }

  }

  function handleLogout() {
    setToken("");
  }

  return (

    <Routes>

      {/* LOGIN */}

      <Route
        path="/"
        element={
          token ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <AuthPage
              setToken={setToken}
            />
          )
        }
      />

      {/* DASHBOARD */}

      <Route
        path="/dashboard"
        element={
          token ? (
            <DashboardPage
              token={token}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate
              to="/"
              replace
            />
          )
        }
      />

      

      {/* AI ASSISTANT */}

      <Route
        path="/ai"
        element={
          token ? (
            <AIAssistantPage
              token={token}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate
              to="/"
              replace
            />
          )
        }
      />

      

      {/* SETTINGS */}

      <Route
        path="/settings"
        element={
          token ? (
            <SettingsPage
              token={token}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate
              to="/"
              replace
            />
          )
        }
      />

      {/* UNKNOWN ROUTES */}

      <Route
        path="*"
        element={
          <Navigate
            to={token ? "/dashboard" : "/"}
            replace
          />
        }
      />

    </Routes>

  );

}

export default App;