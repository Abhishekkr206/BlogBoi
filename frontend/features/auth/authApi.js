import { api } from "../../app/apiSlice";
import {setUser, clearUser} from "../auth/authSlicer"

export const autApi = api.injectEndpoints({
    endpoints: (builder) => ({
        signup: builder.mutation({
            query: (body) => ({
                url:"/auth/signup",
                method: "POST",
                body,
            }),
            async onQueryStarted(arg, api){
                try {
                    const {data} = await api.queryFulfilled
                    api.dispatch(setUser(data.user))
                } catch (err) {
                    console.log(err)
                }
            },
        }),
        login: builder.mutation({
            query: (body) => ({
                url:"/auth/login",
                method: "POST",
                body,
            }),
            async onQueryStarted(arg, api){
                try {
                    const {data} = await api.queryFulfilled
                    api.dispatch(setUser(data.user))
                } catch (err) {
                    console.log(err)
                }
            },
        }),
        logout: builder.mutation({
            query: () => ({
                url:"/auth/logout",
                method: "POST",
            }),
            async onQueryStarted(arg, api){
                try {
                    await api.queryFulfilled
                    api.dispatch(clearUser())
                } catch (err) {
                    console.log(err)
                }
            }
        }),
    })
})

export const {useSignupMutation, useLoginMutation, useLogoutMutation} = autApi