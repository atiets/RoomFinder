import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ExpandMore,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  duration,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { refreshUser } from "../../../redux/apiRequest"
import "./UpgradePlan.css";

const plans = [
  {
    id: "proCaNhan",
    title: "Gói Pro Cá Nhân",
    price: 199000,
    duration: "30 ngày",
    features: ["Đăng 10 tin/tháng", "Hỗ trợ ưu tiên", "Thống kê chi tiết"],
  },
  {
    id: "proDoanhNghiep",
    title: "Gói Pro Doanh Nghiệp",
    price: 499000,
    duration: "30 ngày",
    features: ["Đăng 50 tin/tháng", "Hỗ trợ 24/7", "Truy xuất API"],
  },
  {
    id: "proCaoCap",
    title: "Gói Pro Cao Cấp",
    price: 899000,
    duration: "30 ngày",
    features: ["Đăng không giới hạn", "Quản lý đội nhóm", "Tư vấn chiến lược"],
  },
];

const postPlans = [
  {
    id: "free3post",
    title: "3 tin miễn phí / tháng",
    price: 0,
    features: ["Đăng tin miễn phí mỗi tháng"],
    path: "#",
  },
  {
    id: "additional5post",
    title: "Gói 5 tin",
    price: 50000,
    duration: "30 ngày",
    features: ["Đăng thêm 5 tin"],
  },
  {
    id: "additionalunlimitedpost",
    title: "Gói không giới hạn",
    price: 100000,
    duration: "30 ngày",
    features: ["Đăng không giới hạn tin"],
  },
];

const renewPlans = [
  {
    id: "renew7",
    title: "Gia hạn 7 ngày",
    price: 10000,
    duration: "7 ngày",
    features: ["Gia hạn tin thêm 7 ngày"],
  },
  {
    id: "renew15",
    title: "Gia hạn 15 ngày",
    price: 18000,
    duration: "15 ngày",
    features: ["Gia hạn tin thêm 15 ngày"],
  },
  {
    id: "renew30",
    title: "Gia hạn 30 ngày",
    price: 30000,
    duration: "30 ngày",
    features: ["Gia hạn tin thêm 30 ngày"],
  },
];

const vipPlans = [
  {
    id: "vip7",
    title: "Tin VIP 7 ngày",
    price: 50000,
    duration: "7 ngày",
    features: ["Ưu tiên tìm kiếm", "Hiển thị đầu trang"],
  },
  {
    id: "outstanding7",
    title: "Tin Nổi bật 7 ngày",
    price: 30000,
    duration: "7 ngày",
    features: ["Biểu tượng đặc biệt", "Đẩy đầu chuyên mục"],
  },
  {
    id: "fastpost",
    title: "Đăng tin nhanh",
    price: 20000,
    features: ["Bỏ kiểm duyệt", "Đăng ngay lập tức"],
  },
];

const seekerPlans = [
  {
    id: "viewphone",
    title: "Xem số điện thoại",
    price: 5000,
    features: ["Hiện số người đăng"],
  },
  {
    id: "unlimitedphone",
    title: "Gói xem không giới hạn",
    price: 50000,
    duration: "30 ngày",
    features: ["Xem số không giới hạn"],
  },
  {
    id: "findroomvip",
    title: "Gói thành viên tìm phòng",
    price: 79000,
    duration: "30 ngày",
    features: ["Không quảng cáo", "Xem SĐT", "Ưu tiên tin mới"],
  },
];

