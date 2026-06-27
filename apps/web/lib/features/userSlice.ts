import { GithubUserData } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: GithubUserData | null = null;

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state = action.payload;
    },
    logout: (state) => {
      state = null;
      return null;
    },
  },
});

export const { logout, login } = userSlice.actions;
export default userSlice.reducer;
