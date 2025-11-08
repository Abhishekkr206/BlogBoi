import { api } from "../../app/apiSlice";
import { setUser, clearUser } from "../auth/authSlicer";

// Inject user-related endpoints into base API slice
export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({

    /* ────────────────────────────────────────────────
      1. Get user profile data + user's posts (paginated)
    ───────────────────────────────────────────────── */
    getUserData: builder.query({
      query: ({ userid, page }) => `blog/user/${userid}?page=${page}&limit=5`,
      // Cache user data using userid as tag
      providesTags: (result, error, { userid }) => [{ type: "User", id: userid }],
    }),

    /* ────────────────────────────────────────────────
      2. Get list of users they are following
    ───────────────────────────────────────────────── */
    getFollowingData: builder.query({
      query: (userid) => `blog/user/${userid}/following`,
      // Tag used to invalidate/refetch follow data
      providesTags: (result, error, userid) => [{ type: "Follow", id: userid }],
    }),

    /* ────────────────────────────────────────────────
      3. Get list of followers
    ───────────────────────────────────────────────── */
    getFollowerData: builder.query({
      query: (userid) => `blog/user/${userid}/follower`,
      providesTags: (result, error, userid) => [{ type: "Follow", id: userid }],
    }),

    /* ────────────────────────────────────────────────
      4. Edit user profile (bio, name, image, etc.)
    ───────────────────────────────────────────────── */
    editUser: builder.mutation({
      query: ({ userid, body }) => ({
        url: `blog/user/edit`,
        method: "PATCH",
        body,
      }),

      // Persist updated user in Redux + localStorage
      async onQueryStarted(arg, api) {
        try {
          const { data } = await api.queryFulfilled;

          // Update Redux user data
          api.dispatch(setUser(data.user));

          // Update saved user in localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.log(err);
        }
      },

      // Force refetch user data after edit
      invalidatesTags: (result, error, { userid }) => [{ type: "User", id: userid }],
    }),

    /* ────────────────────────────────────────────────
      5. Follow a user
      - Also refresh both profiles: the one being followed & current user
      - Also refresh follower list UI
    ───────────────────────────────────────────────── */
    followUser: builder.mutation({
      query: ({ userid, currentUserId }) => ({
        url: `blog/user/${userid}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { userid, currentUserId }) => [
        { type: "User", id: userid },         // target user
        { type: "User", id: currentUserId },  // logged-in user
        { type: "Follow", id: userid },       // follower list cache
        { type: "Follow", id: currentUserId },
      ],
    }),

    /* ────────────────────────────────────────────────
      6. Unfollow a user
      - Same invalidations as followUser
    ───────────────────────────────────────────────── */
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

// Export hooks for UI usage
export const {
  useGetUserDataQuery,
  useGetFollowingDataQuery,
  useGetFollowerDataQuery,
  useEditUserMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApi;
