import { api } from "../../app/apiSlice";

// Inject post-related endpoints into the base API slice
export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({

    /* ────────────────────────────────────────────────
      1. Get paginated posts for home feed
    ───────────────────────────────────────────────── */
    getPosts: builder.query({
      query: ({ page }) => `blog/post?page=${page}&limit=6`,
      providesTags: (result) =>
        result?.message
          ? [
              ...result.message.map(({ _id }) => ({ type: "Post", id: _id })),
              { type: "Post", id: "LIST" }, // Refers to full post list
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    /* ────────────────────────────────────────────────
      2. Get single post page by ID
    ───────────────────────────────────────────────── */
    getPostById: builder.query({
      query: (postid) => `blog/post/${postid}?page=1&limit=5`,
      providesTags: (result, error, postid) => {
        const authorId = result?.message?.author?._id;
        return [
          { type: "Post", id: postid }, // Cache individual post
          { type: "User", id: authorId }, // Also link to author's profile cache
        ];
      },
    }),

    /* ────────────────────────────────────────────────
      3. Create a new post
    ───────────────────────────────────────────────── */
    addPost: builder.mutation({
      query: ({ body }) => ({
        url: "blog/post",
        method: "POST",
        body,
      }),
      // Refetch feed + profile posts after successful upload
      invalidatesTags: (result, error, { authorId }) => [
        { type: "Post", id: "LIST" },
        { type: "User", id: authorId },
      ],
    }),

    /* ────────────────────────────────────────────────
      4. Like a post (optimistic update on UI)
    ───────────────────────────────────────────────── */
    likePost: builder.mutation({
      query: ({ postid }) => ({
        url: `blog/post/${postid}/like`,
        method: "POST",
      }),

      // Optimistic cache update for like count
      async onQueryStarted({ postid, authorId }, { dispatch, queryFulfilled }) {
        const patches = [];

        // Update `getPostById` cache (single post page)
        patches.push(
          dispatch(
            postApi.util.updateQueryData("getPostById", postid, (draft) => {
              if (draft?.message) {
                draft.message.like = (draft.message.like || 0) + 1;
                draft.message.isliked = true;
              }
            })
          )
        );

        // Update `getPosts` cache for feed (multiple pages)
        for (let page = 1; page <= 30; page++) {
          patches.push(
            dispatch(
              postApi.util.updateQueryData("getPosts", { page }, (draft) => {
                if (draft?.message) {
                  const post = draft.message.find((p) => p._id === postid);
                  if (post) {
                    post.like = (post.like || 0) + 1;
                    post.isliked = true;
                  }
                }
              })
            )
          );
        }

        // Update posts inside user's profile page
        patches.push(
          dispatch(
            postApi.util.updateQueryData(
              "getUserData",
              { userid: authorId, page: 1 },
              (draft) => {
                if (draft?.response?.blogs) {
                  const post = draft.response.blogs.find((p) => p._id === postid);
                  if (post) {
                    post.like = (post.like || 0) + 1;
                    post.isliked = true;
                  }
                }
              }
            )
          )
        );

        // Rollback UI if API fails
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    /* ────────────────────────────────────────────────
      5. Unlike a post (reverse optimistic update)
    ───────────────────────────────────────────────── */
    deleteLike: builder.mutation({
      query: ({ postid }) => ({
        url: `blog/post/${postid}/unlike`,
        method: "DELETE",
      }),

      async onQueryStarted({ postid, authorId }, { dispatch, queryFulfilled }) {
        const patches = [];

        // Update single post view
        patches.push(
          dispatch(
            postApi.util.updateQueryData("getPostById", postid, (draft) => {
              if (draft?.message) {
                draft.message.like = Math.max(0, (draft.message.like || 0) - 1);
                draft.message.isliked = false;
              }
            })
          )
        );

        // Update feed pages
        for (let page = 1; page <= 10; page++) {
          patches.push(
            dispatch(
              postApi.util.updateQueryData("getPosts", { page }, (draft) => {
                if (draft?.message) {
                  const post = draft.message.find((p) => p._id === postid);
                  if (post) {
                    post.like = Math.max(0, (post.like || 0) - 1);
                    post.isliked = false;
                  }
                }
              })
            )
          );
        }

        // Update author profile posts
        patches.push(
          dispatch(
            postApi.util.updateQueryData(
              "getUserData",
              { userid: authorId, page: 1 },
              (draft) => {
                if (draft?.response?.blogs) {
                  const post = draft.response.blogs.find((p) => p._id === postid);
                  if (post) {
                    post.like = Math.max(0, (post.like || 0) - 1);
                    post.isliked = false;
                  }
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    /* ────────────────────────────────────────────────
      6. Delete post (remove from all lists)
    ───────────────────────────────────────────────── */
    deletePost: builder.mutation({
      query: ({ postid }) => ({
        url: `blog/post/${postid}`,
        method: "DELETE",
      }),

      async onQueryStarted({ postid, authorId }, { dispatch, queryFulfilled }) {
        const patches = [];

        // Remove from all feed pages
        for (let page = 1; page <= 30; page++) {
          patches.push(
            dispatch(
              postApi.util.updateQueryData("getPosts", { page }, (draft) => {
                if (draft?.message) {
                  draft.message = draft.message.filter((p) => p._id !== postid);
                }
              })
            )
          );
        }

        // Remove from user's profile pages
        for (let page = 1; page <= 10; page++) {
          patches.push(
            dispatch(
              postApi.util.updateQueryData(
                "getUserData",
                { userid: authorId, page },
                (draft) => {
                  if (draft?.response?.blogs) {
                    draft.response.blogs = draft.response.blogs.filter((p) => p._id !== postid);
                  }
                }
              )
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },

      // Fully invalidate post + post list + profile posts
      invalidatesTags: (result, error, { postid, authorId }) => [
        { type: "Post", id: postid },
        { type: "Post", id: "LIST" },
        { type: "User", id: authorId },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useAddPostMutation,
  useLikePostMutation,
  useDeleteLikeMutation,
  useDeletePostMutation,
} = postApi;
