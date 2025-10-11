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
      query: ({authorId, postId, body }) => ({
        url: `blog/comment/${postId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { postId, authorId }) => {
        return [
        { type: "Comment", id: `LIST-${postId}` },
        { type: "Post", id: postId },
        {type: "User", id: authorId},
      ]}
    }),

    // ✅ Delete a comment
    deleteComment: builder.mutation({
      query: ({authorId, postId, commentId }) => ({
        url: `blog/comment/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { commentId, postId, authorId }) => {
        return [
        { type: "Comment", id: commentId },
        { type: "Post", id: postId },
        {type: "User", id: authorId},
      ]}
    }),
    // ✅ Add a reply to a comment
    addReply: builder.mutation({
      query: ({ commentId, body }) => ({
        url: `blog/comment/${commentId}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),


    // ✅ Delete a reply
    deleteReply: builder.mutation({
      query: ({ commentId, replyId }) => ({
        url: `blog/comment/${commentId}/reply/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useAddReplyMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} = commentApi;
