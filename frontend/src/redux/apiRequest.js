import axios from "axios";
import { toast } from "react-toastify";
import {
  forgotPasswordFailed,
  forgotPasswordSuccess,
  googleLoginFailed,
  googleLoginStart,
  googleLoginSuccess,
  loginFailed,
  loginStart,
  loginSuccess,
  logoutFailed,
  logoutStart,
  logoutSuccess,
  registerFailed,
  registerStart,
  registerSuccess,
} from "./authSlice";
import {
  getNotificationsFailed,
  getNotificationsStart,
  getNotificationsSuccess,
  markAsReadFailed,
  markAsReadStart,
  markAsReadSuccess,
} from "./notificationSlice";
import {
  deleteUserFailed,
  deleteUserStart,
  deleteUserSuccess,
  getUsersFailed,
  getUsersSuccess,
  getUserStart,
} from "./userSlice";

export const loginUser = async (user, dispatch, navigate, setErrorMessage) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(loginStart());

  try {
    const res = await axios.post(`${process.env.REACT_APP_BASE_URL_API}/v1/auth/login`, user);
    const userData = res.data;

    dispatch(loginSuccess(userData));

    // Redirect user based on their role
    if (userData.admin === true) {
      navigate("/admin-dashboard");
    } else {
      navigate("/");
    }
  } catch (err) {
    // Check if the error has a response from the server
    if (err.response) {
      console.error("Login Error:", err.response.data);

      // Handle specific error codes from the server
      if (err.response.status === 404) {
        setErrorMessage("Tên đăng nhập không đúng!");
      } else if (err.response.status === 401) {
        setErrorMessage("Mật khẩu không đúng!");
      } else if (err.response.status === 403) {
        toast.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
      } else {
        setErrorMessage(
          err.response.data.message ||
            "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.",
        );
      }
    } else if (err.request) {
      console.error(
        "Network error or no response from the server:",
        err.message,
      );
      setErrorMessage(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      );
    } else {
      // Handle other unexpected errors
      console.error("Other error:", err.message);
      setErrorMessage("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
    }

    dispatch(loginFailed());
  }
};

export const registerUser = async (
  user,
  dispatch,
  navigate,
  setErrorMessage,
) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(registerStart());

  try {
    const res = await axios.post("/v1/auth/register", user);
    dispatch(registerSuccess(res.data));
    navigate("/login");
  } catch (err) {
    if (err.response) {
      console.error("Register error:", err.response.data);

      // Kiểm tra lỗi trả về từ server và hiển thị thông báo tương ứng
      const errorMessage = err.response.data.message || "Đăng ký thất bại!";

      // Nếu lỗi là trùng email hoặc trùng tên, hiển thị thông báo cụ thể
      if (err.response.data.message.includes("Email đã tồn tại")) {
        setErrorMessage("Email đã tồn tại. Vui lòng chọn email khác.");
      } else if (
        err.response.data.message.includes("Tên người dùng đã tồn tại")
      ) {
        setErrorMessage("Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
      } else {
        setErrorMessage(errorMessage);
      }
    } else {
      console.error("Register error:", err.message);
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    }
    dispatch(registerFailed());
  }
};

