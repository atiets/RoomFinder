import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// import './ResetPassword.css';
const ResetPassword = () => {
  document.title = "Đặt lại mật khẩu";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      const response = await axiosJWT.post(`/v1/auth/reset-password`, {
        token,
        newPassword,
      });
      setMessage(response.data); // Hiển thị thông báo thành công
      setTimeout(() => navigate("/login"), 2000); // Điều hướng về trang login sau 2 giây
    } catch (err) {
      setError(err.response?.data || "Có lỗi xảy ra!");
    }
  };
  return (
    <section className="forgot-password-container">
      <div className="form-main">
        <div className="form-content">
          <div className="form-wrapper">
            <div className="form-title">Quên mật khẩu</div>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Mật khẩu mới:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                />
              </div>
              <div className="form-group">
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                <div className="button-container">
                  <button type="submit">Đặt lại mật khẩu</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </section>
  );
};
export default ResetPassword;
