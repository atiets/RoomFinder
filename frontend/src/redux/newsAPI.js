import axios from "axios";
import {
  getNewsStart,
  getNewsSuccess,
  getNewsFailed,
  getNewsByIdStart,
  getNewsByIdSuccess,
  getNewsByIdFailed,
  createNewsStart,
  createNewsSuccess,
  createNewsFailed,
  updateNewsStart,
  updateNewsSuccess,
  updateNewsFailed,
  deleteNewsStart,
  deleteNewsSuccess,
  deleteNewsFailed,
} from "./newsSlice";

axios.defaults.baseURL = "https://befindrentalrooms-production.up.railway.app";

export const getAllNews = async (accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.get("/v1/news", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("tet");
    dispatch(getNewsSuccess(res.data));
  } catch (err) {
    if (err.response) {
      console.error("Get news error:", err.response.data);
    } else {
      console.error("Get news error:", err.message);
    }
    dispatch(getNewsFailed());
  }
};

export const createNews =
  (newsData, accessToken, axiosJWT) => async (dispatch) => {
    dispatch(createNewsStart());
    try {
      const res = await axiosJWT.post("/v1/news", newsData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      dispatch(createNewsSuccess(res.data));
    } catch (err) {
      if (err.response) {
        console.error("Create news error:", err.response.data);
      } else {
        console.error("Create news error:", err.message);
      }
      dispatch(createNewsFailed());
    }
  };

export const updateNews = async (
  newsId,
  newsData,
  accessToken,
  dispatch,
  axiosJWT,
) => {
  dispatch(updateNewsStart());
  try {
    const res = await axiosJWT.put(`/v1/news/${newsId}`, newsData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    dispatch(updateNewsSuccess(res.data));
  } catch (err) {
    if (err.response) {
      console.error("Update news error:", err.response.data);
    } else {
      console.error("Update news error:", err.message);
    }
    dispatch(updateNewsFailed());
  }
};

export const deleteNews = async (newsId, accessToken, dispatch, axiosJWT) => {
  dispatch(deleteNewsStart());
  try {
    await axiosJWT.delete(`/v1/news/${newsId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    dispatch(deleteNewsSuccess(newsId));
  } catch (err) {
    if (err.response) {
      console.error("Delete news error:", err.response.data);
    } else {
      console.error("Delete news error:", err.message);
    }
    dispatch(deleteNewsFailed());
  }
};

// Hàm lấy tin tức theo ID
export const getNewsById = async (newsId, accessToken, dispatch, axiosJWT) => {
  dispatch(getNewsByIdStart()); // Sử dụng action cho việc lấy tin tức theo ID
  try {
    const res = await axiosJWT.get(`/v1/news/${newsId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Thêm token nếu cần
      },
    });
    dispatch(getNewsByIdSuccess(res.data)); // Dispatch action thành công
  } catch (err) {
    console.error("Get news by ID error:", err);
    dispatch(getNewsByIdFailed()); // Dispatch action thất bại
  }
};
