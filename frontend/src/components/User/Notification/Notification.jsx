// src/components/User/Notification/Notification.jsx
import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../../../redux/notificationAPI";
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
  const [visibleCount, setVisibleCount] = React.useState(5);
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
    switch (type) {
      case "forum_comment":
        return "💬";
      case "forum_like":
        return "👍";
      case "forum_mention":
        return "@";
      case "forum_reply":
        return "↩️";
      case "review":
        return "⭐";
      case "message":
        return "📨";
      default:
        return "📢";
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
    setVisibleCount((prevCount) => prevCount + 5);
  };

  const handleMenuClose = () => {
    setVisibleCount(5);
    onNotificationClose();
  };

  const formatNotificationMessage = (notification) => {
    const icon = getNotificationIcon(notification.type);
    return `${icon} ${notification.message}`;
  };

  const sortedNotifications =
    notifications && notifications.length > 0
      ? [...notifications].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      : [];

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "#c2f8ab",
          borderRadius: "10px",
          width: "500px",
          maxHeight: "600px",
          overflowY: "auto",
        },
      }}
    >
      <Box className="notification-header">
        <Typography className="notification-title">Thông báo</Typography>
        <Button className="notification-close-btn" onClick={handleMenuClose}>
          Đóng
        </Button>
      </Box>
      <hr className="notification-divider" />

      {loading ? (
        <MenuItem sx={{ justifyContent: "center", padding: "15px 0" }}>
          <Typography variant="body2">
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          </Typography>
        </MenuItem>
      ) : error ? (
        <MenuItem sx={{ justifyContent: "center", padding: "15px 0" }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </MenuItem>
      ) : notifications && notifications.length > 0 ? (
        <>
          {notifications.slice(0, visibleCount).map((notification) => (
            <React.Fragment key={notification._id}>
              <MenuItem
                onClick={() => handleNotificationClick(notification)}
                className={notification.status === "read" ? "read" : "unread"}
                sx={{
                  borderRadius: "10px",
                  marginBottom: "10px",
                  width: "480px",
                  backgroundColor:
                    notification.status === "read" ? "#c2f8ab" : "#9e9e9e",
                  "&:hover": {
                    backgroundColor:
                      notification.status === "read" ? "#9ee380" : "#757575",
                  },
                  ...(notification.type?.startsWith("forum_") && {
                    borderLeft: "4px solid #2E7D32",
                  }),
                }}
              >
                <Box className="notification-item">
                  <Typography
                    variant="body2"
                    className="notification-message"
                    sx={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                      fontWeight: notification.status === "unread" ? 600 : 400,
                    }}
                  >
                    {formatNotificationMessage(notification)}
                  </Typography>

                  {notification.type?.startsWith("forum_") &&
                    notification.from_user && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#2E7D32",
                          fontWeight: 500,
                          display: "block",
                          mt: 0.5,
                        }}
                      >
                        👤 {notification.from_user.username}
                      </Typography>
                    )}

                  <Typography
                    variant="caption"
                    className="notification-date"
                    sx={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                      color: "#666",
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(notification.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ margin: "0", borderColor: "#ddd" }} />
            </React.Fragment>
          ))}

          {visibleCount < notifications.length && (
            <MenuItem
              onClick={handleSeeMore}
              sx={{ justifyContent: "center", padding: "15px 0" }}
            >
              <Typography variant="body2" fontWeight="bold">
                Xem thêm...
              </Typography>
            </MenuItem>
          )}
        </>
      ) : (
        <MenuItem sx={{ justifyContent: "center", padding: "15px 0" }}>
          <Typography variant="body2">Không có thông báo nào.</Typography>
        </MenuItem>
      )}
    </Menu>
  );
};

export default Notification;
