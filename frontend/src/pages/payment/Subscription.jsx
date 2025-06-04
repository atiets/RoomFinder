import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  TrendingUp,
  AccessTime,
  CheckCircle,
  CompareArrows,
} from "@mui/icons-material";
import SubscriptionCard from "../../components/User/Payment/SubscriptionCard";
import ComparisonDialog from "../../components/User/Payment/ComparisonDialog";
import {
  getAllSubscriptions,
  getCurrentSubscription,
} from "../../redux/subscriptionService";
import { useSelector } from "react-redux";

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);

  // Navigation
  const navigate = useNavigate();

  // Redux selectors - đã sửa theo cấu trúc thực tế
  const authState = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = useSelector(
    (state) => state.auth?.login?.currentUser?.accessToken
  );

  // Debug console
  useEffect(() => {
    console.log("🔍 === DEBUG AUTH STATE ===");
    console.log("Full Redux State Auth:", authState);
    console.log("currentUser found:", currentUser);
    console.log("accessToken found:", accessToken);
    console.log("currentUser type:", typeof currentUser);
    console.log("accessToken type:", typeof accessToken);
    console.log("currentUser truthy:", !!currentUser);
    console.log("accessToken truthy:", !!accessToken);
    console.log("============================");
  }, [authState, currentUser, accessToken]);

  // Logic check đăng nhập
  const isLoggedIn = useMemo(() => {
    const hasUser =
      currentUser &&
      (currentUser.id ||
        currentUser._id ||
        currentUser.email ||
        currentUser.username);

    const hasToken =
      accessToken && typeof accessToken === "string" && accessToken.length > 10;

    const result = !!(hasUser && hasToken);

    console.log("🔐 Login Check:", {
      hasUser: !!hasUser,
      hasToken: !!hasToken,
      isLoggedIn: result,
      userDetails: hasUser
        ? {
            id: currentUser.id || currentUser._id,
            email: currentUser.email,
            username: currentUser.username,
          }
        : null,
    });

    return result;
  }, [currentUser, accessToken]);

  useEffect(() => {
    loadData();
  }, [accessToken, isLoggedIn]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Loading subscriptions...", {
        isLoggedIn,
        hasCurrentUser: !!currentUser,
        hasAccessToken: !!accessToken,
      });

      const subscriptionsRes = await getAllSubscriptions();
      console.log("subscriptionsRes", subscriptionsRes);
      console.log("📦 Subscriptions response:", subscriptionsRes.data);

      if (subscriptionsRes.data.success) {
        setSubscriptions(subscriptionsRes.data.data);
      } else {
        throw new Error("Không thể lấy danh sách gói đăng ký");
      }

      // Chỉ gọi getCurrentSubscription nếu có token
      if (accessToken && typeof accessToken === "string") {
        try {
          console.log("🔄 Fetching current subscription with token...");
          const currentRes = await getCurrentSubscription(accessToken);
          console.log("📋 Current subscription response:", currentRes.data);

          if (currentRes.data.success) {
            setCurrentSubscription(currentRes.data.data);
          }
        } catch (err) {
          console.log("ℹ️ User chưa có gói đăng ký:", err.message);
        }
      } else {
        console.log(
          "⚠️ No valid access token, skipping getCurrentSubscription"
        );
      }
    } catch (err) {
      console.error("💥 Load data error:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (subscription) => {
    console.log("🎯 Handle Select Plan called:", {
      isLoggedIn,
      hasCurrentUser: !!currentUser,
      hasAccessToken: !!accessToken,
      subscription: subscription.name,
      userInfo: currentUser
        ? {
            username: currentUser.username,
            email: currentUser.email,
          }
        : null,
    });

    if (!isLoggedIn) {
      console.error("❌ Login check failed:", {
        currentUser: !!currentUser,
        accessToken: !!accessToken,
        isLoggedIn,
      });
      setError(
        "Bạn cần đăng nhập để sử dụng tính năng này. Vui lòng đăng nhập lại."
      );
      return;
    }

    console.log("✅ User authenticated, proceeding with plan selection");

    if (subscription.name === "free") {
      handleFreeSubscription(subscription);
    } else {
      const queryParams = new URLSearchParams({
        plan: subscription.name,
        subscriptionId: subscription._id,
        title: subscription.displayName.split(" - ")[0],
        displayName: subscription.displayName,
        duration: `${subscription.duration} ngày`,
        price: subscription.price,
        features: [
          subscription.features.maxPosts === -1
            ? "Không giới hạn tin đăng/tháng"
            : `${subscription.features.maxPosts} tin đăng/tháng`,
          subscription.features.vipPosts === -1
            ? "Không giới hạn tin VIP"
            : subscription.features.vipPosts > 0
              ? `${subscription.features.vipPosts} tin VIP miễn phí`
              : "Không có tin VIP",
          subscription.features.canViewHiddenPhone
            ? "Xem số điện thoại ẩn"
            : "",
          subscription.features.depositFeeDiscount > 0
            ? `Giảm ${subscription.features.depositFeeDiscount}% phí đặt cọc`
            : "",
          `Duyệt tin trong ${subscription.features.fastApproval} giờ`,
          subscription.features.prioritySupport ? "Hỗ trợ ưu tiên 24/7" : "",
          subscription.features.analytics ? "Báo cáo & phân tích chi tiết" : "",
          subscription.features.customBranding ? "Logo thương hiệu riêng" : "",
          subscription.features.alwaysOnTop ? "Luôn hiển thị đầu trang" : "",
        ]
          .filter(Boolean)
          .join(","),
      });

      console.log(
        "🚀 Navigating to payment page with params:",
        queryParams.toString()
      );
      navigate(`/payment?${queryParams.toString()}`);
    }
  };

  const handleFreeSubscription = async (subscription) => {
    try {
      setSuccess("Đã kích hoạt gói Free thành công!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const renderCurrentSubscriptionInfo = () => {
    if (!currentSubscription || !isLoggedIn) return null;

    const { subscriptionId, endDate, currentUsage } = currentSubscription;
    const daysRemaining = calculateDaysRemaining(endDate);
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
    const isExpired = daysRemaining === 0;

    return (
      <Card
        sx={{
          mb: 4,
          bgcolor: "#f8fffe",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0f2f1",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold" color="#2e7d32">
              Gói hiện tại: {subscriptionId.displayName}
            </Typography>
            <Chip
              label={
                isExpired
                  ? "Đã hết hạn"
                  : isExpiringSoon
                    ? "Sắp hết hạn"
                    : "Đang hoạt động"
              }
              color={
                isExpired ? "error" : isExpiringSoon ? "warning" : "success"
              }
              icon={
                isExpired ? (
                  <AccessTime />
                ) : isExpiringSoon ? (
                  <AccessTime />
                ) : (
                  <CheckCircle />
                )
              }
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Thời gian còn lại
                </Typography>
                <Typography
                  variant="h6"
                  color={isExpiringSoon || isExpired ? "error" : "#2e7d32"}
                >
                  {daysRemaining} ngày
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mức độ sử dụng trong tháng
              </Typography>
              <Box mb={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="#2e7d32">
                    Tin đã đăng: {currentUsage.postsCreated}
                    {subscriptionId.features.maxPosts > 0 &&
                      `/${subscriptionId.features.maxPosts}`}
                  </Typography>
                  <Typography variant="caption" color="#2e7d32">
                    {subscriptionId.features.maxPosts === -1
                      ? "∞"
                      : `${Math.round((currentUsage.postsCreated / subscriptionId.features.maxPosts) * 100)}%`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    subscriptionId.features.maxPosts === -1
                      ? 0
                      : Math.min(
                          (currentUsage.postsCreated /
                            subscriptionId.features.maxPosts) *
                            100,
                          100
                        )
                  }
                  sx={{
                    borderRadius: 2,
                    height: 8,
                    bgcolor: "#e8f5e8",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#4caf50",
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {(isExpiringSoon || isExpired) && (
            <Alert severity={isExpired ? "error" : "warning"} sx={{ mt: 2 }}>
              {isExpired
                ? "Gói dịch vụ của bạn đã hết hạn. Hãy gia hạn để tiếp tục sử dụng."
                : `Gói dịch vụ sắp hết hạn trong ${daysRemaining} ngày. Hãy gia hạn để không bị gián đoạn.`}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSkeletonCards = () => (
    <Grid container spacing={3} justifyContent="center">
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} md={4} key={item}>
          <Card sx={{ height: 550, borderRadius: 3 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="40%" height={60} />
              <Skeleton variant="rectangular" width="100%" height={200} />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={50}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Debug info để hiển thị trạng thái đăng nhập
  const renderUserInfo = () => {
    if (!isLoggedIn) return null;

    return (
      <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          👋 Chào <strong>{currentUser?.username || currentUser?.email}</strong>
          ! Bạn đã đăng nhập thành công và có thể chọn gói dịch vụ.
        </Typography>
      </Alert>
    );
  };

  const renderLoginPrompt = () => {
    if (isLoggedIn) return null;

    return (
      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          🔐 Bạn cần <strong>đăng nhập</strong> để có thể đăng ký và sử dụng các
          gói dịch vụ.
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{ mt: 1 }}
          onClick={() => navigate("/login")}
        >
          Đăng nhập ngay
        </Button>
      </Alert>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 4 }}>
      {/* User Info hoặc Login Prompt */}
      {renderUserInfo()}
      {renderLoginPrompt()}

      {/* Header với design mới */}
      <Box textAlign="center" mb={6}>
        <Box
          sx={{
            background: "#4caf50",
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(76, 175, 80, 0.2)",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            🏠 Chọn gói dịch vụ phù hợp
          </Typography>
          <Typography
            variant="h6"
            maxWidth="600px"
            mx="auto"
            sx={{ color: "white" }}
          >
            Nâng cao trải nghiệm tìm kiếm và đăng tin với các gói dịch vụ đa
            dạng, phù hợp với mọi nhu cầu sử dụng
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* Current Subscription Info */}
      {renderCurrentSubscriptionInfo()}

      {/* Subscription Cards */}
      {loading ? (
        renderSkeletonCards()
      ) : subscriptions.length > 0 ? (
        <Grid container spacing={4} justifyContent="center">
          {subscriptions.map((subscription, index) => (
            <Grid
              item
              xs={12}
              md={4}
              key={subscription._id}
              sx={{
                animation: `slideInUp 0.6s ease-out ${index * 0.2}s both`,
              }}
            >
              <SubscriptionCard
                subscription={subscription}
                currentSubscription={currentSubscription}
                onSelectPlan={handleSelectPlan}
                loading={false}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Không có gói dịch vụ nào
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => loadData()}>
            Tải lại
          </Button>
        </Box>
      )}

      {/* Features Comparison */}
      <Box mt={8} textAlign="center">
        <Box
          sx={{
            background: "#ff9800",
            borderRadius: 3,
            p: 4,
            boxShadow: "0 8px 32px rgba(255, 152, 0, 0.2)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "white" }}
          >
            📊 So sánh chi tiết các gói
          </Typography>
          <Typography variant="body1" sx={{ color: "white", mb: 3 }}>
            Xem bảng so sánh đầy đủ để chọn gói phù hợp nhất với nhu cầu của bạn
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CompareArrows />}
            onClick={() => setComparisonDialogOpen(true)}
            sx={{
              background: "white",
              color: "#ff9800",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              "&:hover": {
                background: "#f5f5f5",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 25px rgba(0,0,0,0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Xem bảng so sánh chi tiết
          </Button>
        </Box>
      </Box>

      {/* Comparison Dialog */}
      <ComparisonDialog
        open={comparisonDialogOpen}
        onClose={() => setComparisonDialogOpen(false)}
        subscriptions={subscriptions}
        currentSubscription={currentSubscription}
        onSelectPlan={handleSelectPlan}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Container>
  );
};

export default SubscriptionPage;