export const getAllUsers = async (accessToken, dispatch, axiosJWT) => {
  console.log("Access Token:", accessToken);
  dispatch(getUserStart());
  try {
    const res = await axiosJWT.get("/v1/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    dispatch(getUsersSuccess(res.data));
  } catch (err) {
    if (err.response) {
      const errorMessage = err.response.data.message || "Get users failed";
      console.error("Get users error:", errorMessage);
      console.log("Error Details:", err.response);
    } else {
      console.error("Get users error:", err.message);
      console.log("Error Details:", err);
    }
    dispatch(getUsersFailed());
  }
};

export const deleteUser = async (userId, accessToken, dispatch) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(deleteUserStart());
  try {
    await axios.delete(`/v1/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    dispatch(deleteUserSuccess(userId));
  } catch (err) {
    if (err.response) {
      console.error("Delete user error:", err.response.data);
      const errorMessage = err.response.data.message || "Delete user failed";
      console.error("Error message:", errorMessage);
    } else {
      console.error("Delete user error:", err.message);
    }
    dispatch(deleteUserFailed());
  }
};

export const logout = async (dispatch, id, navigate, accessToken, axiosJWT) => {
  axiosJWT.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(logoutStart());
  try {
    const res = await axiosJWT.post(
      "/v1/auth/logout",
      { id },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    dispatch(logoutSuccess(res.data));
    navigate("/");
  } catch (err) {
    if (err.response) {
      console.error("Logout error:", {
        message: err.response.data.message || "Logout failed",
        statusCode: err.response.status,
        statusText: err.response.statusText,
        headers: err.response.headers,
        data: err.response.data,
      });
    } else {
      console.error("Logout error:", {
        message: err.message,
        stack: err.stack,
      });
    }
    dispatch(logoutFailed());
  }
};

export const googleLogin = async (tokenId, dispatch, navigate) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(googleLoginStart());

  try {
    // Gửi tokenId đến backend để xác minh
    const res = await axios.post("/v1/auth/google", { tokenId });
    const userData = res.data;

    // Kiểm tra nếu có accessToken từ backend
    if (userData && userData.accessToken) {
      // Cập nhật Redux store
      dispatch(
        googleLoginSuccess({
          credential: tokenId, // Lưu credential (tokenId)
          accessToken: userData.accessToken, // Lưu accessToken
        }),
      );
      navigate("/"); // Điều hướng về trang chủ
    } else {
      throw new Error("Phản hồi từ server không có accessToken");
    }
  } catch (err) {
    if (err.response) {
      console.error("Google login error:", err.response.data);
      const errorMessage =
        err.response.data.error || "Đăng nhập Google thất bại.";
      console.error("Chi tiết lỗi:", errorMessage);
    } else {
      console.error("Google login error:", err.message);
    }
    dispatch(googleLoginFailed()); // Thông báo lỗi tới Redux
  }
};

export const resetPasswordRequest = async (
  userEmail,
  dispatch,
  setMessage,
  navigate,
) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API
  try {
    const res = await axios.post("/v1/auth/forgot-password", userEmail);
    dispatch(forgotPasswordSuccess());
    setMessage("Đường dẫn đặt lại mật khẩu đã được gửi đến email của bạn.");
    navigate("/login"); // Chuyển về màn hình login sau khi yêu cầu thành công
  } catch (err) {
    console.error("Forgot password error:", err.response || err.message);
    setMessage("Đã xảy ra lỗi, vui lòng thử lại.");
    dispatch(forgotPasswordFailed());
  }
};

export const resetPassword = async (
  passwordData,
  dispatch,
  setMessage,
  navigate,
) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  try {
    const res = await axios.post("/v1/auth/reset-password", passwordData);
    setMessage("Mật khẩu đã được thay đổi thành công.");
    navigate("/login"); // Sau khi đặt lại mật khẩu thành công, chuyển hướng về login
  } catch (err) {
    console.error("Reset password error:", err.response || err.message);
    setMessage("Đã xảy ra lỗi, vui lòng thử lại.");
  }
};

//Cập nhật thông tin người dùng
export const updateUserProfile = async (
  userId,
  profileData,
  accessToken,
  dispatch,
) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(loginStart());

  try {
    // Gửi yêu cầu PUT đến API
    const res = await axios.put(
      `/v1/user/update-profile/${userId}`,
      profileData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log("token", accessToken);
    const updatedUser = res.data.user; // Thông tin người dùng mới từ API
    dispatch(loginSuccess(updatedUser)); // Dispatch action để cập nhật store
    toast.success("Cập nhật thông tin người dùng thành công!");
  } catch (err) {
    if (err.response) {
      // Xử lý lỗi trả về từ server
      console.error("Error updating profile:", err.response.data);
      const errorMessage =
        err.response.data.message || "Cập nhật thông tin thất bại.";
      console.error("Error message:", errorMessage);
    } else {
      // Lỗi khác (mạng hoặc không phản hồi)
      console.error("Error updating profile:", err.message);
    }
    dispatch(loginFailed()); // Dispatch action thông báo thất bại
  }
};

export const getNotifications = async (accessToken, dispatch) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(getNotificationsStart());
  try {
    const response = await axios.get("/v1/user/notifications", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    dispatch(getNotificationsSuccess(response.data.notifications));
  } catch (err) {
    if (err.response) {
      console.error("Get notifications error:", err.response.data);
      const errorMessage =
        err.response.data.message || "Failed to fetch notifications";
      console.error("Error message:", errorMessage);
    } else {
      console.error("Get notifications error:", err.message);
    }
    dispatch(getNotificationsFailed());
  }
};

export const markNotificationAsRead = async (
  notificationId,
  accessToken,
  dispatch,
) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;
  dispatch(markAsReadStart());
  try {
    const response = await axios.patch(
      `/v1/user/notifications/${notificationId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    dispatch(markAsReadSuccess(response.data.notification));
  } catch (err) {
    if (err.response) {
      console.error("Mark notification as read error:", err.response.data);
      const errorMessage =
        err.response.data.message || "Failed to mark notification as read";
      console.error("Error message:", errorMessage);
    } else {
      console.error("Mark notification as read error:", err.message);
    }
    dispatch(markAsReadFailed());
  }
};

export const changePassword = async (
  passwordData,
  accessToken,
  dispatch,
  setMessage,
) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_API;

  try {
    // Gửi yêu cầu thay đổi mật khẩu đến backend
    const res = await axios.post("/v1/auth/change-password", passwordData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Gửi token để xác thực
      },
    });

    // Xử lý phản hồi từ server nếu thành công
    setMessage("Mật khẩu đã được thay đổi thành công!");
    console.log("Password change success:", res.data.message);
  } catch (err) {
    // Xử lý lỗi trả về từ server
    if (err.response) {
      console.error("Change password error:", err.response.data);
      const errorMessage =
        err.response.data.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      setMessage(errorMessage);
    } else {
      // Xử lý lỗi mạng hoặc không phản hồi
      console.error("Change password error:", err.message);
      setMessage("Lỗi kết nối, vui lòng kiểm tra mạng.");
    }
  }
};
