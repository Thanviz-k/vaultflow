import { LogOut, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ title, onLogout }) {

  const navigate = useNavigate();

  return (

    <header className="navbar">

      <div className="navbar-left">

        <h1>{title}</h1>

        <p>
          Manage and protect your encrypted secrets securely.
        </p>

      </div>

      <div className="navbar-actions">

        <button
          className="ai-btn"
          onClick={() => navigate("/ai")}
        >
          <Bot size={18} />
          Ask AI
        </button>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </header>

  );

}

export default Navbar;