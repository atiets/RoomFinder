import { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../../redux/apiRequest";

const Register = () => {
  document.title = "Đăng ký";
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setErrorMessage("Địa chỉ email không hợp lệ!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    const newUser = {
      email: email,
      username: username,
      password: password,
    };

    registerUser(newUser, dispatch, navigate, setErrorMessage);
  };

  return (
    <section className="register-container">
      <div className="form-main">
        <div className="form-content">
          <div className="form-wrapper">
            <div className="form-title">Đăng ký</div>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Nhập email của bạn"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tên người dùng</label>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Nhập tên người dùng"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              <div className="form-group">
                <div className="form-center">
                  <button type="submit">Tạo tài khoản</button>
                </div>
              </div>
            </form>
            <div className="form-group">
              <div className="form-center">
                <div className="register-login">
                  Đã có tài khoản?
                  <Link className="register-login-link" to="/login">
                    {" "}
                    Đăng nhập{" "}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
