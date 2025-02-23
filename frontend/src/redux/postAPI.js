import axios from "axios";
import { useState } from "react";

const API_URL = "http://localhost:8000/v1/posts/";

export const createPost = async (postData, token) => {
  const response = await axios.post(API_URL, postData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("Response status:", response.status);
  console.log("Response data:", response.data);
  if (response.status === 201 || response.status === 200) {
    return response;
  } else {
    throw new Error("Unexpected response status: " + response.status);
  }
};

export const getAllPosts = async (
  token,
  page = 1,
  limit = 10,
  status = "",
  visibility = "",
) => {
  try {
    const response = await axios.get(`${API_URL}posts`, {
      params: { page, limit, status, visibility },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getApprovedPosts = async () => {
  try {
    const response = await axios.get(`${API_URL}posts-by-status`, {
      params: { status: "approved", visibility: "visible" },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPostDetail = async (id) => {
  try {
    const response = await axios.get(`${API_URL}posts/${id}`);
    return response;
    
  } catch (error) {
    console.error("Lỗi khi gọi API lấy chi tiết bài đăng:", error);
    throw error;
  }
};

export const getUserPostsByStateAndVisibility = async (
  status,
  visibility,
  token,
) => {
  try {
    const response = await axios.get(`${API_URL}list-post-pending`, {
      params: { status, visibility },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error(
      "Lỗi khi gọi API lấy bài đăng của người dùng theo trạng thái và visibility:",
      error,
    );
    throw error;
  }
};

export const togglePostVisibility = async (postId, token) => {
  try {
    const response = await axios.put(
      `${API_URL}toggle-visibility/${postId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi gọi API thay đổi trạng thái hiển thị bài viết:",
      error,
    );
    throw error;
  }
};

export const deletePost = async (postId, token) => {
  try {
    const response = await axios.delete(`${API_URL}posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePost = async (postId, postData, token) => {
  try {
    const response = await axios.put(`${API_URL}update/${postId}`, postData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật bài đăng:", error);
    throw error;
  }
};

export const approvePost = async (token, postId) => {
  try {
    const response = await axios.put(
      `${API_URL}${postId}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const rejectPost = async (token, postId) => {
  try {
    const response = await axios.put(
      `${API_URL}${postId}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const hiddePost = async (token, postId) => {
  try {
    const response = await axios.put(
      `${API_URL}${postId}/hidden`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API ẩn bài viết:", error);
    throw error;
  }
};

export const visiblePost = async (token, postId) => {
  try {
    const response = await axios.put(
      `${API_URL}${postId}/visible`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API hiện bài viết:", error);
    throw error;
  }
};

//Admin lấy bài đăng của người dùng
export const getUserPostsByUserId = async (token, userId) => {
  try {
    const response = await axios.get(`${API_URL}user-posts/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const searchPosts = async (params, token) => {
  try {
    const response = await axios.get(`${API_URL}search`, {
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm bài đăng:", error);
    throw error;
  }
};

export const getPostCountByDateRange = async (startDate, endDate, token) => {
  try {
    const response = await axios.get(`${API_URL}by-date`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Trả về dữ liệu thống kê số lượng bài đăng theo ngày
  } catch (error) {
    console.error(
      "Lỗi khi gọi API thống kê số lượng bài đăng theo ngày:",
      error,
    );
    throw error;
  }
};

// Get top categories with the most posts
export const getTopCategories = async (token) => {
  try {
    const response = await axios.get(`${API_URL}top-categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Trả về danh sách 7 loại hình cho thuê có nhiều bài đăng nhất
  } catch (error) {
    console.error(
      "Lỗi khi gọi API thống kê 7 loại hình cho thuê nhiều bài đăng nhất:",
      error,
    );
    throw error;
  }
};

// Get top provinces with the most posts
export const getTopProvinces = async (token) => {
  try {
    const response = await axios.get(`${API_URL}top-provinces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Trả về danh sách 7 tỉnh/thành phố có nhiều bài đăng nhất
  } catch (error) {
    console.error(
      "Lỗi khi gọi API thống kê 7 tỉnh/thành phố nhiều bài đăng nhất:",
      error,
    );
    throw error;
  }
};

// API URL cho reviews
const REVIEW_API_URL =
  "https://befindrentalrooms-production.up.railway.app/v1/reviews/";

export const createReview = async (postId, reviewData, token) => {
  try {
    const response = await axios.post(
      `${REVIEW_API_URL}${postId}`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo bài đánh giá:", error);
    throw error;
  }
};

export const getReviewsByPostId = async (postId) => {
  try {
    const response = await axios.get(`${REVIEW_API_URL}${postId}`);
    return response.data || []; // Đảm bảo luôn trả về mảng
  } catch (error) {
    console.error("Lỗi khi lấy bài đánh giá:", error);
    return [];
  }
};

export const deleteReview = async (reviewId, token) => {
  try {
    const response = await axios.delete(`${REVIEW_API_URL}${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bài đánh giá:", error);
    throw error;
  }
};

export const editReview = async (reviewId, updatedData, token) => {
  try {
    const response = await axios.put(
      `${REVIEW_API_URL}${reviewId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa bài đánh giá:", error);
    throw error;
  }
};

export const updateDefaultDaysToShow = async (days, token) => {
  try {
    const response = await axios.put(
      `${API_URL}update-default-days`,
      { days },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật số ngày hiển thị mặc định:", error);
    throw error;
  }
};

export const searchAndCategorizePosts = async (params, token) => {
  try {
    const posts = await searchPosts(params, token);

    const category1 = [];
    const category2 = [];
    const category3 = [];

    posts.forEach((post) => {
      if (post.category === "Nhà trọ, phòng trọ") {
        category1.push(post);
      } else if (
        [
          "Nhà nguyên căn",
          "Cho thuê căn hộ",
          "Cho thuê căn hộ mini",
          "Cho thuê căn hộ dịch vụ",
        ].includes(post.category)
      ) {
        category2.push(post);
      } else if (post.category === "Cho thuê mặt bằng, văn phòng") {
        category3.push(post);
      }
    });

    return {
      category1,
      category2,
      category3,
    };
  } catch (error) {
    console.error("Lỗi khi phân loại bài đăng:", error);
    throw error;
  }
};

export const useFavoriteToggle = (user) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = async (postId, isCurrentlyFavorite) => {
    try {
      const url = `${API_URL}${postId}/favorite`;
      const headers = { Authorization: `Bearer ${user?.accessToken}` };

      if (isCurrentlyFavorite) {
        await axios.delete(url, { headers });
        setFavorites(favorites.filter((fav) => fav._id !== postId));
      } else {
        await axios.post(url, {}, { headers });
        setFavorites((prev) => [...prev, { _id: postId }]);
      }
    } catch (error) {
      console.error("Lỗi khi bật/tắt trạng thái yêu thích:", error);
    }
  };

  return { favorites, toggleFavorite };
};
