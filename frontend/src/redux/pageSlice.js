import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentPageName: "",
};

const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setCurrentPageName: (state, action) => {
      state.currentPageName = action.payload;
    },
    clearCurrentPageName: (state) => {
      state.currentPageName = "";
    },
  },
});

export const { setCurrentPageName, clearCurrentPageName } = pageSlice.actions;

export default pageSlice.reducer;
