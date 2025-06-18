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
  Divider,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Cancel,
  Star,
  TrendingUp,
  Phone,
  Support,
  Schedule,
  Business,
  PostAdd,
  Visibility,
  Security,
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

  const features = [
    {
      name: "💰 Giá cả",
      key: "price",
      icon: <TrendingUp sx={{ fontSize: 18, color: "#4CAF50" }} />,
      format: (value, sub) => {
        if (value === 0 || sub.name === 'free') {
          return (
            <Box textAlign="center">
              <Chip 
                label="MIỄN PHÍ" 
                size="small"
                sx={{ 
                  backgroundColor: "#4CAF50 !important", 
                  color: "white !important",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  height: 24
                }} 
              />
            </Box>
          );
        }
        if (sub.name === 'pro') {
          return (
            <Box textAlign="center">
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#4CAF50 !important", fontSize: "1rem" }}>
                199.000 VNĐ
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important" }}>
                /tháng
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'plus') {
          return (
            <Box textAlign="center">
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#FF9800 !important", fontSize: "1rem" }}>
                499.000 VNĐ
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important" }}>
                /tháng
              </Typography>
            </Box>
          );
        }
        return (
          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#FF9800 !important" }}>
            {formatPrice(value)}
          </Typography>
        );
      },
    },
    {
      name: "📝 Tin thường/tháng",
      key: "normalPosts",
      icon: <PostAdd sx={{ fontSize: 18, color: "#4CAF50" }} />,
      format: (value, sub) => {
        if (sub.name === 'free') {
          return (
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#333 !important", fontSize: "1.5rem" }}>
                3
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.75rem" }}>
                tin
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'pro') {
          return (
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#333 !important", fontSize: "1.5rem" }}>
                30
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.75rem" }}>
                tin
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'plus') {
          return (
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#333 !important", fontSize: "1.5rem" }}>
                ∞
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.75rem" }}>
                không giới hạn
              </Typography>
            </Box>
          );
        }
        return value;
      },
    },
    {
      name: "⭐ Tin VIP",
      key: "vipPosts",
      icon: <Star sx={{ fontSize: 18, color: "#FF9800" }} />,
      format: (value, sub) => {
        if (sub.name === 'free') {
          return (
            <Box textAlign="center">
              <Cancel sx={{ color: "#ccc", fontSize: 24 }} />
              <Typography variant="caption" sx={{ color: "#999 !important", fontSize: "0.7rem", display: "block" }}>
                không có
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'pro') {
          return (
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#333 !important", fontSize: "1.5rem" }}>
                5
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.75rem" }}>
                tin VIP
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'plus') {
          return (
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#333 !important", fontSize: "1.5rem" }}>
                ∞
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.75rem" }}>
                không giới hạn
              </Typography>
            </Box>
          );
        }
        return value;
      },
    },
    {
      name: "📱 Xem SĐT",
      key: "viewPhone",
      icon: <Phone sx={{ fontSize: 18, color: "#4CAF50" }} />,
      format: (value, sub) => {
        if (sub.name === 'free') {
          return (
            <Box textAlign="center">
              <Cancel sx={{ color: "#f44336", fontSize: 24 }} />
              <Typography variant="caption" sx={{ color: "#f44336 !important", fontSize: "0.7rem", display: "block", fontWeight: "bold" }}>
                không được
              </Typography>
            </Box>
          );
        }
        return (
          <Box textAlign="center">
            <CheckCircle sx={{ color: "#4CAF50", fontSize: 24 }} />
            <Typography variant="caption" sx={{ color: "#4CAF50 !important", fontSize: "0.7rem", display: "block", fontWeight: "bold" }}>
              được xem
            </Typography>
          </Box>
        );
      },
    },
    {
      name: "⚡ Duyệt tin",
      key: "approvalTime", 
      icon: <Schedule sx={{ fontSize: 18, color: "#FF9800" }} />,
      format: (value, sub) => {
        if (sub.name === 'free') {
          return (
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: "#333 !important", fontWeight: "bold", fontSize: "0.9rem" }}>
                48-72h
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.7rem" }}>
                duyệt chậm
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'pro') {
          return (
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: "#333 !important", fontWeight: "bold", fontSize: "0.9rem" }}>
                24h
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.7rem" }}>
                duyệt nhanh
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'plus') {
          return (
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: "#333 !important", fontWeight: "bold", fontSize: "0.9rem" }}>
                2-4h
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.7rem" }}>
                duyệt VIP
              </Typography>
            </Box>
          );
        }
        return value;
      },
    },
    {
      name: "🎯 Hỗ trợ",
      key: "support",
      icon: <Support sx={{ fontSize: 18, color: "#4CAF50" }} />,
      format: (value, sub) => {
        if (sub.name === 'free') {
          return (
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: "#333 !important", fontWeight: "bold", fontSize: "0.85rem" }}>
                Cơ bản
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.7rem" }}>
                email
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'pro') {
          return (
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: "#333 !important", fontWeight: "bold", fontSize: "0.85rem" }}>
                Ưu tiên
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.7rem" }}>
                chat + phone
              </Typography>
            </Box>
          );
        }
        if (sub.name === 'plus') {
          return (
            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: "#333 !important", fontWeight: "bold", fontSize: "0.85rem" }}>
                VIP 24/7
              </Typography>
              <Typography variant="caption" sx={{ color: "#666 !important", fontSize: "0.7rem" }}>
                hotline
              </Typography>
            </Box>
          );
        }
        return value;
      },
    },
  ];

  const isCurrentPlan = (subscriptionId) => {
    return currentSubscription?.subscriptionId?._id === subscriptionId;
  };

  // ⭐ FIX COLUMN STYLE VỚI !IMPORTANT
  const getColumnStyle = (subscription) => {
    switch (subscription.name) {
      case "free":
        return {
          backgroundColor: "#FAFAFA !important",
          borderColor: "#4CAF50",
          accentColor: "#4CAF50",
          textColor: "#333 !important"
        };
      case "pro":
        return {
          backgroundColor: "#F1F8E9 !important", 
          borderColor: "#4CAF50",
          accentColor: "#4CAF50",
          textColor: "#333 !important"
        };
      case "plus":
        return {
          backgroundColor: "#FFF8E1 !important",
          borderColor: "#FF9800", 
          accentColor: "#FF9800",
          textColor: "#333 !important"
        };
      default:
        return {
          backgroundColor: "#F5F5F5 !important",
          borderColor: "#ccc",
          accentColor: "#666",
          textColor: "#333 !important"
        };
    }
  };

  const getPlanBadge = (subscription) => {
    if (subscription.name === 'pro') {
      return (
        <Chip 
          label="PHỔ BIẾN" 
          size="small"
          sx={{ 
            backgroundColor: "rgba(255,255,255,0.9) !important", 
            color: "#4CAF50 !important",
            fontWeight: "bold",
            fontSize: "0.65rem",
            mt: 0.5,
            border: "1px solid #4CAF50"
          }} 
        />
      );
    }
    if (subscription.name === 'plus') {
      return (
        <Chip 
          label="TỐI ƯU" 
          size="small"
          sx={{ 
            backgroundColor: "rgba(255,255,255,0.9) !important", 
            color: "#FF9800 !important",
            fontWeight: "bold",
            fontSize: "0.65rem",
            mt: 0.5,
            border: "1px solid #FF9800"
          }} 
        />
      );
    }
    return null;
  };

  if (isMobile) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            margin: 1,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#4CAF50 !important",
            color: "white !important",
            py: 1.5,
            px: 2
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "white !important" }}>
              📊 So sánh gói dịch vụ
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white !important" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 1, backgroundColor: "#FAFAFA !important" }}>
          {subscriptions.map((subscription) => {
            const style = getColumnStyle(subscription);
            return (
              <Paper
                key={subscription._id}
                elevation={2}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  border: `2px solid ${style.borderColor} !important`,
                  overflow: "hidden"
                }}
              >
                <Box 
                  sx={{ 
                    backgroundColor: `${style.accentColor} !important`,
                    color: "white !important",
                    p: 1.5,
                    textAlign: "center"
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "white !important" }}>
                    {subscription.displayName?.split(" - ")[0] || subscription.name?.toUpperCase()}
                  </Typography>
                  {getPlanBadge(subscription)}
                  <Typography variant="h6" fontWeight="bold" mt={1} sx={{ color: "white !important" }}>
                    {subscription.price === 0 ? "MIỄN PHÍ" : formatPrice(subscription.price)}
                  </Typography>
                  {isCurrentPlan(subscription._id) && (
                    <Chip 
                      label="ĐANG DÙNG" 
                      size="small"
                      sx={{ 
                        mt: 1, 
                        backgroundColor: "rgba(255,255,255,0.9) !important",
                        color: `${style.accentColor} !important`,
                        fontSize: "0.7rem",
                        fontWeight: "bold"
                      }} 
                    />
                  )}
                </Box>

                <Box sx={{ backgroundColor: style.backgroundColor, p: 1 }}>
                  {features.map((feature, index) => (
                    <Box key={feature.key}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1}
                      >
                        <Box display="flex" alignItems="center" flex={1}>
                          {feature.icon}
                          <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500, color: style.textColor }}>
                            {feature.name}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          {feature.format(null, subscription)}
                        </Box>
                      </Box>
                      {index < features.length - 1 && <Divider sx={{ borderColor: "rgba(0,0,0,0.1)" }} />}
                    </Box>
                  ))}

                  {!isCurrentPlan(subscription._id) && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{ 
                        mt: 1.5,
                        py: 1,
                        backgroundColor: `${style.accentColor} !important`,
                        color: "white !important",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        "&:hover": {
                          backgroundColor: `${style.accentColor} !important`,
                          opacity: 0.9
                        }
                      }}
                      onClick={() => {
                        onSelectPlan(subscription);
                        onClose();
                      }}
                    >
                      {subscription.name === "free" ? "SỬ DỤNG" : "NÂNG CẤP"}
                    </Button>
                  )}
                </Box>
              </Paper>
            );
          })}
        </DialogContent>
      </Dialog>
    );
  }

  // ⭐ DESKTOP VERSION - FIX VỚI !IMPORTANT VÀ HIGHER SPECIFICITY
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
        },
      }}
      // ⭐ THÊM CLASS ĐỂ TĂNG SPECIFICITY
      className="comparison-dialog"
    >
      <DialogTitle sx={{ textAlign: "center", py: 2, backgroundColor: "#4CAF50 !important", color: "white !important" }}>
        <Typography variant="h6" fontWeight="bold" mb={0.5} sx={{ color: "white !important" }}>
          📊 So sánh gói dịch vụ
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, color: "white !important" }}>
          Chọn gói phù hợp với nhu cầu của bạn
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: "#FAFAFA !important" }}>
        <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent !important" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold !important",
                    backgroundColor: "#4CAF50 !important",
                    color: "white !important",
                    minWidth: 140,
                    py: 1.5
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Security sx={{ mr: 1, fontSize: 16, color: "white !important" }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ color: "white !important" }}>
                      TÍNH NĂNG
                    </Typography>
                  </Box>
                </TableCell>
                {subscriptions.map((subscription) => {
                  const style = getColumnStyle(subscription);
                  return (
                    <TableCell
                      key={subscription._id}
                      align="center"
                      sx={{
                        fontWeight: "bold !important",
                        backgroundColor: `${style.accentColor} !important`,
                        color: "white !important",
                        minWidth: 120,
                        py: 1.5
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "white !important" }}>
                          {subscription.displayName?.split(" - ")[0] || subscription.name?.toUpperCase()}
                        </Typography>
                        {getPlanBadge(subscription)}
                        <Typography variant="h6" fontWeight="bold" mt={0.5} sx={{ color: "white !important" }}>
                          {subscription.price === 0 ? "0 đ" : 
                            subscription.name === 'plus' ? "499K" : 
                            subscription.name === 'pro' ? "199K" : formatPrice(subscription.price)}
                        </Typography>
                        {isCurrentPlan(subscription._id) && (
                          <Chip
                            label="ĐANG DÙNG"
                            size="small"
                            sx={{ 
                              mt: 0.5,
                              backgroundColor: "rgba(255,255,255,0.9) !important",
                              color: `${style.accentColor} !important`,
                              fontSize: "0.6rem",
                              fontWeight: "bold"
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {features.map((feature, index) => (
                <TableRow
                  key={feature.key}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: "rgba(0, 0, 0, 0.02) !important",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(76, 175, 80, 0.05) !important",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500, py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      {feature.icon}
                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 500, color: "#333 !important" }}>
                        {feature.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {subscriptions.map((subscription) => {
                    const style = getColumnStyle(subscription);
                    return (
                      <TableCell
                        key={subscription._id}
                        align="center"
                        sx={{
                          backgroundColor: style.backgroundColor,
                          py: 1.5
                        }}
                      >
                        {feature.format(null, subscription)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: "bold !important", 
                    py: 2,
                    backgroundColor: "#4CAF50 !important",
                    color: "white !important"
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "white !important" }}>
                    🚀 HÀNH ĐỘNG
                  </Typography>
                </TableCell>
                {subscriptions.map((subscription) => {
                  const style = getColumnStyle(subscription);
                  return (
                    <TableCell
                      key={subscription._id}
                      align="center"
                      sx={{
                        backgroundColor: style.backgroundColor,
                        py: 2,
                      }}
                    >
                      {isCurrentPlan(subscription._id) ? (
                        <Chip
                          label="ĐANG DÙNG"
                          size="small"
                          sx={{
                            backgroundColor: `${style.accentColor} !important`,
                            color: "white !important",
                            fontWeight: "bold",
                            fontSize: "0.7rem"
                          }}
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
                            backgroundColor: `${style.accentColor} !important`,
                            color: "white !important",
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            px: 2,
                            py: 0.5,
                            "&:hover": {
                              backgroundColor: `${style.accentColor} !important`,
                              opacity: 0.9,
                            },
                          }}
                        >
                          {subscription.name === "free" ? "DÙNG" : "NÂNG CẤP"}
                        </Button>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "center", backgroundColor: "#FAFAFA !important" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ 
            borderColor: "#4CAF50 !important",
            color: "#4CAF50 !important",
            fontWeight: "bold",
            px: 3
          }}
        >
          ĐÓNG
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComparisonDialog;