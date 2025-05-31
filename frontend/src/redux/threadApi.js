import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/forum`;

/**
 * Lấy danh sách threads
 * @param {number} page - Số trang hiện tại
 * @param {number} limit - Số lượng threads trên mỗi trang
 * @returns {Promise} - Trả về dữ liệu threads và thông tin phân trang
 */
export const getForumThreads = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/threads?page=${page}&limit=${limit}`);
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    // Xử lý các loại lỗi khác nhau
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 404) {
        throw new Error("API endpoint không tồn tại");
      } else if (status === 500) {
        throw new Error("Lỗi server, vui lòng thử lại sau");
      } else {
        throw new Error(data.message || "Đã xảy ra lỗi không xác định");
      }
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server");
    } else {
      throw new Error("Không thể lấy danh sách bài viết: " + error.message);
    }
  }
};

/**
 * Lấy chi tiết một thread theo ID
 * @param {string} threadId - ID của thread cần lấy
 * @returns {Promise} - Trả về dữ liệu chi tiết của thread
 */
export const getThreadById = async (threadId) => {
  try {
    const response = await axios.get(`${API_URL}/threads/${threadId}`);
    return response.data;
  } catch (error) {
    throw new Error("Không thể lấy chi tiết bài viết: " + error.message);
  }
};

/**
 * Tạo thread mới
 * @param {Object} threadData - Dữ liệu thread mới
 * @param {string} token - JWT token để authentication
 * @returns {Promise} - Trả về thông tin thread đã được tạo
 */
export const createThread = async (threadData, token) => {
  try {
    const response = await axios.post(`${API_URL}/threads`, threadData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (response.status === 201 || response.status === 200) {
      return response.data;
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    // Xử lý các loại lỗi khác nhau
    if (error.response) {
      // Server trả về response với status code lỗi
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error("Bạn cần đăng nhập để tạo bài viết");
      } else if (status === 403) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn");
      } else if (status === 400) {
        // Lỗi validation
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error(data.message || "Dữ liệu không hợp lệ");
        }
      } else if (status === 500) {
        throw new Error("Lỗi server, vui lòng thử lại sau");
      } else {
        throw new Error(data.message || "Đã xảy ra lỗi không xác định");
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      throw new Error("Không thể kết nối đến server");
    } else {
      // Lỗi khác
      throw new Error("Không thể tạo bài viết: " + error.message);
    }
  }
};

// /**
//  * Like một thread
//  * @param {string} threadId - ID của thread
//  * @param {string} token - JWT token để authentication
//  * @returns {Promise} - Trả về thông tin cập nhật về likes
//  */
// export const likeThread = async (threadId, token) => {
//   try {
//     const response = await axios.put(`${API_URL}/threads/${threadId}/like`, {}, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error("Không thể thích bài viết: " + error.message);
//   }
// };

/**
 * Like một thread
 * @param {string} threadId - ID của thread
 * @param {string} token - JWT token để authentication
 * @returns {Promise} - Trả về thông tin cập nhật về likes
 */
export const likeThread = async (threadId, token) => {
  try {
    const response = await axios.post(`${API_URL}/threads/${threadId}/like`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error("Bạn cần đăng nhập để thích bài viết");
      } else if (status === 403) {
        throw new Error("Token không hợp lệ");
      } else if (status === 404) {
        throw new Error("Không tìm thấy bài viết");
      } else {
        throw new Error(data.message || "Không thể thích bài viết");
      }
    }
    throw new Error("Không thể kết nối đến server");
  }
};

/**
 * Dislike một thread
 * @param {string} threadId - ID của thread
 * @param {string} token - JWT token để authentication
 * @returns {Promise} - Trả về thông tin cập nhật về dislikes
 */
export const dislikeThread = async (threadId, token) => {
  try {
    const response = await axios.post(`${API_URL}/threads/${threadId}/dislike`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error("Bạn cần đăng nhập để không thích bài viết");
      } else if (status === 403) {
        throw new Error("Token không hợp lệ");
      } else if (status === 404) {
        throw new Error("Không tìm thấy bài viết");
      } else {
        throw new Error(data.message || "Không thể không thích bài viết");
      }
    }
    throw new Error("Không thể kết nối đến server");
  }
};

/**
 * Lấy trạng thái like/dislike của user cho thread
 * @param {string} threadId - ID của thread
 * @param {string} token - JWT token để authentication
 * @returns {Promise} - Trả về trạng thái like/dislike
 */
export const getThreadLikeStatus = async (threadId, token) => {
  try {
    const response = await axios.get(`${API_URL}/threads/${threadId}/like-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // User not logged in - return default status
      return {
        success: true,
        data: {
          liked: false,
          disliked: false,
          likesCount: 0,
          dislikesCount: 0
        }
      };
    }
    throw new Error("Không thể lấy trạng thái like");
  }
};