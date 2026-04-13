import AdminLayout from "../components/AdminLayout";

function AdminCustomers() {
  return (
    <AdminLayout title="고객 관리">
      <div className="admin-card">
        <p className="admin-placeholder">
          여기가 고객 관리 메인 페이지다.
          <br />
          다음 단계에서 고객별 예약 이력, 노쇼 횟수, 노쇼율,
          지연 알림 이력, 시간대별 예약 집중도 같은 내용을 넣으면 된다.
        </p>
      </div>
    </AdminLayout>
  );
}

export default AdminCustomers;