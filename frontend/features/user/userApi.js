import { api } from "../../app/apiSlice";

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getUserData: builder.query({
            query: (userid) => `blog/user/${userid}`,
            providesTags: (result, error, userid) => [{type:"User", id: userid}]
        }),
        followUser: builder.mutation({
            query: (userid) => ({
                url:`blog/user/${userid}/follow`,
                method:"POST"
            }),
            invalidatesTags: (result, error, userId) => [{ type: "User", id: userId }],        
        }),
        unfollowUser: builder.mutation({
            query: (userId) => ({
              url: `blog/user/${userId}/follow`,
              method: "DELETE",
            }),
            invalidatesTags: (result, error, userId) => [{ type: "User", id: userId }],
        }),
    })
})

export const {
  useGetUserDataQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApi;
