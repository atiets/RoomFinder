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
  onUpdateUnreadCount, // Thêm callback prop
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const [notifications, setNotifications] = React.useState([]);
  const [visibleCount, setVisibleCount] = React.useState(5); // Quản lý số lượng thông báo hiển thị
  const loading = useSelector((state) => state.notifications.loading);
  const error = useSelector((state) => state.notifications.error);
  const [refresh, setRefresh] = React.useState(false);

  const getNotifications = async () => {
    try {
      const data = await fetchNotifications(token);
      setNotifications(data);
      console.log("Notifications:", data);
      // Cập nhật số thông báo chưa đọc
      const unreadCount = data.filter(
        (notification) => notification.status !== "read",
      ).length;
      onUpdateUnreadCount(unreadCount);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    getNotifications();
  }, [refresh]);

  const handleNotificationClick = async (notificationId, postId) => {
    try {
      if (notificationId && accessToken) {
        await markNotificationAsRead(notificationId, accessToken, dispatch);
        setRefresh(!refresh);
      } else {
        console.error("Missing notificationId or accessToken.");
      }
      if (postId) {
        console.log("Navigating to post:", postId);
        navigate(`/posts/${postId}`);
      }
      onNotificationClose();
    } catch (error) {
      console.error("Error in handleNotificationClick:", error);
    }
  };

  const handleSeeMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  const handleMenuClose = () => {
    setVisibleCount(5); // Đặt lại số lượng thông báo hiển thị khi menu đóng
    onNotificationClose();
  };

  const sortedNotifications =
    notifications && notifications.length > 0
      ? [...notifications].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
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
            <React.Fragment key={notification._id} sx={{ width: "480px" }}>
              <MenuItem
                onClick={() =>
                  handleNotificationClick(
                    notification._id,
                    notification.post_id,
                  )
                }
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
                }}
              >
                <Box className="notification-item">
                  <Typography
                    variant="body2"
                    className="notification-message"
                    sx={{ wordWrap: "break-word", whiteSpace: "normal" }} // Đảm bảo chữ có thể xuống hàng
                  >
                    {notification.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="notification-date"
                    sx={{ wordWrap: "break-word", whiteSpace: "normal" }} // Đảm bảo chữ có thể xuống hàng
                  >
                    {new Date(notification.createdAt).toLocaleString()}
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
