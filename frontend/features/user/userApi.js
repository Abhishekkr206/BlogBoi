import { api } from "../../app/apiSlice";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserData: builder.query({
      query: (userid) => `blog/user/${userid}`,
      providesTags: (result, error, userid) => [{ type: "User", id: userid }],
    }),

    followUser: builder.mutation({
      query: ({ userid, currentUserId }) => ({
        url: `blog/user/${userid}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { userid, currentUserId }) => [
        { type: "User", id: userid },
        { type: "User", id: currentUserId },
      ],
    }),

    unfollowUser: builder.mutation({
      query: ({ userid, currentUserId }) => ({
        url: `blog/user/${userid}/unfollow`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userid, currentUserId }) => [
        { type: "User", id: userid },
        { type: "User", id: currentUserId },
      ],
    }),
  }),
});

export const {
  useGetUserDataQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApi;
