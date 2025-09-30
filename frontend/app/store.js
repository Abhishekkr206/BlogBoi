import { configureStore } from "@reduxjs/toolkit";
import { api } from "./apiSlice";
import authReducer from "../features/auth/authSlicer"; // 🔥 import your auth slice

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer, // 🔥 add auth slice here
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export default store;
