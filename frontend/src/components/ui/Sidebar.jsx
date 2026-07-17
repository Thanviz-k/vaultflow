import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  KeyRound,
  ChartColumn,
  Bot,
  Settings
} from "lucide-react";

function Sidebar() {

  const location = useLocation();
  
    const menuItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  {
    label: "Secrets",
    icon: <KeyRound size={20} />,
    path: "/secrets",
  },
  {
    label: "Analytics",
    icon: <ChartColumn size={20} />,
    path: "/reports",
  },
  {
    label: "AI Assistant",
    icon: <Bot size={20} />,
    path: "/ai",
  },
  {
    label: "Settings",
    icon: <Settings size={20} />,
    path: "/settings",
  },
];

  

  return (

    <aside className="sidebar">

      <h2>

        🔐 VaultFlow

      </h2>

      {

        menuItems.map((item) => (

          <Link

            key={item.path}

            to={item.path}

            className={

              location.pathname === item.path

                ? "sidebar-item active"

                : "sidebar-item"

            }

          >

            <span className="sidebar-icon">

  {item.icon}

</span>

<span className="sidebar-text">

  {item.label}

</span>

          </Link>

        ))

      }

    </aside>

  );

}

export default Sidebar;