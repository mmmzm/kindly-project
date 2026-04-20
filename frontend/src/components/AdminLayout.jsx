import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/admin-layout.css";

function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleDownloadDashboard = async () => {
    try {
      setIsDownloading(true);

      const response = await fetch("http://localhost:8080/admin/excel/report", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("엑셀 다운로드 실패");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Kindly_운영대시보드.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("대시보드 다운로드 실패:", error);
      alert("대시보드 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
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
        </div>

        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-report-btn"
            onClick={handleDownloadDashboard}
            disabled={isDownloading}
          >
            {isDownloading ? "다운로드 중..." : "대시보드 다운로드"}
          </button>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
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