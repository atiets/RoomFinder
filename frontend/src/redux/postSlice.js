import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  selectedPost: null,
  loading: false,
  error: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    addPost: (state, action) => {
      state.posts.push(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id,
      );
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    toggleFavoritePost: (state, action) => {
      const postId = action.payload;
      if (state.favoritePosts.includes(postId)) {
        state.favoritePosts = state.favoritePosts.filter((id) => id !== postId);
      } else {
        state.favoritePosts.push(postId);
      }
    },
  },
});

export const {
  setPosts,
  setSelectedPost,
  addPost,
  updatePost,
  deletePost,
  setLoading,
  setError,
  toggleFavoritePost,
} = postSlice.actions;

export default postSlice.reducer;
