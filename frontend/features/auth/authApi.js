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

      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          api.dispatch(setUser(data.user));
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {}
      },
    }),

    // ✅ Login Mutation
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
        } catch (err) {}
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

          if (data.user && data.user._id) {
            api.dispatch(setUser(data.user));
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {}
      },
    }),

    // ✅ Validate OTP Mutation
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
        } catch (err) {}
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

          api.dispatch(clearUser());
          localStorage.removeItem("user");
        } catch (err) {}
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
