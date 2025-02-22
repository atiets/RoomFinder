import { createSlice } from "@reduxjs/toolkit";

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [], // Mặc định là mảng rỗng
    loading: false,
    error: null,
  },
  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload || []; // Đảm bảo luôn là mảng
      state.loading = false;
    },
    setLoading: (state) => {
      state.loading = true;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    deleteReview: (state, action) => {
      state.reviews = state.reviews.filter(
        (review) => review._id !== action.payload,
      );
    },
    updateReview: (state, action) => {
      const index = state.reviews.findIndex(
        (review) => review._id === action.payload._id,
      );
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    },
  },
});

export const { setReviews, setLoading, setError, deleteReview, updateReview } =
  reviewSlice.actions;
export default reviewSlice.reducer;
