import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/forum`;

/**
 * Lấy comments của thread
 * @param {string} threadId - ID của thread
 * @param {number} page - Số trang
 * @param {number} limit - Số lượng comments per page
 * @returns {Promise} - Comments data
 */
export const getThreadComments = async (threadId, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_URL}/threads/${threadId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 404) {
        throw new Error("Không tìm thấy bài viết");
      } else {
        throw new Error(data.message || "Không thể lấy bình luận");
      }
    }
    throw new Error("Không thể kết nối đến server");
  }
};

/**
 * Tạo comment mới
 * @param {string} threadId - ID của thread
 * @param {Object} commentData - Data của comment
 * @param {string} token - JWT token
 * @returns {Promise} - Comment data
 */
export const createComment = async (threadId, commentData, token) => {
  try {
    const response = await axios.post(`${API_URL}/threads/${threadId}/comments`, commentData, {
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
        throw new Error("Bạn cần đăng nhập để bình luận");
      } else if (status === 403) {
        throw new Error("Bài viết chưa được phê duyệt");
      } else if (status === 400) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error(data.message || "Dữ liệu không hợp lệ");
        }
      } else {
        throw new Error(data.message || "Không thể tạo bình luận");
      }
    }
    throw new Error("Không thể kết nối đến server");
  }
};

/**
 * Like comment
 * @param {string} commentId - ID của comment
 * @param {string} token - JWT token
 * @returns {Promise} - Like status
 */
export const likeComment = async (commentId, token) => {
  try {
    const response = await axios.post(`${API_URL}/comments/${commentId}/like`, {}, {
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
        throw new Error("Bạn cần đăng nhập để thích bình luận");
      } else if (status === 404) {
        throw new Error("Không tìm thấy bình luận");
      } else {
        throw new Error(data.message || "Không thể thích bình luận");
      }
    }
    throw new Error("Không thể kết nối đến server");
  }
};

/**
 * Cập nhật comment
 * @param {string} commentId - ID của comment
 * @param {Object} updateData - Data cập nhật
 * @param {string} token - JWT token
 * @returns {Promise} - Updated comment data
 */
export const updateComment = async (commentId, updateData, token) => {
  try {
    const response = await axios.put(`${API_URL}/comments/${commentId}`, updateData, {
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
        throw new Error("Bạn cần đăng nhập để sửa bình luận");
      } else if (status === 403) {
        throw new Error(data.message || "Bạn không có quyền sửa bình luận này");
      } else if (status === 404) {
        throw new Error("Không tìm thấy bình luận");
      } else {
        throw new Error(data.message || "Không thể sửa bình luận");
      }
    }
    throw new Error("Không thể kết nối đến server");
  }
};

/**
 * Xóa comment
 * @param {string} commentId - ID của comment
 * @param {string} token - JWT token
 * @returns {Promise} - Delete result
 */
export const deleteComment = async (commentId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error("Bạn cần đăng nhập để xóa bình luận");
      } else if (status === 403) {
        throw new Error(data.message || "Bạn không có quyền xóa bình luận này");
      } else if (status === 404) {
        throw new Error("Không tìm thấy bình luận");
      } else {
        throw new Error(data.message || "Không thể xóa bình luận");
      }
    }
    throw new Error("Không thể kết nối đến server");
  }
};