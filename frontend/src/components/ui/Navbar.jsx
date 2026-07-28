import {
  LogOut,
  Bell,
  UserCircle
} from "lucide-react";

function Navbar({ title, onLogout }) {

  return (

    <header className="navbar">

      <div>

        <h1>{title}</h1>

      </div>

      <div className="navbar-actions">

        <button className="btn btn-icon">

          <Bell size={20} />

        </button>

        <button className="btn btn-icon">

          <UserCircle size={22} />

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