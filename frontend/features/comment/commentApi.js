import { api } from "../../app/apiSlice";

export const commentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get comments for a post
    getComments: builder.query({
      query: (postId) => `blog/comment/${postId}`,
      providesTags: (result, error, postId) =>
        result?.message
          ? [
              ...result.message.map(({ _id }) => ({ type: "Comment", id: _id })),
              { type: "Comment", id: `LIST-${postId}` },
            ]
          : [{ type: "Comment", id: `LIST-${postId}` }],
    }),

    // ✅ Add a comment to a post
    addComment: builder.mutation({
      query: ({ authorId, postId, body }) => ({
        url: `blog/comment/${postId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { postId, authorId }) => [
        { type: "Comment", id: `LIST-${postId}` },
        { type: "Post", id: postId },
        { type: "User", id: authorId },
      ],
    }),

    // ✅ Delete a comment
    deleteComment: builder.mutation({
      query: ({ authorId, postId, commentId }) => ({
        url: `blog/comment/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { commentId, postId, authorId }) => [
        { type: "Comment", id: commentId },
        { type: "Comment", id: `LIST-${postId}` },
        { type: "Post", id: postId },
        { type: "User", id: authorId },
      ],
    }),

    // ✅ Get replies for a comment
    getReplies: builder.query({
      query: (commentId) => `blog/comment/${commentId}/reply`,
      providesTags: (result, error, commentId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Reply", id: _id })),
              { type: "Reply", id: `LIST-${commentId}` },
            ]
          : [{ type: "Reply", id: `LIST-${commentId}` }],
    }),

    // ✅ Add a reply to a comment
    addReply: builder.mutation({
      query: ({ commentId, content, postId }) => ({
        url: `blog/comment/${commentId}/reply`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
        { type: "Reply", id: `LIST-${commentId}` }, 
      ],
    }),

    // ✅ Delete a reply
    deleteReply: builder.mutation({
      query: ({ commentId, replyId }) => ({ 
        url: `blog/comment/${replyId}/reply/`,
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

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetRepliesQuery,
  useAddReplyMutation,
  useDeleteReplyMutation,
} = commentApi;