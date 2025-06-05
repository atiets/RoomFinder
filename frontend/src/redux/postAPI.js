import axios from "axios";
import { useState } from "react";

const API_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/posts/`;

export const createPost = async (postData, token) => {
  const response = await axios.post(API_URL, postData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
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

//get posts for compare price
export const getDistrictCoordinatesByCity = async () => {
  try {
    const response = await axios.get(`${API_URL}district-coordinates`);
    return response.data;
  } catch (error) {
    throw new Error("Không thể lấy dữ liệu tọa độ quận/huyện: " + error.message);
  }
};

//get data for compare chart
export const getCompareChartData = async (province, district, category, transactionType) => {
  try {
    // Kiểm tra các tham số bắt buộc
    if (!province || !district || !category || !transactionType) {
      throw new Error("Vui lòng cung cấp đầy đủ thông tin tỉnh, quận, loại BĐS và loại giao dịch.");
    }

    const response = await axios.get(`${API_URL}compare-chart`, {
      params: {
        province,
        district,
        category,
        transactionType
      }
    });
    
    return response.data;
  } catch (error) {
    // Xử lý lỗi chi tiết hơn
    if (error.response) {
      // Lỗi do server trả về với status code không thành công
      throw new Error(`Không thể lấy dữ liệu biểu đồ: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // Lỗi do không nhận được response từ server
      throw new Error("Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối internet của bạn.");
    } else {
      // Lỗi khác
      throw error;
    }
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
    console.log("🔍 Searching with params:", params);
    
    const response = await axios.get(`${API_URL}search`, {
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("🎯 Search results:", response.data.length, "posts found");
    return response.data;
  } catch (error) {
    console.error("❌ Search error:", error);
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
  `${process.env.REACT_APP_BASE_URL_API}/v1/reviews/`;

export const createReview = async (postId, reviewData, token) => {
  try {
    const response = await axios.post(
      `${REVIEW_API_URL}${postId}`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type": "multipart/form-data",
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
  const categoryList = {
    category1: "phòng trọ",
    category2: "Căn hộ/chung cư",
    category3: "Văn phòng, mặt bằng kinh doanh",
    category4: "Nhà ở",
    category5: "Đất",
  };

  const [category1, category2, category3, category4, category5] = await Promise.all([
    searchPosts({ ...params, category: categoryList.category1 }, token),
    searchPosts({ ...params, category: categoryList.category2 }, token),
    searchPosts({ ...params, category: categoryList.category3 }, token),
    searchPosts({ ...params, category: categoryList.category4 }, token),
    searchPosts({ ...params, category: categoryList.category5 }, token),
  ]);

  return { category1, category2, category3, category4, category5 };
};

// export const searchAndCategorizePosts = async (params, token) => {
//   try {
//     const response = await axios.get(`${API_URL}search`, {
//       params: {
//         ...params,
//         category: params.category.join(',') // Convert array to string
//       },
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error("Lỗi khi tìm kiếm và phân loại bài đăng:", error);
//     throw error;
//   }
// };

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

export async function fetchSuggestedPosts(postId, token, page) {
  try {
    const response = await fetch(`${API_URL}suggestions/${postId}?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Lỗi khi lấy dữ liệu');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi gọi API:", error);
    return null;
  }
}


