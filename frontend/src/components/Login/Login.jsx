import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, googleLogin } from "../../redux/apiRequest";
import { GoogleLogin } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  document.title = "Đăng nhập";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.login.currentUser);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.admin === true) {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const userData = { username, password };
    await loginUser(userData, dispatch, navigate, setErrorMessage);
  };

  const handleGoogleLogin = (response) => {
    if (response.error) {
      console.log("Lỗi đăng nhập Google:", response.error);
    } else {
      const { credential } = response;
      googleLogin(credential, dispatch, navigate)
        .then(() => toast.success("Đăng nhập Google thành công"))
        .catch((err) => {
          toast.error("Lỗi khi đăng nhập Google.");
          console.error("Lỗi khi đăng nhập Google:", err);
        });
    }
  };

  return (
    <section className="login-container">
      <div className="form-main">
        <div className="form-content">
          <div className="form-wrapper">
            <span
              className="back-arrow"
              onClick={() => navigate("/")}
              aria-label="Quay lại trang chủ"
            >
              ←
            </span>

            <div className="form-title"> Đăng nhập</div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Tên đăng nhập:</label>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mật khẩu:</label>
                <div className="input-container">
                  <input
                    className="password"
                    type={showPassword ? "text" : "password"} // Thay đổi type dựa trên showPassword
                    placeholder="Nhập mật khẩu"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)} // Thay đổi trạng thái showPassword
                  >
                    <span> {showPassword ? "🙈" : "👁️"}</span>
                  </p>
                </div>
              </div>
              <div className="form-group">
                <div className="error-message">
                  <p>{errorMessage}</p>
                </div>
                <div className="button-container">
                  <button type="submit"> Đăng nhập </button>
                </div>
              </div>
              <div className="form-group">
                <div className="form-center">
                  <div className="login-register">
                    <Link className="login-register-link" to="/forgot-password">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="form-line">
                  <p>Hoặc</p>
                </div>
                <div className="form-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.log("Lỗi đăng nhập Google")}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="form-center">
                  <div className="login-register">
                    Chưa có tài khoản? <br />
                    <Link className="login-register-link" to="/register">
                      Đăng ký ngay
                    </Link>
                  </div>
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

export default Login;
