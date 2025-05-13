import axios from "axios";
import {
  getNotificationsSuccess,
  markAsReadFailed,
  markAsReadStart,
  markAsReadSuccess,
} from "./notificationSlice";

let axiosJWT = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL_API,
});

export const fetchNotifications = async (token) => {
  try {
    const response = await axiosJWT.get(`/v1/user/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`, // Gửi token trong header để xác thực
      },
    });
    return response.data.notifications; // Trả về danh sách thông báo
  } catch (error) {
    console.error(
      "Error fetching notifications:",
      error.response?.data || error.message,
    );
    throw error; // Ném lỗi để xử lý ở frontend
  }
};

export const markNotificationAsRead = async (
  notificationId,
  accessToken,
  dispatch,
) => {
  axios.defaults.baseURL =
  process.env.REACT_APP_BASE_URL_API;
  dispatch(markAsReadStart());
  try {
    // console.log("Notification ID:", notificationId);
    // console.log("Access Token:", accessToken);
    const response = await axios.put(
      `/v1/user/notifications/${notificationId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    dispatch(markAsReadSuccess(response.data.notification));
    dispatch(getNotificationsSuccess(response.data.notifications));
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
