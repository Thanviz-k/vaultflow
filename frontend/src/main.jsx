import { StrictMode } from "react";
import "./styles.css";
import "./styles/variables.css";
import "./styles/layout.css";
import "./styles/components.css";
import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App.jsx";


createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);