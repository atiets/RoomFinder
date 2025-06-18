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
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { createAxios } from "../../../createInstance";
import useSocketForum from '../../../hooks/useSocketForum';
import { useUsageManager } from '../../../hooks/useUsageManager';
import { logout } from "../../../redux/apiRequest";
import { logoutSuccess } from "../../../redux/authSlice";
import Notification from "../Notification/Notification";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsMenuAnchorEl, setNotificationsMenuAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [localPostQuota, setLocalPostQuota] = useState(null); // ⭐ Thêm state cho gói Free
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const { currentUsage, loading } = useUsageManager(); // ⭐ Thêm hook usage
  const dispatch = useDispatch();
  const accessToken = currentUser?.accessToken;
  
  const userId = useMemo(() => {
    if (!currentUser) {
      console.log("🔍 No current user found");
      return null;
    }
    
    const id = currentUser._id || currentUser.id;
    console.log("🔍 Extracted user ID:", id, "from currentUser:", currentUser.username);
    return id;
  }, [currentUser]);
  
  const { socket, isConnected } = useSocketForum(userId);
  
  const axiosJWT = createAxios(currentUser, dispatch, logoutSuccess);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // ⭐ HELPER FUNCTIONS
  const getPlanType = () => {
    if (!currentUsage) return "free";
    return currentUsage.planType || "free";
  };

  // ⭐ FETCH USER QUOTA CHO GÓI FREE
  const fetchUserQuota = async () => {
    if (!currentUser?.accessToken) return;

    const planType = getPlanType();
    if (planType !== "free") return;

    try {
      console.log("🔄 Fetching user quota for Free plan...");

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL_API || "http://localhost:8000"}/v1/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.data.success) {
        const newQuota = response.data.data.postQuota;
        setLocalPostQuota(newQuota);
        console.log("✅ User quota fetched:", newQuota);
      }
    } catch (error) {
      console.error("Error fetching user quota:", error);
      console.log("📋 Using fallback quota from currentUser");
      setLocalPostQuota(currentUser?.postQuota || 3);
    }
  };

  // ⭐ CHECK CAN POST
  const canPost = () => {
    if (!currentUser) return false;

    const planType = getPlanType();

    if (planType === "free") {
      // Gói Free: ưu tiên localPostQuota (fetch từ API), fallback currentUser.postQuota
      const freeQuota = localPostQuota ?? currentUser?.postQuota ?? 0;
      return freeQuota > 0;
    } else {
      // Gói Pro/Plus: check từ currentUsage
      const quota = currentUsage?.currentUsage?.postsCreated || 0;
      return quota > 0;
    }
  };

  // ⭐ Effect để fetch quota cho gói Free
  useEffect(() => {
    const planType = getPlanType();
    if (planType === "free") {
      fetchUserQuota();
    }
  }, [currentUser?.accessToken, currentUsage?.planType]);

  useEffect(() => {
    console.log("🔍 Header User Debug:", {
      hasCurrentUser: !!currentUser,
      username: currentUser?.username,
      userId: userId,
      hasAccessToken: !!accessToken,
      hasSocket: !!socket,
      isSocketConnected: isConnected,
      planType: getPlanType(),
      localPostQuota: localPostQuota
    });
  }, [currentUser, userId, accessToken, socket, isConnected, localPostQuota]);

  const isSocketReady = (socketInstance) => {
    const ready = socketInstance && 
           typeof socketInstance === 'object' && 
           typeof socketInstance.on === 'function' && 
           typeof socketInstance.off === 'function' &&
           isConnected;
    
    if (!ready) {
      console.log("🔍 Socket readiness check:", {
        hasSocket: !!socketInstance,
        isObject: typeof socketInstance === 'object',
        hasOnMethod: typeof socketInstance?.on === 'function',
        hasOffMethod: typeof socketInstance?.off === 'function',
        isConnected: isConnected
      });
    }
    
    return ready;
  };

  // Socket listeners for chat
  useEffect(() => {
    if (!userId || !isSocketReady(socket)) {
      console.log("⚠️ Socket not ready for chat listeners");
      return;
    }

    console.log("🎧 Setting up chat listeners for user:", userId);
    
    const handleUnreadConversations = (data) => {
      console.log("📱 Received unread conversations count:", data);
      setUnreadChatCount(data.count || 0);
    };

    const handleError = (error) => {
      console.error("🔥 Socket chat error:", error);
    };

    try {
      socket.on("unreadConversationsCount", handleUnreadConversations);
      socket.on("error", handleError);
      socket.emit("requestUnreadCount");

      return () => {
        try {
          if (isSocketReady(socket)) {
            socket.off("unreadConversationsCount", handleUnreadConversations);
            socket.off("error", handleError);
            console.log("🧹 Cleaned up chat listeners");
          }
        } catch (error) {
          console.error("🔥 Error cleaning up chat listeners:", error);
        }
      };
    } catch (error) {
      console.error("🔥 Error setting up chat listeners:", error);
    }
  }, [socket, isConnected, userId]);

  // Socket listeners for forum notifications
  useEffect(() => {
    if (!userId || !isSocketReady(socket)) {
      console.log("⚠️ Socket not ready for forum listeners");
      return;
    }

    console.log("🎧 Setting up forum listeners for user:", userId);
    
    const handleForumNotification = (data) => {
      try {
        console.log("🏛️ Header received forum notification:", data);
        
        setUnreadCount(prev => {
          const newCount = prev + 1;
          console.log(`📊 Forum notification - updating unread count: ${prev} -> ${newCount}`);
          return newCount;
        });

        if (Notification.permission === 'granted') {
          new Notification(`Diễn đàn - ${data.notification.from_user?.username || 'Ai đó'}`, {
            body: data.notification.message,
            icon: '/favicon.ico',
            tag: `forum-${data.notification.type}`
          });
        }
      } catch (error) {
        console.error("🔥 Error handling forum notification:", error);
      }
    };

    const handleGeneralNotification = (data) => {
      try {
        console.log("📢 Header received general notification:", data);
        setUnreadCount(prev => {
          const newCount = prev + 1;
          console.log(`📊 General notification - updating unread count: ${prev} -> ${newCount}`);
          return newCount;
        });
      } catch (error) {
        console.error("🔥 Error handling general notification:", error);
      }
    };

    const handleError = (error) => {
      console.error("🔥 Socket forum error:", error);
    };

    try {
      socket.on("forumNotification", handleForumNotification);
      socket.on("postModerationStatus", handleGeneralNotification);
      socket.on("error", handleError);

      return () => {
        try {
          if (isSocketReady(socket)) {
            socket.off("forumNotification", handleForumNotification);
            socket.off("postModerationStatus", handleGeneralNotification);
            socket.off("error", handleError);
            console.log("🧹 Cleaned up forum listeners");
          }
        } catch (error) {
          console.error("🔥 Error cleaning up forum listeners:", error);
        }
      };
    } catch (error) {
      console.error("🔥 Error setting up forum listeners:", error);
    }
  }, [socket, isConnected, userId]);

  // Update notifications from Redux
  useEffect(() => {
    try {
      if (!currentUser) {
        console.log("📊 No current user, resetting notifications");
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      if (currentUser.notifications && Array.isArray(currentUser.notifications)) {
        const sortedNotifications = [...currentUser.notifications].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setNotifications(sortedNotifications);
        
        const unread = sortedNotifications.filter(
          (notification) => notification.status === "unread"
        ).length;
        
        console.log(`📊 Redux notifications loaded: ${sortedNotifications.length} total, ${unread} unread`);
        setUnreadCount(unread);
      } else {
        console.log("📊 No notifications array in currentUser, setting defaults");
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("🔥 Error processing notifications from Redux:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser, currentUser?.notifications]);

  // Request browser notification permission
  useEffect(() => {
    if (currentUser && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Browser notification permission:', permission);
      });
    }
  }, [currentUser]);

  const handleUpdateUnreadCount = (count) => {
    try {
      console.log(`📊 Notification component requesting unread count update to: ${count}`);
      setUnreadCount(count);
    } catch (error) {
      console.error("🔥 Error updating unread count:", error);
    }
  };

  const handleLogout = () => {
    try {
      console.log("🚪 Logging out user:", userId);
      logout(dispatch, userId, navigate, accessToken, axiosJWT);
      setUnreadCount(0);
      setUnreadChatCount(0);
    } catch (error) {
      console.error("🔥 Error during logout:", error);
    }
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

  // ⭐ SỬA FUNCTION handleAddPost THEO LOGIC PLAN TYPE
  const handleAddPost = () => {
    if (!currentUser) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để đăng tin.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm',
          cancelButton: 'custom-swal-cancel'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else if (!canPost()) {
      // ⭐ CHECK THEO PLAN TYPE
      const planType = getPlanType();
      
      if (planType === "free") {
        Swal.fire({
          title: "Hết lượt đăng tin miễn phí",
          text: "Bạn đã hết lượt đăng tin miễn phí trong tháng. Nâng cấp gói để có thêm lượt đăng tin.",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Nâng cấp gói",
          cancelButtonText: "Hủy",
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm',
            cancelButton: 'custom-swal-cancel'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/subscription");
          }
        });
      } else {
        // Pro/Plus hết quota
        Swal.fire({
          title: "Hết lượt đăng tin",
          text: "Bạn đã hết lượt đăng tin trong gói hiện tại. Vui lòng chờ reset hoặc nâng cấp gói cao hơn.",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Nâng cấp gói",
          cancelButtonText: "Hủy",
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm',
            cancelButton: 'custom-swal-cancel'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/subscription");
          }
        });
      }
    } else {
      navigate("/AddPost");
    }
  };

  const markAsRead = (notificationId) => {
    try {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("🔥 Error marking notification as read:", error);
    }
  };

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
              onClick={() => navigate("/subscription")}
            >
              Gói dịch vụ
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
                  badgeContent={unreadChatCount}
                  color="error"
                  invisible={unreadChatCount === 0}
                >
                  <ChatIcon />
                </Badge>
              </Button>
            )}
            
            {currentUser && (
              <Button className="user-header-btn" onClick={handleNotificationClick}>
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  invisible={unreadCount === 0}
                >
                  <NotificationsIcon />
                </Badge>
              </Button>
            )}
            
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

      {currentUser && (
        <Notification
          notifications={notifications}
          anchorEl={notificationsMenuAnchorEl}
          onClose={handleNotificationClose}
          onNotificationClose={handleNotificationClose}
          markAsRead={markAsRead}
          userId={userId}
          accessToken={accessToken}
          onUpdateUnreadCount={handleUpdateUnreadCount}
          socket={socket}
        />
      )}
    </>
  );
};

export default Header;