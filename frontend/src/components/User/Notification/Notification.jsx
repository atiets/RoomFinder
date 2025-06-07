// src/components/User/Notification/Notification.jsx
import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../../../redux/notificationAPI";
import {
  Notifications,
  Circle,
  Comment,
  ThumbUp,
  Reply,
  Star,
  Email,
  Announcement,
} from "@mui/icons-material";
import "./Notification.css";

const Notification = ({
  anchorEl,
  onClose,
  onNotificationClose,
  userId,
  accessToken,
  onUpdateUnreadCount,
  socket,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const [notifications, setNotifications] = React.useState([]);
  const [visibleCount, setVisibleCount] = React.useState(8);
  const loading = useSelector((state) => state.notifications.loading);
  const error = useSelector((state) => state.notifications.error);
  const [refresh, setRefresh] = React.useState(false);

  const getNotifications = async () => {
    try {
      const data = await fetchNotifications(token);
      setNotifications(data);

      const unreadCount = data.filter(
        (notification) => notification.status !== "read"
      ).length;
      onUpdateUnreadCount(unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      getNotifications();
    }
  }, [refresh, token]);

  useEffect(() => {
    if (!socket || !socket.on) {
      return;
    }

    const handleIncomingNotification = (message) => {
      console.log(message);
      getNotifications();
    };

    const handleForumNotification = (data) => {
      getNotifications();
    };

    socket.on("postModerationStatus", handleIncomingNotification);
    socket.on("forumNotification", handleForumNotification);

    return () => {
      if (socket && socket.off) {
        socket.off("postModerationStatus", handleIncomingNotification);
        socket.off("forumNotification", handleForumNotification);
      }
    };
  }, [socket]);

  const getNotificationAction = (type) => {
    switch (type) {
      case "forum_comment":
        return "đã bình luận về bài viết của bạn";
      case "forum_like":
        return "đã thích bài viết/bình luận của bạn";
      case "forum_mention":
        return "đã nhắc đến bạn";
      case "forum_reply":
        return "đã trả lời bình luận của bạn";
      default:
        return "có hoạt động mới";
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = {
      sx: {
        fontSize: 18,
        color: "#4CAF50",
        backgroundColor: "#E8F5E8",
        borderRadius: "50%",
        padding: "6px",
        width: 30,
        height: 30,
      },
    };

    switch (type) {
      case "forum_comment":
        return <Comment {...iconProps} />;
      case "forum_like":
        return <ThumbUp {...iconProps} />;
      case "forum_mention":
        return <Announcement {...iconProps} />;
      case "forum_reply":
        return <Reply {...iconProps} />;
      case "review":
        return <Star {...iconProps} />;
      case "message":
        return <Email {...iconProps} />;
      default:
        return <Notifications {...iconProps} />;
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification._id && accessToken) {
        await markNotificationAsRead(notification._id, accessToken, dispatch);
        setRefresh(!refresh);
      } else {
        console.error("Missing notificationId or accessToken.");
      }

      if (notification.type?.startsWith("forum_")) {
        if (notification.thread_id) {
          console.log("🚀 Navigating to forum thread:", notification.thread_id);
          if (notification.comment_id) {
            navigate(
              `/forum/thread/${notification.thread_id}?comment=${notification.comment_id}`
            );
          } else {
            navigate(`/forum/thread/${notification.thread_id}`);
          }
        } else {
          navigate("/forum");
        }
      } else if (notification.post_id) {
        console.log("🚀 Navigating to post:", notification.post_id);
        navigate(`/posts/${notification.post_id}`);
      }

      onNotificationClose();
    } catch (error) {
      console.error("🔥 Error in handleNotificationClick:", error);
    }
  };

  const handleSeeMore = () => {
    setVisibleCount((prevCount) => prevCount + 8);
  };

  const handleMenuClose = () => {
    setVisibleCount(8);
    onNotificationClose();
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const sortedNotifications =
    notifications && notifications.length > 0
      ? [...notifications].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      : [];

  const unreadCount = notifications.filter(
    (notification) => notification.status !== "read"
  ).length;

  const remainingCount = notifications.length - visibleCount;

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          width: "450px",
          maxHeight: "600px",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          border: "1px solid #E8F5E8",
          mt: 1,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #F0F0F0",
          backgroundColor: "#F1F8E9", // Màu xanh lá nhạt cho header
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#2E7D32",
            fontSize: "18px",
          }}
        >
          Thông báo
        </Typography>
        {unreadCount > 0 && (
          <Typography
            variant="caption"
            sx={{
              color: "#2E7D32",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: "#C8E6C9",
              padding: "4px 8px",
              borderRadius: "12px",
              whiteSpace: "nowrap",
            }}
          >
            {unreadCount} chưa đọc
          </Typography>
        )}
      </Box>

      {/* Content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 0",
          }}
        >
          <Box className="loading-container">
            <Box className="spinner" />
          </Box>
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "40px 24px",
          }}
        >
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      ) : notifications && notifications.length > 0 ? (
        <>
          {notifications.slice(0, visibleCount).map((notification, index) => (
            <React.Fragment key={notification._id}>
              <MenuItem
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  padding: "16px 24px",
                  alignItems: "flex-start",
                  backgroundColor:
                    notification.status === "read" ? "#ffffff" : "#E8F5E8", // Thay đổi màu chưa đọc đậm hơn
                  borderLeft: notification.status === "read" ? "none" : "4px solid #4CAF50", // Thêm border trái cho thông báo chưa đọc
                  "&:hover": {
                    backgroundColor: notification.status === "read" ? "#F5F5F5" : "#DCEDC8", // Hover state khác nhau
                  },
                  borderRadius: 0,
                  position: "relative",
                  minHeight: "auto",
                  transition: "all 0.2s ease-in-out", // Smooth transition
                }}
              >
                {/* Notification Icon */}
                <Box sx={{ marginRight: "12px", marginTop: "2px", flexShrink: 0 }}>
                  {getNotificationIcon(notification.type)}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* User name and action */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.status === "read" ? 400 : 600, // Chữ đậm hơn cho chưa đọc
                          color: notification.status === "read" ? "#666" : "#2E7D32", // Màu chữ khác nhau
                          lineHeight: 1.4,
                          mb: 0.5,
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          overflow: "hidden",
                        }}
                      >
                        {notification.from_user ? (
                          <>
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: 700, // Username luôn đậm
                                color: notification.status === "read" ? "#4CAF50" : "#2E7D32",
                              }}
                            >
                              {notification.from_user.username}
                            </Typography>{" "}
                            {getNotificationAction(notification.type)}
                          </>
                        ) : (
                          notification.message
                        )}
                      </Typography>

                      {/* Time */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: notification.status === "read" ? "#999" : "#555", // Màu thời gian khác nhau
                          fontSize: "12px",
                          fontWeight: notification.status === "read" ? 400 : 500,
                        }}
                      >
                        {formatTimeAgo(notification.createdAt)}
                      </Typography>
                    </Box>

                    {/* Unread indicator */}
                    {notification.status !== "read" && (
                      <Box sx={{ flexShrink: 0, paddingLeft: "8px" }}>
                        <Circle
                          sx={{
                            color: "#4CAF50",
                            fontSize: 10, // Tăng size chút
                            marginTop: "6px",
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Additional context if needed */}
                  {notification.type?.startsWith("forum_") && (
                    <Chip
                      label="Diễn đàn"
                      size="small"
                      sx={{
                        backgroundColor: notification.status === "read" ? "#F5F5F5" : "#C8E6C9",
                        color: notification.status === "read" ? "#666" : "#2E7D32",
                        fontSize: "10px",
                        height: "20px",
                        mt: 1,
                        fontWeight: notification.status === "read" ? 400 : 500,
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
              {index < notifications.slice(0, visibleCount).length - 1 && (
                <Divider sx={{ margin: 0, borderColor: "#F5F5F5" }} />
              )}
            </React.Fragment>
          ))}

          {/* See more button */}
          {visibleCount < notifications.length && (
            <>
              <Divider sx={{ margin: 0, borderColor: "#F5F5F5" }} />
              <MenuItem
                onClick={handleSeeMore}
                sx={{
                  justifyContent: "center",
                  padding: "12px 24px",
                  "&:hover": {
                    backgroundColor: "#F0F8F0",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4CAF50",
                    fontWeight: 500,
                  }}
                >
                  Xem thêm {Math.min(8, remainingCount)} thông báo...
                </Typography>
              </MenuItem>
            </>
          )}
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 24px",
            color: "#666",
          }}
        >
          <Notifications
            sx={{
              fontSize: 48,
              color: "#C8E6C9",
              mb: 2,
            }}
          />
          <Typography variant="body2" color="#666">
            Không có thông báo nào
          </Typography>
        </Box>
      )}
    </Menu>
  );
};

export default Notification;