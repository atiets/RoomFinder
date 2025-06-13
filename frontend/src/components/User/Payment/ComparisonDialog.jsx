import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Cancel,
  Star,
  TrendingUp,
  Phone,
  Support,
  Analytics,
  Business,
  FlashOn,
  AccessTime,
} from "@mui/icons-material";

const ComparisonDialog = ({
  open,
  onClose,
  subscriptions = [],
  currentSubscription,
  onSelectPlan,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getFeatureValue = (feature, value) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle color="success" />
      ) : (
        <Cancel color="disabled" />
      );
    }

    if (value === -1) {
      return (
        <Chip
          label="Không giới hạn"
          color="success"
          size="small"
          icon={<Star />}
        />
      );
    }

    if (value === 0) {
      return <Cancel color="disabled" />;
    }

    return (
      <Typography variant="body2" fontWeight="medium">
        {value}
      </Typography>
    );
  };

const features = [
  {
    name: "Giá/tháng",
    key: "price",
    icon: <TrendingUp />,
    format: (value, sub) => {
      if (value === 0) return "Miễn phí";
      if (sub.name === 'plus') return "499.000 VND"; // ⭐ Cập nhật
      return formatPrice(value);
    },
  },
  {
    name: "Số tin đăng thường/tháng",
    key: "maxPosts", 
    icon: <TrendingUp />,
    isFeature: true,
    format: (value, sub) => {
      if (sub.name === 'free') return "3";
      if (sub.name === 'pro') return "30"; // ⭐ Cập nhật
      if (value === -1) return "Không giới hạn";
      return value;
    }
  },
  {
    name: "Tin VIP miễn phí",
    key: "vipPosts",
    icon: <Star />,
    isFeature: true,
    format: (value, sub) => {
      if (sub.name === 'free') return "Không có";
      if (sub.name === 'pro') return "5/tháng";
      if (value === -1) return "Không giới hạn";
      return `${value}/tháng`;
    }
  },
  // Thêm tính năng VIP
  {
    name: "Tính năng VIP",
    key: "vipBenefits",
    icon: <Star />,
    isFeature: true,
    format: (value, sub) => {
      if (sub.name === 'free') return <Cancel color="disabled" />;
      return (
        <Box>
          <Typography variant="caption" display="block">
            🔝 Ưu tiên hiển thị
          </Typography>
          <Typography variant="caption" display="block">
            🎨 Giao diện đặc biệt
          </Typography>
          <Typography variant="caption" display="block">
            📈 Tăng 300-500% lượt xem
          </Typography>
          <Typography variant="caption" display="block">
            🏢 Logo thương hiệu
          </Typography>
        </Box>
      );
    }
  },
  // ... các features khác
];

  const isCurrentPlan = (subscriptionId) => {
    return currentSubscription?.subscriptionId?._id === subscriptionId;
  };

  const getColumnColor = (subscription) => {
    switch (subscription.name) {
      case "free":
        return "#f8f9fa";
      case "pro":
        return "#e8f5e8";
      case "plus":
        return "#fff3e0";
      default:
        return "#f5f5f5";
    }
  };

  if (isMobile) {
    // Mobile version - Card layout
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            So sánh các gói
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {subscriptions.map((subscription) => (
            <Paper
              key={subscription._id}
              sx={{
                mb: 2,
                p: 2,
                background: getColumnColor(subscription),
                borderRadius: 3,
              }}
            >
              <Box textAlign="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  {subscription.displayName.split(" - ")[0]}
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {subscription.price === 0
                    ? "Miễn phí"
                    : formatPrice(subscription.price)}
                </Typography>
                {isCurrentPlan(subscription._id) && (
                  <Chip label="Đang sử dụng" color="primary" sx={{ mt: 1 }} />
                )}
              </Box>

              {features.map((feature) => {
                const value = feature.isFeature
                  ? subscription.features[feature.key]
                  : subscription[feature.key];

                return (
                  <Box
                    key={feature.key}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom="1px solid rgba(0,0,0,0.1)"
                  >
                    <Box display="flex" alignItems="center">
                      {feature.icon}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {feature.name}
                      </Typography>
                    </Box>
                    <Box>
                      {feature.format
                        ? feature.format(value, subscription)
                        : getFeatureValue(feature.key, value)}
                    </Box>
                  </Box>
                );
              })}

              {!isCurrentPlan(subscription._id) && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => {
                    onSelectPlan(subscription);
                    onClose();
                  }}
                >
                  {subscription.name === "free"
                    ? "Sử dụng miễn phí"
                    : "Nâng cấp ngay"}
                </Button>
              )}
            </Paper>
          ))}
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop version - Table layout
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          📊 So sánh chi tiết các gói dịch vụ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chọn gói phù hợp nhất với nhu cầu của bạn
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    background:
                      "linear-gradient(135deg, #a8e6a3 0%, #ffd180 100%)",
                    color: "white",
                    minWidth: 200,
                  }}
                >
                  Tính năng
                </TableCell>
                {subscriptions.map((subscription) => (
                  <TableCell
                    key={subscription._id}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      background: getColumnColor(subscription),
                      minWidth: 150,
                      position: "relative",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {subscription.displayName.split(" - ")[0]}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {subscription.price === 0
                          ? "Miễn phí"
                          : formatPrice(subscription.price)}
                      </Typography>
                      {isCurrentPlan(subscription._id) && (
                        <Chip
                          label="Đang sử dụng"
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {features.map((feature, index) => (
                <TableRow
                  key={feature.key}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(168, 230, 163, 0.1)",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: "medium" }}>
                    <Box display="flex" alignItems="center">
                      {feature.icon}
                      <Typography sx={{ ml: 1 }}>{feature.name}</Typography>
                    </Box>
                  </TableCell>
                  {subscriptions.map((subscription) => {
                    const value = feature.isFeature
                      ? subscription.features[feature.key]
                      : subscription[feature.key];

                    return (
                      <TableCell
                        key={subscription._id}
                        align="center"
                        sx={{
                          background: `${getColumnColor(subscription)}50`,
                        }}
                      >
                        {feature.format
                          ? feature.format(value, subscription)
                          : getFeatureValue(feature.key, value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* Action Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Typography variant="h6">Hành động</Typography>
                </TableCell>
                {subscriptions.map((subscription) => (
                  <TableCell
                    key={subscription._id}
                    align="center"
                    sx={{
                      background: `${getColumnColor(subscription)}50`,
                      py: 2,
                    }}
                  >
                    {isCurrentPlan(subscription._id) ? (
                      <Chip
                        label="Đang sử dụng"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          onSelectPlan(subscription);
                          onClose();
                        }}
                        sx={{
                          background:
                            subscription.name === "plus"
                              ? "linear-gradient(45deg, #ff9800 30%, #f57c00 90%)"
                              : "linear-gradient(45deg, #4caf50 30%, #388e3c 90%)",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        {subscription.name === "free" ? "Sử dụng" : "Nâng cấp"}
                      </Button>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: "center" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ minWidth: 120 }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComparisonDialog;
