import axios from "axios"; // Sử dụng axios để gọi API
import { useState } from "react";
import { ToastContainer } from "react-toastify";
// import './ForgotPassword.css';

const ForgotPassword = () => {
  document.title = "Quên mật khẩu";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email) {
      setError("Vui lòng nhập email!");
      return;
    }
    try {
      const response = await axiosJWT.post(`/v1/auth/forgot-password`, {
        email,
      });
      setMessage(response.data); // Hiển thị thông báo thành công từ backend
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
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                />
              </div>
              <div className="form-group">
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                <div className="button-container">
                  <button type="submit">Gửi yêu cầu</button>
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
export default ForgotPassword;
