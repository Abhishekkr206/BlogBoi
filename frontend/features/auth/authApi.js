import { api } from "../../app/apiSlice";
import { setUser, clearUser } from "../auth/authSlicer";

// Inject auth-related endpoints into the base RTK Query API slice
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Signup Mutation
    signup: builder.mutation({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),

      // Runs after mutation is successful
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          // Store user in Redux
          api.dispatch(setUser(data.user));

          // Persist user to localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.log(err);
        }
      },
    }),

    // ✅ Login Mutation (email/username + password)
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          api.dispatch(setUser(data.user));
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.log(err);
        }
      },
    }),

    // ✅ Google OAuth Mutation
    google: builder.mutation({
      query: ({ token }) => ({
        url: "/auth/google",
        method: "POST",
        body: { token },
      }),

      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          // Only store user if full user details are returned (existing user)
          if (data.user && data.user._id) {
            api.dispatch(setUser(data.user));
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {
          console.log(err);
        }
      },
    }),

    // ✅ Validate OTP Mutation (used after signup)
    validateOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/validateotp",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          api.dispatch(setUser(data.user));
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.log(err);
        }
      },
    }),

    // ✅ Logout Mutation
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, api) {
        try {
          await api.queryFulfilled;

          // Clear user from Redux
          api.dispatch(clearUser());

          // Remove from localStorage
          localStorage.removeItem("user");
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

// Export RTK Query hooks
export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGoogleMutation,
  useValidateOtpMutation
} = authApi;
