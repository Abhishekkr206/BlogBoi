import { api } from "../../app/apiSlice";
import {setUser, clearUser} from "../auth/authSlicer";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserData: builder.query({
      query: ({userid, page}) => (`blog/user/${userid}?page=${page}&limit=5`),
      providesTags: (result, error, {userid}) => [{ type: "User", id: userid }],
    }),

    getFollowingData: builder.query({
      query: (userid) => `blog/user/${userid}/following`,
      providesTags: (result, error, userid) => [{ type: "Follow", id: userid }],
    }),

    getFollowerData: builder.query({
      query: (userid) => `blog/user/${userid}/follower`,
      providesTags: (result, error, userid) => [{ type: "Follow", id: userid }],
    }),

    editUser: builder.mutation({
    query: ({userid, body})=>({
        url:`blog/user/edit`,
        method:"PATCH",
        body,
      }),
      async onQueryStarted(arg, api) {
        try{
          const {data} = await api.queryFulfilled;
          // update user in Redux
          api.dispatch(setUser(data.user));

          // update user in localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        catch(err){
          console.log(err);
        }
      },
      invalidatesTags: (result, error, {userid}) => [{type:'User', id:userid}],
    }),

    followUser: builder.mutation({
      query: ({ userid, currentUserId }) => ({
        url: `blog/user/${userid}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { userid, currentUserId }) => [
        { type: "User", id: userid },
        { type: "User", id: currentUserId },
        { type: "Follow", id: userid },
        { type: "Follow", id: currentUserId },
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
        { type: "Follow", id: userid },
        { type: "Follow", id: currentUserId },
      ],
    }),
  }),
});

export const {
  useGetUserDataQuery,
  useGetFollowingDataQuery,
  useGetFollowerDataQuery,
  useEditUserMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApi;
