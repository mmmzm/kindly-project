import { NavLink, useNavigate } from "react-router-dom";
import "../styles/admin-layout.css";

function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <p className="admin-sidebar-kicker">KINDLY ADMIN</p>
          <h1>관리자</h1>
        </div>

        <div className="admin-sidebar-user">
          <strong>{adminUser?.name || "관리자"}</strong>
          <span>{adminUser?.role || "ROLE 없음"}</span>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin/reservations"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            예약 관리
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            고객 관리
          </NavLink>

          <NavLink
            to="/admin/managers"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            관리자 관리
          </NavLink>
        </nav>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <p className="admin-main-kicker">ADMIN PAGE</p>
            <h2>{title}</h2>
          </div>
        </header>

        <section className="admin-main-content">{children}</section>
      </main>
    </div>
  );
}

export default AdminLayout;