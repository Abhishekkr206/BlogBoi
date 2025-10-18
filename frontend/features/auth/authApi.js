import { api } from "../../app/apiSlice";
import { setUser, clearUser } from "../auth/authSlicer";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          // save user in Redux
          api.dispatch(setUser(data.user));

          // save user in localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          // save user in Redux
          api.dispatch(setUser(data.user));

          // save user in localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    google: builder.mutation({
      query:({token}) => ({
        url:"/auth/google",
        method:"POST",
        body:{token},
      }),
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;
          
          if(data.user && data.user._id){
            api.dispatch(setUser(data.user));
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {
          console.log(err);
        }
      },
    }),
    validateOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/validateotp",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          // save user in Redux
          api.dispatch(setUser(data.user));

          //  save user in localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, api) {
        try {
          await api.queryFulfilled;

          // clear user from Redux
          api.dispatch(clearUser());

          // remove from localStorage
          localStorage.removeItem("user");
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

export const { 
  useSignupMutation, 
  useLoginMutation, 
  useLogoutMutation,
  useGoogleMutation,
  useValidateOtpMutation
} = authApi;
