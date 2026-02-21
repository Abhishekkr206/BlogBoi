import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setUser, clearUser } from "../auth/authSlicer";
import { api } from "../../app/apiSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    console.log("⚠️ Access token expired → trying refresh...");

    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      console.log("✅ Refresh success → retrying original request");
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("❌ Refresh failed → forcing logout");
      window.location.href = "/login";
      api.dispatch(clearUser());
      localStorage.removeItem("user");
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Post", "Comment", "Follow"],
  endpoints: () => ({}),
});
