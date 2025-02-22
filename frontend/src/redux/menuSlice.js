import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedMenu: "manageAccount",
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setSelectedMenu: (state, action) => {
      state.selectedMenu = action.payload;
    },
  },
});

export const { setSelectedMenu } = menuSlice.actions;

export default menuSlice.reducer;
