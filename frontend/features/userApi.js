import { api } from "../app/apiSlice";

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getUserData: builder.query({
            query: (userid) => `/user/${userid}`,
            providesTags: (result, error, userid) => [{type:"User", id: userid}]
        }),
        followUser: builder.mutation({
            query: (userid) => ({
                url:`/user/${userid}/follow`,
                method:"POST"
            }),
            invalidatesTags: (result, error, userId) => [{ type: "User", id: userId }],        
        }),
        unfollowUser: builder.mutation({
            query: (userId) => ({
              url: `/users/${userId}/follow`,
              method: "DELETE",
            }),
            invalidatesTags: (result, error, userId) => [{ type: "User", id: userId }],
        }),
    })
})