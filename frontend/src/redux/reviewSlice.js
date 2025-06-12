import { createSlice } from '@reduxjs/toolkit';

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    setReviews: (state, action) => {
      state.reviews = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    addReview: (state, action) => {
      if (action.payload && action.payload._id) {
        state.reviews.unshift(action.payload);
      }
    },
    updateReview: (state, action) => {
      const { id, updates } = action.payload || {};
      if (id && updates) {
        const index = state.reviews.findIndex(review => review?._id === id);
        if (index !== -1) {
          state.reviews[index] = { ...state.reviews[index], ...updates };
        }
      }
    },
    deleteReview: (state, action) => {
      const reviewId = action.payload;
      if (reviewId) {
        state.reviews = state.reviews.filter(review => review?._id !== reviewId);
      }
    },
    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setReviews, 
  addReview, 
  updateReview, 
  deleteReview, 
  setLoading, 
  setError 
} = reviewSlice.actions;

export default reviewSlice.reducer;
