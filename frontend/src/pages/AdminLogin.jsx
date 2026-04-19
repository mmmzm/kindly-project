import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/admin-login.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!loginForm.username.trim()) {
      alert("관리자 아이디를 입력해주세요.");
      return false;
    }

    if (!loginForm.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const res = await axios.post("http://localhost:8080/admin/login", {
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      const adminData = res.data;

      localStorage.setItem("adminUser", JSON.stringify(adminData));

      alert(`${adminData.name}님, 로그인되었습니다.`);

      navigate("/admin/reservations");
    } catch (error) {
      console.error("관리자 로그인 실패:", error);

      const message =
        error.response?.data?.message ||
        "로그인 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-head">
          <p className="admin-login-kicker">ADMIN LOGIN</p>
          <h1>관리자 로그인</h1>
          <p className="admin-login-desc">
            관리자 계정으로 로그인 후 예약 현황을 확인할 수 있습니다.
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              name="username"
              value={loginForm.username}
              onChange={handleChange}
              placeholder="관리자 아이디를 입력해주세요"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              name="password"
              value={loginForm.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <div className="admin-login-notice">
            SUPER_ADMIN 또는 ADMIN 권한 계정만 로그인할 수 있습니다.
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p></p>
          <div className="admin-login-example">
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;