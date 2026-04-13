import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

function AdminManagers() {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const isSuperAdmin = adminUser?.role === "SUPER_ADMIN";

  const [managers, setManagers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [managerForm, setManagerForm] = useState({
    userId: null,
    username: "",
    password: "",
    name: "",
    phone: "",
    role: "ADMIN",
  });

  const selectedManager = useMemo(
    () => managers.find((item) => item.userId === selectedUserId) || null,
    [managers, selectedUserId]
  );

  const formatPhone = (phone) => {
    const only = String(phone || "").replace(/-/g, "").trim();
    if (only.length !== 11) return phone;
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
  };

  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:8080/admin/managers");
      setManagers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("관리자 목록 조회 실패:", error);
      const message =
        error.response?.data?.message || "관리자 목록을 불러오는 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchManagers();
  }, [isSuperAdmin]);

  const handleSelectRow = (userId) => {
    setSelectedUserId((prev) => (prev === userId ? null : userId));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setManagerForm({
      userId: null,
      username: "",
      password: "",
      name: "",
      phone: "",
      role: "ADMIN",
    });
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    if (!selectedManager) {
      alert("수정할 관리자를 선택해주세요.");
      return;
    }

    alert("수정 기능은 다음 단계에서 연결합니다.");
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setManagerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!managerForm.username.trim()) {
      alert("아이디를 입력해주세요.");
      return false;
    }

    if (!managerForm.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return false;
    }

    if (!/^[가-힣a-zA-Z]{2,10}$/.test(managerForm.name.trim())) {
      alert("이름은 한글 또는 영문 2~10자로 입력해주세요.");
      return false;
    }

    if (!managerForm.phone.trim()) {
      alert("연락처를 입력해주세요.");
      return false;
    }

    const normalizedPhone = managerForm.phone.replace(/-/g, "").trim();

    if (!/^010\d{8}$/.test(normalizedPhone)) {
      alert("연락처는 010으로 시작하는 11자리 숫자로 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        username: managerForm.username.trim(),
        password: managerForm.password.trim(),
        name: managerForm.name.trim(),
        phone: managerForm.phone.replace(/-/g, "").trim(),
        role: managerForm.role,
      };

      const res = await axios.post(
        "http://localhost:8080/admin/managers",
        payload
      );

      alert(res.data?.message || "관리자 계정이 등록되었습니다.");

      setIsModalOpen(false);
      setSelectedUserId(null);
      await fetchManagers();
    } catch (error) {
      console.error("관리자 등록 실패:", error);
      const message =
        error.response?.data?.message || "관리자 등록 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedManager) {
      alert("삭제할 관리자를 선택해주세요.");
      return;
    }

    if (selectedManager.userId === adminUser?.userId) {
      alert("현재 로그인한 계정은 삭제할 수 없습니다.");
      return;
    }

    const confirmed = window.confirm(
      `${selectedManager.name} (${selectedManager.username}) 계정을 삭제하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(selectedManager.userId);

      const res = await axios.delete(
        `http://localhost:8080/admin/managers/${selectedManager.userId}`,
        {
          params: {
            loginUserId: adminUser?.userId,
          },
        }
      );

      alert(res.data?.message || "관리자 계정이 삭제되었습니다.");
      setSelectedUserId(null);
      await fetchManagers();
    } catch (error) {
      console.error("관리자 삭제 실패:", error);
      const message =
        error.response?.data?.message || "관리자 삭제 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setDeletingUserId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout title="관리자 관리">
        <div className="admin-denied-box">
          해당 페이지는 <strong>SUPER_ADMIN</strong> 권한만 접근할 수 있습니다.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="관리자 관리">
      <div className="admin-manager-page">
        <section className="admin-card admin-manager-board-card">
          <div className="admin-section-head">
            <h3>관리자 목록</h3>
            <p>관리자를 선택한 뒤 수정 또는 삭제할 수 있습니다.</p>
          </div>

          <div className="admin-manager-toolbar">
            <button
              type="button"
              className="admin-manager-toolbar-btn primary"
              onClick={openCreateModal}
            >
              등록
            </button>

            <button
              type="button"
              className="admin-manager-toolbar-btn"
              onClick={openEditModal}
              disabled={!selectedManager}
            >
              수정
            </button>

            <button
              type="button"
              className="admin-manager-toolbar-btn dark"
              onClick={handleDelete}
              disabled={!selectedManager || deletingUserId !== null}
            >
              {deletingUserId && selectedManager?.userId === deletingUserId
                ? "삭제 중..."
                : "삭제"}
            </button>
          </div>

          <div className="admin-manager-table-wrap">
            <table className="admin-manager-table">
              <thead>
                <tr>
                  <th className="check-col"></th>
                  <th>이름</th>
                  <th>아이디</th>
                  <th>연락처</th>
                  <th>권한</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="admin-manager-empty-row">
                      관리자 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                ) : managers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-manager-empty-row">
                      등록된 관리자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  managers.map((manager) => {
                    const isSelected = selectedUserId === manager.userId;

                    return (
                      <tr
                        key={manager.userId}
                        className={isSelected ? "selected" : ""}
                        onClick={() => handleSelectRow(manager.userId)}
                      >
                        <td
                          className="check-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(manager.userId)}
                          />
                        </td>

                        <td>{manager.name}</td>
                        <td>{manager.username}</td>
                        <td>{formatPhone(manager.phone)}</td>
                        <td>
                          <span
                            className={`admin-manager-role-badge ${
                              manager.role === "SUPER_ADMIN" ? "super" : ""
                            }`}
                          >
                            {manager.role}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {isModalOpen && (
          <div className="admin-manager-modal-overlay" onClick={closeModal}>
            <div
              className="admin-manager-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-manager-modal-head">
                <div>
                  <p className="admin-sidebar-kicker">CREATE MANAGER</p>
                  <h3>관리자 등록</h3>
                </div>

                <button
                  type="button"
                  className="admin-manager-modal-close"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </div>

              <form className="admin-manager-form" onSubmit={handleSubmit}>
                <div className="admin-manager-field">
                  <label htmlFor="manager-username">아이디</label>
                  <input
                    id="manager-username"
                    type="text"
                    name="username"
                    value={managerForm.username}
                    onChange={handleChange}
                    placeholder="아이디를 입력해주세요"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="admin-manager-field">
                  <label htmlFor="manager-password">비밀번호</label>
                  <input
                    id="manager-password"
                    type="password"
                    name="password"
                    value={managerForm.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력해주세요"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="admin-manager-field">
                  <label htmlFor="manager-name">이름</label>
                  <input
                    id="manager-name"
                    type="text"
                    name="name"
                    value={managerForm.name}
                    onChange={handleChange}
                    placeholder="이름을 입력해주세요"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="admin-manager-field">
                  <label htmlFor="manager-phone">연락처</label>
                  <input
                    id="manager-phone"
                    type="text"
                    name="phone"
                    value={managerForm.phone}
                    onChange={handleChange}
                    placeholder="01012345678"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="admin-manager-field">
                  <label htmlFor="manager-role">권한</label>
                  <select
                    id="manager-role"
                    name="role"
                    value={managerForm.role}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div className="admin-manager-notice">
                  기본 권한은 <strong>ADMIN</strong>으로 두는 것을 권장합니다.
                  <br />
                  <strong>SUPER_ADMIN</strong>은 관리자 계정 관리 및 주요 설정
                  변경 권한을 가집니다.
                </div>

                <div className="admin-manager-modal-actions">
                  <button
                    type="button"
                    className="admin-manager-toolbar-btn"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    취소
                  </button>

                  <button
                    type="submit"
                    className="admin-manager-toolbar-btn primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "등록 중..." : "등록"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminManagers;