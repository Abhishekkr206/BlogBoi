import { api } from "../../app/apiSlice";

export const autApi = api.injectEndpoints({
    endpoints: (builder) => ({
        signup: builder.mutation({
            query: (body) => ({
                url:"/auth/signup",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Auth"],
        }),
        login: builder.mutation({
            query: (body) => ({
                url:"/auth/login",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Auth"],
        }),
        logout: builder.mutation({
            query: () => ({
                url:"/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["Auth"],
        }),
    })
})

export const {useSignupMutation, useLoginMutation, useLogoutMutation} = autApi