import AdminLayout from "../components/AdminLayout";

function AdminManagers() {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const isSuperAdmin = adminUser?.role === "SUPER_ADMIN";

  return (
    <AdminLayout title="관리자 관리">
      {!isSuperAdmin ? (
        <div className="admin-denied-box">
          해당 페이지는 <strong>SUPER_ADMIN</strong> 권한만 접근할 수 있습니다.
        </div>
      ) : (
        <div className="admin-card">
          <p className="admin-placeholder">
            슈퍼 관리자 전용 페이지다.
            <br />
            다음 단계에서 관리자 계정 조회 / 추가 / 삭제 기능을 붙이면 된다.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminManagers;