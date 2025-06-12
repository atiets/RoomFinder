import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/apiRequest";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Fade,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Person, Lock, Home } from "@mui/icons-material";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const [visible, setVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // State cho form đăng nhập
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const userData = { username, password };
    try {
      await loginUser(userData, dispatch, navigate, (message) => {
        if (message) {
          toast.error(message);
          setErrorMessage(message);
        } else {
          toast.success("Đăng nhập thành công!");
        }
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đã xảy ra lỗi trong quá trình đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu người dùng đã đăng nhập, hiển thị thông báo chào mừng
  if (currentUser) {
    return (
      <Box className="footer-signup-section">
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in={visible} timeout={1000}>
            <Box className="signup-wrapper">
              <Typography
                variant="h5"
                sx={{
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#4CAF50",
                  mb: 2,
                }}
              >
                Chào mừng, {currentUser.username}!
              </Typography>
              <Typography
                variant="body1"
                sx={{ textAlign: "center", color: "#666", mb: 3 }}
              >
                Bạn đã đăng nhập thành công. Khám phá và đăng tin cho thuê trọ
                ngay hôm nay.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/AddPost")}
                sx={{
                  display: "block",
                  mx: "auto",
                  mb: 3,
                  background:
                    "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 16px rgba(76, 175, 80, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)",
                    boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                  },
                }}
              >
                Đăng tin ngay
              </Button>
              <Box className="illustration-section">
                <img
                  loading="lazy"
                  src="https://marketing-assets.wheniwork-production.com/2020/01/16143317/footer-group-illustration-optimized.svg"
                  alt="drawing of employees at work cheering and waving"
                  className="illustration-img"
                />
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="footer-signup-section">
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
        <Fade in={visible} timeout={1000}>
          <Box className="signup-wrapper">
            {/* Main Title */}
            <Typography
              variant="h4"
              className="main-title"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 600,
                color: "#333",
                textAlign: "center",
                mb: 1,
                lineHeight: 1.3,
              }}
            >
              Đăng bài cho thuê trọ miễn phí!{" "}
            </Typography>

            {/* Form Section */}
            {/* Form Section */}
            <Box
              className="form-section"
              component="form"
              onSubmit={handleLogin}
            >
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                {/* Username Input */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Tên đăng nhập"
                    size="medium"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "#999", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        fontSize: "0.95rem",
                        "&:hover fieldset": {
                          borderColor: "#4CAF50",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4CAF50",
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Password Input */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    placeholder="Mật khẩu"
                    size="medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "#999", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword}
                            edge="end"
                            size="small"
                            sx={{ color: "#666" }}
                          >
                            {showPassword ? (
                              <span style={{ fontSize: "16px" }}>🙈</span>
                            ) : (
                              <span style={{ fontSize: "16px" }}>👁️</span>
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        fontSize: "0.95rem",
                        "&:hover fieldset": {
                          borderColor: "#4CAF50",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4CAF50",
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Login Button */}
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={isLoading}
                    onMouseEnter={() => setHoveredButton("login")}
                    onMouseLeave={() => setHoveredButton(null)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #FFA726 0%, #FF8F00 100%)",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 16px rgba(255, 167, 38, 0.3)",
                      transition: "all 0.3s ease",
                      transform:
                        hoveredButton === "login"
                          ? "translateY(-2px)"
                          : "translateY(0)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #FF8F00 0%, #E65100 100%)",
                        boxShadow: "0 6px 20px rgba(255, 167, 38, 0.4)",
                      },
                      "&.Mui-disabled": {
                        background:
                          "linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)",
                        color: "rgba(255,255,255,0.7)",
                      },
                    }}
                  >
                    {isLoading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
                  </Button>
                </Grid>
              </Grid>

              {/* Error Message */}
              {errorMessage && (
                <Typography color="error" align="center" sx={{ mt: 1, mb: 1 }}>
                  {errorMessage}
                </Typography>
              )}

              {/* OR Divider - Thêm lại phần này */}
              <Box className="or-separator">
                <Typography
                  variant="body2"
                  sx={{
                    color: "#999",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    background: "#f8f9fa",
                    padding: "0 16px",
                  }}
                >
                  HOẶC
                </Typography>
              </Box>

              {/* Register Button (Center) */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/register")}
                  disabled={isLoading}
                  onMouseEnter={() => setHoveredButton("register")}
                  onMouseLeave={() => setHoveredButton(null)}
                  sx={{
                    minWidth: "200px",
                    borderColor: "#4CAF50",
                    color: "#4CAF50",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      borderColor: "#4CAF50",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(76, 175, 80, 0.3)",
                    },
                  }}
                >
                  <Home sx={{ mr: 1, fontSize: 18 }} />
                  Đăng ký miễn phí
                </Button>
              </Box>
            </Box>

            {/* Illustration Section */}
            <Box className="illustration-section">
              <img
                loading="lazy"
                src="https://marketing-assets.wheniwork-production.com/2020/01/16143317/footer-group-illustration-optimized.svg"
                alt="drawing of employees at work cheering and waving"
                className="illustration-img"
              />
            </Box>
          </Box>
        </Fade>
      </Container>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default Signup;