const UpgradePlan = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const errorMessage = location.state?.errorMessage;
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const handleSelect = (plan) => {
    navigate(
      `/checkout?plan=${plan.id}&title=${encodeURIComponent(plan.title)}&duration=${plan.duration}&features=${plan.features}&price=${plan.price}`
    );
  };

  const plansSectionRef = useRef();

  const handleBuyNow = () => {
    if (plansSectionRef.current) {
      plansSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderPlans = (title, plans) => (
    <Accordion
      sx={{
        mb: 2,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          "& .MuiTypography-root": {
            fontWeight: 600,
          },
        }}
      >
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: "#e8f5e9", p: 3 }}>
        <Grid container spacing={3}>
          {plans.map((plan, index) => {
            const isGreen = index % 2 === 0;
            const cardBg = isGreen ? "#c8e6c9" : "#ffe0b2";
            const btnBg = isGreen ? "#43a047" : "#fb8c00";
            const btnHover = isGreen ? "#388e3c" : "#ef6c00";

            return (
              <Grid item xs={12} sm={6} md={4} key={plan.title}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 2,
                    backgroundColor: cardBg,
                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                      >
                        {plan.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        color="text.primary"
                        sx={{ fontWeight: "bold", mb: 2 }}
                      >
                        {Number(plan.price).toLocaleString()}đ
                      </Typography>

                      <List dense>
                        {plan.features.map((f, i) => (
                          <ListItem key={i} disableGutters sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <CheckIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText primary={f} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                          backgroundColor: btnBg,
                          "&:hover": { backgroundColor: btnHover },
                          borderRadius: 2,
                          fontWeight: "bold",
                        }}
                        onClick={() => handleSelect(plan)}
                      >
                        Chọn gói
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  useEffect(() => {
    if (successMessage) {
      setSuccessOpen(true);
    }
    if (errorMessage) {
      setErrorOpen(true);
    }
  }, [successMessage, errorMessage]);
  
  useEffect(() => {
    refreshUser(dispatch);
  }, []);  

  return (
    <Box className="upgrade-plan-container">
      {/* Banner giới thiệu gói Pro */}
      <div className="promo-banner">
        <div className="promo-content">
          <img
            src="https://static.chotot.com/storage/default_images/pty/subscription_landing_page/pty-sub-goi-pro-logo.png"
            width="64"
            height="40"
            alt="goi-pro-logo"
          />
          <p className="promo-text">
            Gói đăng tin cho môi giới BĐS chuyên nghiệp - Tiết kiệm đến 86%
          </p>
          <ul className="promo-list">
            <li className="promo-item">
              <div className="promo-icon">✓</div>Tiết kiệm đến 86% phí đăng tin
            </li>
            <li className="promo-item">
              <div className="promo-icon">✓</div>Thêm kênh thu hút khách hàng có
              nhu cầu thực
            </li>
            <li className="promo-item">
              <div className="promo-icon">✓</div>Quản lý kinh doanh và chi tiêu
              hiệu quả
            </li>
          </ul>
          <div className="promo-buttons">
            <button className="btn btn-primary" onClick={() => handleBuyNow()}>
              Mua ngay
            </button>
            <button
              className="btn btn-outline"
              onClick={() => alert("Tư vấn thêm")}
            >
              Tôi cần tư vấn
            </button>
          </div>
        </div>
        <div className="promo-image">
          <img
            src="https://static.chotot.com/storage/default_images/pty/subscription_landing_page/pty-sub-value.png"
            alt="goi-pro-img"
          />
        </div>
      </div>

      <div ref={plansSectionRef}>
        <div className="upgrade-title">
          Nhiều lựa chọn gói theo nhu cầu của bạn
        </div>
        {renderPlans("📦 Gói đăng tin thêm", postPlans, "postPlans")}
        {renderPlans("♻️ Gói gia hạn tin", renewPlans, "renewPlans")}
        {renderPlans(
          "🚀 Gói nâng cấp tin (VIP, Nổi bật, Đăng nhanh)",
          vipPlans,
          "vipPlans"
        )}
        {renderPlans(
          "🔍 Dịch vụ cho người tìm phòng",
          seekerPlans,
          "seekerPlans"
        )}
        {renderPlans("💼 Gói Pro chuyên nghiệp", plans, "plans")}
      </div>
      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorOpen(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpgradePlan;
