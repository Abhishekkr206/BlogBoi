import { api } from "../../app/apiSlice";
import { postApi } from "../post/postApi";

// Inject comment-related endpoints into base API slice
export const commentApi = api.injectEndpoints({
  endpoints: (builder) => ({

    /* ────────────────────────────────────────────────
      ✅ 1. Get paginated comments for a post
    ───────────────────────────────────────────────── */
    getComments: builder.query({
      query: ({ postId, page }) => `blog/comment/${postId}?page=${page}&limit=4`,

      // Cache tagging for RTK Query invalidation
      providesTags: (result, error, { postId }) =>
        result?.message
          ? [
              ...result.message.map(({ _id }) => ({ type: "Comment", id: _id })),
              { type: "Comment", id: `LIST-${postId}` }, // ref for entire list
            ]
          : [{ type: "Comment", id: `LIST-${postId}` }],

      // Keep previous cache alive for 30s even if unused
      keepUnusedDataFor: 30,
    }),

    /* ────────────────────────────────────────────────
      ✅ 2. Add a new comment to a post
    ───────────────────────────────────────────────── */
    addComment: builder.mutation({
      query: ({ authorId, postId, body }) => ({
        url: `blog/comment/${postId}`,
        method: "POST",
        body,
      }),

      // Invalidate comment list so UI refetches updated list
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comment", id: `LIST-${postId}` },
      ],

      // ✅ Optimistic UI update for comment count on all pages
      async onQueryStarted({ postId, authorId }, { dispatch, queryFulfilled }) {
        const patches = [];

        // Update post comment count in all paginated `getPosts` queries
        for (let page = 1; page <= 30; page++) {
          patches.push(
            dispatch(
              postApi.util.updateQueryData("getPosts", { page }, (draft) => {
                if (draft?.message) {
                  const post = draft.message.find((p) => p._id === postId);
                  if (post) post.comment = (post.comment || 0) + 1;
                }
              })
            )
          );
        }

        // Update comment count on author's profile page
        patches.push(
          dispatch(
            postApi.util.updateQueryData(
              "getUserData",
              { userid: authorId, page: 1 },
              (draft) => {
                if (draft?.response?.blogs) {
                  const post = draft.response.blogs.find((p) => p._id === postId);
                  if (post) post.comment = (post.comment || 0) + 1;
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Rollback UI patches if API fails
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    /* ────────────────────────────────────────────────
      ✅ 3. Delete a comment
    ───────────────────────────────────────────────── */
    deleteComment: builder.mutation({
      query: ({ authorId, postId, commentId }) => ({
        url: `blog/comment/${commentId}`,
        method: "DELETE",
      }),

      // Remove deleted comment from cache list
      invalidatesTags: (result, error, { commentId, postId }) => [
        { type: "Comment", id: commentId },
        { type: "Comment", id: `LIST-${postId}` },
      ],

      // ✅ Optimistic UI rollback handling (same logic as addComment but subtract)
      async onQueryStarted({ postId, authorId }, { dispatch, queryFulfilled }) {
        const patches = [];

        for (let page = 1; page <= 30; page++) {
          patches.push(
            dispatch(
              postApi.util.updateQueryData("getPosts", { page }, (draft) => {
                if (draft?.message) {
                  const post = draft.message.find((p) => p._id === postId);
                  if (post) post.comment = (post.comment || 0) - 1;
                }
              })
            )
          );
        }

        patches.push(
          dispatch(
            postApi.util.updateQueryData(
              "getUserData",
              { userid: authorId, page: 1 },
              (draft) => {
                if (draft?.response?.blogs) {
                  const post = draft.response.blogs.find((p) => p._id === postId);
                  if (post) post.comment = (post.comment || 0) - 1;
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
      ✅ 4. Get replies for a comment (paginated)
    ───────────────────────────────────────────────── */
    getReplies: builder.query({
      query: ({ commentId, page }) => `blog/comment/${commentId}/reply?page=${page}&limit=4`,
      providesTags: (result, error, { commentId }) =>
        result
          ? [
              ...result.message.map(({ _id }) => ({ type: "Reply", id: _id })),
              { type: "Reply", id: `LIST-${commentId}` },
            ]
          : [{ type: "Reply", id: `LIST-${commentId}` }],
    }),

    /* ────────────────────────────────────────────────
      ✅ 5. Add reply to comment
    ───────────────────────────────────────────────── */
    addReply: builder.mutation({
      query: ({ commentid, content, postid }) => ({
        url: `blog/${postid}/comment/${commentid}/reply`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { commentid }) => [
        { type: "Comment", id: commentid },
        { type: "Reply", id: `LIST-${commentid}` },
      ],
    }),

    /* ────────────────────────────────────────────────
      ✅ 6. Delete reply
    ───────────────────────────────────────────────── */
    deleteReply: builder.mutation({
      query: ({ commentId, replyId }) => ({
        url: `blog/${commentId}/${replyId}/reply/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { replyId, commentId }) => [
        { type: "Reply", id: replyId },
        { type: "Reply", id: `LIST-${commentId}` },
        { type: "Comment", id: commentId },
      ],
    }),
  }),
});

// Export RTK Query hooks
export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetRepliesQuery,
  useAddReplyMutation,
  useDeleteReplyMutation,
} = commentApi;
