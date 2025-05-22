// src/api/threadApi.js
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
    return response.data;
  } catch (error) {
    throw new Error("Không thể lấy danh sách bài viết: " + error.message);
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
 * @returns {Promise} - Trả về thông tin thread đã được tạo
 */
export const createThread = async (threadData) => {
  try {
    const response = await axios.post(`${API_URL}/threads`, threadData);
    return response.data;
  } catch (error) {
    throw new Error("Không thể tạo bài viết: " + error.message);
  }
};

/**
 * Like một thread
 * @param {string} threadId - ID của thread
 * @returns {Promise} - Trả về thông tin cập nhật về likes
 */
export const likeThread = async (threadId) => {
  try {
    const response = await axios.put(`${API_URL}/threads/${threadId}/like`);
    return response.data;
  } catch (error) {
    throw new Error("Không thể thích bài viết: " + error.message);
  }
};

