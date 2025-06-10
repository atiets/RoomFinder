import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
  Container,
  Chip,
} from "@mui/material";
import {
  Payment,
  AccountBalance,
  QrCode,
  CreditCard,
  ArrowBack,
} from "@mui/icons-material";
import axios from "axios";
import { API_ENDPOINTS } from "../../redux/orderAPI";

// Payment service functions
const paymentService = {
  createPayment: async (paymentData, token) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.PAYMENT.CREATE,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Không thể tạo đơn thanh toán"
      );
    }
  },

  getPaymentStatus: async (orderId, token) => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.PAYMENT.STATUS}/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Không thể kiểm tra trạng thái thanh toán"
      );
    }
  },

  getPaymentHistory: async (token, params = {}) => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAYMENT.HISTORY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Không thể lấy lịch sử thanh toán"
      );
    }
  },
};

const PaymentPage = () => {
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = currentUser?.accessToken;
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Lấy thông tin từ URL params
  const planId = params.get("plan");
  const subscriptionId = params.get("subscriptionId");
  const title = params.get("title");
  const duration = params.get("duration") || "30 ngày";
  const price = Number(params.get("price")) || 0;
  const displayName = params.get("displayName");
  const features = params.get("features")?.split(",") || [];
  console.log("planId", planId);
  
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kiểm tra xem user có quyền truy cập không
  useEffect(() => {
    if (!currentUser || !accessToken) {
      navigate("/login");
      return;
    }
  }, [currentUser, accessToken, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const paymentMethods = [
    {
      value: "momo",
      label: "Ví MoMo",
      icon: <Payment />,
      description: "Thanh toán qua ví điện tử MoMo",
      available: true,
      image: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
    },
    {
      value: "vnpay",
      label: "VNPay",
      icon: <CreditCard />,
      description: "Thanh toán qua VNPay (ATM, Visa, MasterCard)",
      available: true,
      image:
        "https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg",
    },
  ];

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setError("");
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const paymentData = {
        planId: planId,
        subscriptionId: subscriptionId,
        paymentMethod: paymentMethod,
      };

      console.log("🔄 Processing payment:", paymentData);

      const response = await paymentService.createPayment(
        paymentData,
        accessToken,
        planId,
        subscriptionId
      );
      const { paymentUrl } = response.data;

      if (paymentUrl) {
        // Chuyển hướng đến trang thanh toán
        window.location.href = paymentUrl;
      } else {
        throw new Error("Không thể tạo link thanh toán");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Có lỗi xảy ra khi tạo đơn thanh toán");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !accessToken) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang kiểm tra quyền truy cập...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/subscription")}
          sx={{ mb: 2, color: "#4caf50" }}
        >
          Quay lại chọn gói
        </Button>

        <Typography
          variant="h3"
          fontWeight={700}
          align="center"
          gutterBottom
          sx={{ color: "#2e7d32" }}
        >
          🧾 Trang Thanh Toán
        </Typography>

        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Vui lòng kiểm tra kỹ thông tin trước khi tiến hành thanh toán.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Bên trái - Thông tin gói */}
        <Grid item xs={12} lg={7}>
          <Card elevation={3} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography 
                variant="h5" 
                fontWeight={600} 
                gutterBottom 
                sx={{ color: "#2e7d32", mb: 3 }}
              >
                📋 Thông tin gói dịch vụ
              </Typography>

              <Grid container spacing={3} alignItems="center">
                {/* Hình ảnh gói */}
                <Grid item xs={12} sm={5}>
                  <Box
                    component="img"
                    src="https://i.pinimg.com/736x/10/e3/1e/10e31ee7d4137394ff07d67d9477d2ef.jpg"
                    alt={title}
                    sx={{
                      width: "100%",
                      borderRadius: 2,
                      maxHeight: 200,
                      objectFit: 'cover'
                    }}
                  />
                </Grid>

                {/* Thông tin gói */}
                <Grid item xs={12} sm={7}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h6" fontWeight={700}>
                      {title}
                    </Typography>
                    <Chip label={duration} color="primary" variant="outlined" />
                  </Box>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {displayName}
                  </Typography>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body1">
                      Thời gian sử dụng: <strong>{duration}</strong>
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="#4caf50">
                      {formatPrice(price)}
                    </Typography>
                  </Box>

                  {features?.length > 0 && (
                    <Box>
                      <Typography variant="body1" fontWeight={600} gutterBottom>
                        Tính năng nổi bật:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {features.slice(0, 4).map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        ))}
                        {features.length > 4 && (
                          <Chip
                            label={`+${features.length - 4} tính năng khác`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* Tổng kết giá trị */}
              <Box
                sx={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 2,
                  p: 3,
                  mt: 3,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6" fontWeight={600}>
                      Tổng thanh toán:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography variant="h5" fontWeight={700} color="#ff9800">
                      {formatPrice(price)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bên phải - Phương thức thanh toán */}
        <Grid item xs={12} lg={5}>
          <Card elevation={3} sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography 
                variant="h5" 
                fontWeight={600} 
                gutterBottom 
                sx={{ color: "#2e7d32", mb: 3 }}
              >
                💳 Phương thức thanh toán
              </Typography>

              <RadioGroup
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                {paymentMethods.map((method) => (
                  <Card
                    key={method.value}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                      border:
                        paymentMethod === method.value
                          ? "2px solid #4caf50"
                          : "1px solid #e0e0e0",
                    }}
                  >
                    <FormControlLabel
                      value={method.value}
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" py={2} width="100%">
                          <Box sx={{ mr: 3 }}>
                            <img
                              src={method.image}
                              alt={method.label}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                          <Box flexGrow={1}>
                            <Typography variant="h6" fontWeight="medium">
                              {method.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{
                        margin: 0,
                        padding: 2,
                        width: "100%",
                        borderRadius: 1,
                      }}
                    />
                  </Card>
                ))}
              </RadioGroup>

              <Divider sx={{ my: 3 }} />

              {/* Tóm tắt đơn hàng */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Tóm tắt đơn hàng
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" color="text.secondary">
                    Gói dịch vụ
                  </Typography>
                  <Typography variant="body1">
                    {formatPrice(price)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={600}>
                    Tổng cộng
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#ff9800">
                    {formatPrice(price)}
                  </Typography>
                </Box>
              </Box>

              {/* Lưu ý thanh toán */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Sau khi thanh toán thành công, gói dịch vụ
                  sẽ được kích hoạt ngay lập tức.
                </Typography>
              </Alert>

              {/* Nút thanh toán */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !paymentMethod}
                onClick={handleConfirmPayment}
                startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                sx={{
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #4caf50 30%, #ff9800 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #388e3c 30%, #f57c00 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  },
                  "&:disabled": {
                    background: "#bdbdbd",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loading
                  ? "ĐANG XỬ LÝ..."
                  : `THANH TOÁN NGAY – ${formatPrice(price)}`}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PaymentPage;
