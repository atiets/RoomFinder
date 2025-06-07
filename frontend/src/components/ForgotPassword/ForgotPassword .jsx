// ForgotPassword.jsx
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { ArrowBack, Business, Email } from "@mui/icons-material";

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

const ForgotPassword = () => {
  document.title = "Quên mật khẩu";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useState(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      setMessage(response.data);
      toast.success("Yêu cầu đã được gửi thành công!");
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
              backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
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
                background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(30,30,30,0.7) 50%, rgba(0,0,0,0.8) 100%)",
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
                  width: "100%",
                }}
              >
                <Email 
                  sx={{ 
                    fontSize: 120, 
                    mb: 4,
                    color: "#4CAF50",
                    animation: `${floatAnimation} 3s ease-in-out infinite`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
                    "&:hover": {
                      transform: "scale(1.15)",
                      color: "#66BB6A",
                    }
                  }} 
                />
                
                <Box sx={{ animation: `${textReveal} 0.8s ease-out 0.3s both`, mb: 3 }}>
                  <Typography 
                    variant="h2" 
                    fontWeight="900" 
                    sx={{
                      color: "#ffffff",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      textShadow: "3px 3px 8px rgba(0,0,0,0.8), 1px 1px 4px rgba(0,0,0,0.9)",
                    }}
                  >
                    Khôi Phục
                  </Typography>
                </Box>
                
                <Box sx={{ animation: `${textReveal} 0.8s ease-out 0.6s both`, mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ 
                      color: "#ffffff",
                      fontSize: { xs: "1.2rem", md: "1.5rem" },
                      letterSpacing: "1px",
                      textShadow: "2px 2px 6px rgba(0,0,0,0.7), 1px 1px 3px rgba(0,0,0,0.8)",
                    }}
                  >
                    Lấy lại mật khẩu của bạn
                  </Typography>
                </Box>
                
                <Box sx={{ animation: `${textReveal} 0.8s ease-out 0.9s both` }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: { xs: "1rem", md: "1.25rem" },
                      textShadow: "2px 2px 6px rgba(0,0,0,0.7), 1px 1px 3px rgba(0,0,0,0.8)",
                      opacity: 0.95,
                    }}
                  >
                    📧 Nhập email để nhận hướng dẫn đặt lại mật khẩu 🔐
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
              onClick={() => navigate("/login")}
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
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                  },
                  transition: "all 0.6s ease",
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
                    Quên mật khẩu
                  </Typography>

                  <Box component="form" onSubmit={handleForgotPassword}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
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

                    {message && (
                      <Typography 
                        sx={{ 
                          mb: 2, 
                          color: "#2E7D32", 
                          textAlign: "center",
                          backgroundColor: "rgba(76, 175, 80, 0.1)",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(76, 175, 80, 0.3)"
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
                          border: "1px solid rgba(211, 47, 47, 0.3)"
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
                        mb: 3,
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
                      Gửi yêu cầu
                    </Button>

                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        Nhớ lại mật khẩu?{" "}
                        <Link
                          to="/login"
                          style={{
                            color: "#FF7043",
                            textDecoration: "none",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = "#F4511E";
                            e.target.style.textShadow = "0 2px 4px rgba(255,112,67,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#FF7043";
                            e.target.style.textShadow = "none";
                          }}
                        >
                          Đăng nhập ngay
                        </Link>
                      </Typography>
                    </Box>
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

export default ForgotPassword;