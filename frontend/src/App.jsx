import { useState } from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";


function App() {
  /*
    Load token from sessionStorage.

    This keeps the user logged in when the page
    is refreshed in the same browser tab/session.
  */

  const [token, setTokenState] = useState(
    () =>
      sessionStorage.getItem(
        "vaultflow_token"
      ) || ""
  );


  /*
    Save token after successful login.
  */

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


  /*
    Logout:
    1. Clear React state
    2. Remove stored token
  */

  function handleLogout() {
    setToken("");
  }


  return (
    <Routes>

      {/* LOGIN / REGISTER */}

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


      {/* REPORTS */}

      <Route
        path="/reports"
        element={
          token ? (
            <ReportsPage
              token={token}
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
            to={
              token
                ? "/dashboard"
                : "/"
            }
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;