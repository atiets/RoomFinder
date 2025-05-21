import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../../createInstance";
import useSocket from '../../../hooks/useSocket';
import { logout } from "../../../redux/apiRequest";
import { logoutSuccess } from "../../../redux/authSlice";
import Notification from "../Notification/Notification";
import Swal from "sweetalert2";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsMenuAnchorEl, setNotificationsMenuAnchorEl] =
    useState(null);
  const [notifications, setNotifications] = useState([]);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const accessToken = currentUser?.accessToken;
  const id = currentUser?._id;
  const socket = useSocket(id);
  const axiosJWT = createAxios(currentUser, dispatch, logoutSuccess);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const notificationsList = currentUser?.notifications || [];
  const notificationCount = notificationsList.filter(
    (notification) => notification.status === "unread",
  ).length;

  const totalNotifications = notificationsList.length;
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("unreadConversationsCount", ({ count }) => {
        setUnreadChatCount(count); // Cập nhật số tin nhắn chưa đọc
      });

      return () => {
        socket.off("unreadConversationsCount");
      };
    }
  }, [socket]); // Chạy lại khi socket thay đổi

  useEffect(() => {
    if (currentUser && Array.isArray(currentUser.notifications)) {
      const sortedNotifications = [...currentUser.notifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setNotifications(sortedNotifications);
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const handleUpdateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  const handleLogout = () => {
    logout(dispatch, id, navigate, accessToken, axiosJWT);
    setUnreadCount(0);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event) => {
    setNotificationsMenuAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationsMenuAnchorEl(null);
  };

  const handleAddPost = () => {
    if (!currentUser) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để đăng tin.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else if (currentUser.postQuota <= 0) {
      Swal.fire({
        title: "Hết lượt đăng tin",
        text: "Bạn đã hết lượt đăng tin trong tháng.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Chọn gói nâng cấp",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/upgrade-plan"); 
        }
      });
    } else {
      navigate("/AddPost");
    }
  };  

  const markAsRead = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  console.log("Unread chat count:", unreadChatCount);

  return (
    <>
      <AppBar className="user-header-app-bar">
        <Toolbar className="user-header-tool-bar">
          <Typography
            variant="h6"
            className="header-title"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            PhongTroXinh.com
          </Typography>
          <Box className="header-container-btn">
            <Button className="user-header-btn" onClick={() => navigate("/")}>
              Trang Chủ
            </Button>
            <Button
              className="user-header-btn"
              onClick={() => navigate("/TinTuc")}
            >
              Tin Tức
            </Button>
            <Button className="user-header-btn" onClick={handleAddPost}>
              Đăng tin mới
            </Button>

            <Button
              className="user-header-btn"
              onClick={() => navigate("/forum")}
            >
              Diễn đàn
            </Button>

            {currentUser && (
              <Button className="user-header-btn" onClick={() => navigate("/chat")}>
                <Badge
                  badgeContent={unreadChatCount}  // Số tin nhắn chưa đọc
                  color="error"  // Màu sắc của badge (đỏ)
                  invisible={unreadChatCount === 0}  // Ẩn badge nếu không có tin nhắn chưa đọc
                >
                  <ChatIcon />
                </Badge>
              </Button>
            )}
            <Button className="user-header-btn" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </Button>
            <Button className="user-header-btn" onClick={handleClick}>
              {currentUser ? `Hi, ${currentUser.username}` : "Tài khoản"}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        classes={{ paper: "menu" }}
      >
        {!currentUser ? (
          <>
            <MenuItem
              className="menu-item"
              onClick={() => {
                navigate("/login");
                setAnchorEl(null);
              }}
            >
              Đăng Nhập
            </MenuItem>
            <MenuItem
              className="menu-item"
              onClick={() => {
                navigate("/register");
                setAnchorEl(null);
              }}
            >
              Đăng Ký
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              className="menu-item"
              onClick={() => {
                navigate("/managerAc");
                setAnchorEl(null);
              }}
            >
              Quản lý tài khoản
            </MenuItem>
            <MenuItem className="menu-item" onClick={handleLogout}>
              Đăng Xuất
            </MenuItem>
          </>
        )}
      </Menu>

      <Notification
        notifications={notifications}
        anchorEl={notificationsMenuAnchorEl}
        onClose={handleNotificationClose}
        onNotificationClose={handleNotificationClose}
        markAsRead={markAsRead}
        accessToken={accessToken}
        onUpdateUnreadCount={handleUpdateUnreadCount}
      />
    </>
  );
};

export default Header;
