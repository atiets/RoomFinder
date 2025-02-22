import { createSlice } from "@reduxjs/toolkit";

const newsSlice = createSlice({
  name: "news",
  initialState: {
    newsList: [],
    newsItem: null,
    isFetching: false,
    error: false,
  },
  reducers: {
    // Get all news
    getNewsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getNewsSuccess: (state, action) => {
      state.isFetching = false;
      state.newsList = action.payload;
    },
    getNewsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Get news by ID
    getNewsByIdStart: (state) => {
      state.isFetching = true;
      state.error = false;
      state.newsItem = null; // Reset tin tức theo ID
    },
    getNewsByIdSuccess: (state, action) => {
      state.isFetching = false;
      state.newsItem = action.payload; // Lưu tin tức theo ID vào state
    },
    getNewsByIdFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Create news
    createNewsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    createNewsSuccess: (state, action) => {
      state.isFetching = false;
      state.newsList.push(action.payload);
    },
    createNewsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Update news
    updateNewsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    updateNewsSuccess: (state, action) => {
      state.isFetching = false;
      const index = state.newsList.findIndex(
        (news) => news._id === action.payload._id,
      );
      if (index !== -1) {
        state.newsList[index] = action.payload;
      }
    },
    updateNewsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Delete news
    deleteNewsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    deleteNewsSuccess: (state, action) => {
      state.isFetching = false;
      state.newsList = state.newsList.filter(
        (news) => news._id !== action.payload,
      );
    },
    deleteNewsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
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
} = newsSlice.actions;

export default newsSlice.reducer;
