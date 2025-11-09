import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ,
  credentials: "include",
});

// Wrapper to handle token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401 error (token expired or invalid)
  if (result?.error?.status === 401) {
    const requiresRefresh = result?.error?.data?.requiresRefresh;

    if (requiresRefresh) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        // Refresh successful - retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - redirect to login
        window.location.href = '/login';
      }
    } else {
      // Invalid token (can't refresh) - redirect to login
      window.location.href = '/login';
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth, // ← Changed from fetchBaseQuery
  tagTypes: ["User", "Post", "Comment", "Follow"],
  endpoints: () => ({}),
});