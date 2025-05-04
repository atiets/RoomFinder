import React from "react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import qr_bidv from "../../../../assets/images/qr_bidv.png";
import Swal from "sweetalert2";

const BankTransferPage = () => {
  const location = useLocation();
  const { orderCode, amount, planId } = location.state || {};
  const formattedAmount = amount?.toLocaleString("vi-VN") + "đ";
  const [activeTab, setActiveTab] = useState("chuyenkhoan");
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15 * 60);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Navigate khi hết thời gian
          navigate("/upgrade-plan", {
            state: {
              errorMessage: "⏰ Đơn hàng đã hết hạn. Vui lòng đặt lại đơn mới.",
            },
          });
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
  };

  const handleConfirmPayment = () => {
    Swal.fire({
      title: "Bạn đã chuyển khoản thành công?",
      text: "Sau khi nhận được chuyển khoản, hệ thống sẽ ghi nhận thanh toán của bạn trong vòng 5 phút.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Tiếp tục",
      cancelButtonText: "Quay lại",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/payment-success");
        navigate("/upgrade-plan", {
          state: {
            successMessage:
              "Thanh toán thành công! Gói của bạn đã được nâng cấp.",
          },
        });
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/v1/orders/${orderCode}`);
      const data = await res.json();
      if (data.paid) {
        navigate("/payment-success");
        navigate("/upgrade-plan", {
          state: {
            successMessage:
              "Thanh toán thành công! Gói của bạn đã được nâng cấp.",
          },
        });
      }
    }, 5000); // kiểm tra mỗi 5 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <Box display="flex" justifyContent="center" p={2} marginTop={10}>
      <Grid container spacing={2} maxWidth="lg">
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight={700}
          align="center"
          gutterBottom
          sx={{ color: "#2e7d32" }}
          fontSize={40}
          mb={3}
          width="100%"
        >
          Thanh toán qua chuyển khoản ngân hàng
        </Typography>

        {/* Left Panel */}
        <Grid item xs={12} md={5}>
          <Box p={3} bgcolor="#f0fff4" borderRadius={2} boxShadow={1}>
            <Typography
              variant="h6"
              gutterBottom
              color="#28a745"
              fontWeight="bold"
            >
              THÔNG TIN THANH TOÁN
            </Typography>
            <Divider sx={{ mb: 2, borderColor: "#a8e6a3" }} />

            <Typography gutterBottom color="#28a745" fontWeight="bold">
              Mã đơn hàng
            </Typography>
            <Typography variant="h5" fontWeight={600} mb={2} color="#2d6a4f">
              {orderCode}
            </Typography>

            <Typography gutterBottom color="#28a745" fontWeight="bold">
              Thành tiền
            </Typography>
            <Typography variant="h5" fontWeight={700} mb={3} color="#2d6a4f">
              {formattedAmount}
            </Typography>

            <Typography mt={1} fontSize={14} color="#6c757d" textAlign="center">
              Nếu bạn đã chuyển khoản thành công,
              <br />
              vui lòng nhấn “Xác nhận thanh toán”
            </Typography>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "#28a745",
                "&:hover": { bgcolor: "#218838" },
              }}
              onClick={handleConfirmPayment}
            >
              Xác nhận thanh toán
            </Button>

            <Typography color="error" mt={3} fontWeight={500}>
              Đơn hàng sẽ hết hạn sau:{" "}
              <span style={{ fontWeight: 700 }}>{formatTime(countdown)}</span>
            </Typography>

            <Typography mt={2} variant="body2" color="#ff914d">
              (*) Phòng trọ xinh không hoàn tiền cho các giao dịch phát sinh do
              lỗi hoặc nhầm lẫn từ phía khách hàng.
              <br />
              (**) Bạn có thể yêu cầu xuất hóa đơn trong Chi tiết đơn hàng trên
              mục Lịch sử giao dịch trong cùng ngày chuyển khoản.
            </Typography>

            <Box mt={2} sx={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
              <Typography color="#28a745" fontWeight={600}>
                Quay về
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} md={7}>
          <Box p={3} bgcolor="#fff7e6" borderRadius={2} boxShadow={1}>
            {/* Tabs */}
            <Box display="flex" justifyContent="center" mb={2}>
              <Button
                variant={activeTab === "qr" ? "contained" : "text"}
                onClick={() => setActiveTab("qr")}
                sx={{
                  fontWeight: 600,
                  color: activeTab === "qr" ? "#fff" : "#28a745", // Màu chữ xanh lá khi không được chọn, trắng khi chọn
                  backgroundColor:
                    activeTab === "qr" ? "#28a745" : "transparent", // Màu nền xanh lá khi được chọn
                  "&:hover": { backgroundColor: "#28a745", color: "#fff" }, // Màu hover xanh lá
                }}
              >
                Quét mã QR
              </Button>
              <Button
                variant={activeTab === "chuyenkhoan" ? "contained" : "text"}
                onClick={() => setActiveTab("chuyenkhoan")}
                sx={{
                  fontWeight: 600,
                  ml: 2,
                  color: activeTab === "chuyenkhoan" ? "#fff" : "#28a745", // Màu chữ xanh lá khi không được chọn, trắng khi chọn
                  backgroundColor:
                    activeTab === "chuyenkhoan" ? "#28a745" : "transparent", // Màu nền xanh lá khi được chọn
                  "&:hover": { backgroundColor: "#28a745", color: "#fff" }, // Màu hover xanh lá
                }}
              >
                Thông tin chuyển khoản
              </Button>
            </Box>
            {/* Nội dung của tab */}
            {activeTab === "chuyenkhoan" ? (
              <Box p={3} bgcolor="#ffffff" borderRadius={2}>
                <Box display="flex" alignItems="center" mb={2}>
                  <img
                    src="https://logos-world.net/wp-content/uploads/2023/02/BIDV-Logo.png"
                    alt="bank logo"
                    style={{ width: 60, height: 40, marginRight: 10 }}
                  />
                  <Box>
                    <Typography fontWeight={600}>BIDV BANK</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)
                    </Typography>
                  </Box>
                </Box>

                <Box mb={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Tên tài khoản
                  </Typography>
                  <Typography>NGUYEN ANH TUYET</Typography>
                </Box>

                <Box mb={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Số tài khoản
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography>96247PHONGTROXINH</Typography>
                  </Box>
                </Box>

                <Box mb={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Số tiền (VND)
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography>{formattedAmount}</Typography>
                    <Typography
                      color="#28a745"
                      fontWeight={500}
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleCopy(formattedAmount)}
                    >
                      Sao chép
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Nội dung chuyển khoản
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography>{orderCode}</Typography>
                    <Typography
                      color="#28a745"
                      fontWeight={500}
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleCopy(orderCode)}
                    >
                      Sao chép
                    </Typography>
                  </Box>
                </Box>

                <Box mt={2} p={2} bgcolor="#fff3cd" borderRadius={1}>
                  <Typography variant="body2" color="#856404">
                    ✨ Để đảm bảo giao dịch được xử lý thành công, vui lòng nhập
                    đúng nội dung chuyển khoản
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box p={3} bgcolor="#ffffff" borderRadius={2} textAlign="center">
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Quét mã QR để thanh toán
                </Typography>

                <img
                  src={qr_bidv}
                  alt="QR Code"
                  style={{ width: 200, height: 200, marginBottom: 20 }}
                />

                <Typography variant="body1" fontWeight={500}>
                  Sử dụng ứng dụng ngân hàng có chức năng{" "}
                  <img
                    src="https://static.chotot.com/storage/virtual_account/qrcode_icon.svg"
                    alt="QR Icon"
                    style={{
                      width: 18,
                      height: 18,
                      verticalAlign: "middle",
                      margin: "0 4px",
                    }}
                  />
                  QR Code để quét mã
                </Typography>

                <Box mt={3} p={2} bgcolor="#fff3cd" borderRadius={1}>
                  <Typography variant="body2" color="#856404">
                    ✨ Quét đúng mã để đảm bảo giao dịch thành công và đúng nội
                    dung chuyển khoản
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Đã sao chép vào bộ nhớ tạm!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BankTransferPage;