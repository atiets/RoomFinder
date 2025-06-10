import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  Card,
  CardContent,
  Fade,
  keyframes,
} from "@mui/material";
import { ArrowBack, LockReset } from "@mui/icons-material";

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  25% { transform: translateY(-15px) rotate(2deg) scale(1.05); }
  50% { transform: translateY(-25px) rotate(0deg) scale(1.1); }
  75% { transform: translateY(-15px) rotate(-2deg) scale(1.05); }
`;

const textReveal = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const ResetPassword = () => {
  document.title = "Đặt lại mật khẩu";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useState(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    if (newPassword.length < 6) {
      setError("Mật khẩu phải từ 6 ký tự trở lên!");
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
      setMessage(response.data);
      toast.success("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data || "Có lỗi xảy ra!");
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      <Grid container sx={{ minHeight: "100vh" }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: "100vh",
              backgroundImage:
                "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(30,30,30,0.7) 50%, rgba(0,0,0,0.8) 100%)",
              },
            }}
          >
            <Fade in={loaded} timeout={1000}>
              <Box
                sx={{
                  position: "relative",
                  zIndex: 3,
                  textAlign: "center",
                  p: 4,
                  maxWidth: "600px",
                }}
              >
                <LockReset
                  sx={{
                    fontSize: 120,
                    mb: 4,
                    color: "#4CAF50",
                    animation: `${floatAnimation} 3s ease-in-out infinite`,
                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
                  }}
                />
                <Box sx={{ animation: `${textReveal} 0.8s ease-out 0.3s both`, mb: 3 }}>
                  <Typography
                    variant="h2"
                    fontWeight="900"
                    sx={{
                      color: "#fff",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      fontSize: { xs: "2.2rem", md: "2.7rem" },
                      textShadow: "3px 3px 8px rgba(0,0,0,0.8), 1px 1px 4px rgba(0,0,0,0.9)",
                    }}
                  >
                    Đặt lại mật khẩu
                  </Typography>
                </Box>
                <Box sx={{ animation: `${textReveal} 0.8s ease-out 0.6s both`, mb: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: "#fff",
                      fontSize: { xs: "1rem", md: "1.2rem" },
                      letterSpacing: "1px",
                      textShadow: "2px 2px 6px rgba(0,0,0,0.7)",
                    }}
                  >
                    Hãy đặt mật khẩu mới cho tài khoản của bạn
                  </Typography>
                </Box>
                <Box sx={{ animation: `${textReveal} 0.8s ease-out 0.9s both` }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: { xs: "0.95rem", md: "1.1rem" },
                      opacity: 0.95,
                    }}
                  >
                    🔒 Mật khẩu mới phải có ít nhất 6 ký tự
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)",
              position: "relative",
              p: 3,
            }}
          >
            <IconButton
              component={Link}
              to="/login"
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                background: "linear-gradient(45deg, #2E7D32 30%, #388E3C 90%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(46,125,50,0.4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1B5E20 30%, #2E7D32 90%)",
                  transform: "scale(1.1)",
                  boxShadow: "0 6px 20px rgba(46,125,50,0.6)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowBack />
            </IconButton>

            <Fade in={loaded} timeout={1200}>
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 450,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  borderRadius: 4,
                  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(46,125,50,0.1)",
                  transform: loaded ? "translateY(0)" : "translateY(30px)",
                  transition: "all 0.6s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h4"
                    align="center"
                    sx={{
                      mb: 4,
                      fontWeight: "bold",
                      background: "linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Đặt lại mật khẩu
                  </Typography>
                  <Box component="form" onSubmit={handleResetPassword}>
                    <TextField
                      fullWidth
                      label="Mật khẩu mới"
                      type="password"
                      variant="outlined"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&.Mui-focused fieldset": { borderColor: "#2E7D32", borderWidth: 2 },
                          "&:hover fieldset": { borderColor: "#4CAF50" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#2E7D32", fontWeight: "bold" },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu"
                      type="password"
                      variant="outlined"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu"
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&.Mui-focused fieldset": { borderColor: "#2E7D32", borderWidth: 2 },
                          "&:hover fieldset": { borderColor: "#4CAF50" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#2E7D32", fontWeight: "bold" },
                      }}
                    />
                    {message && (
                      <Typography
                        sx={{
                          mb: 2,
                          color: "#2E7D32",
                          textAlign: "center",
                          backgroundColor: "rgba(76, 175, 80, 0.1)",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(76, 175, 80, 0.3)",
                        }}
                      >
                        {message}
                      </Typography>
                    )}
                    {error && (
                      <Typography
                        sx={{
                          mb: 2,
                          color: "#d32f2f",
                          textAlign: "center",
                          backgroundColor: "rgba(211, 47, 47, 0.1)",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(211, 47, 47, 0.3)",
                        }}
                      >
                        {error}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        mb: 2,
                        py: 1.5,
                        background: "linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #1B5E20 30%, #2E7D32 90%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(46,125,50,0.4)",
                        },
                        fontSize: "16px",
                        fontWeight: "bold",
                        borderRadius: 3,
                        boxShadow: "0 4px 15px rgba(46,125,50,0.3)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Đặt lại mật khẩu
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Grid>
      </Grid>
      <ToastContainer position="top-right" autoClose={5000} />
    </Box>
  );
};

export default ResetPassword;