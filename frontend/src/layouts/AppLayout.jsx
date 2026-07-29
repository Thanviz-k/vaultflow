import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";

function AppLayout({
  title,
  children,
  onLogout,
  token,
}) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar
          title={title}
          onLogout={onLogout}
          token={token}
        />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
