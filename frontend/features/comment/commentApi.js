import { api } from "../../app/apiSlice";
import { postApi } from "../post/postApi";

export const commentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get comments for a post
    getComments: builder.query({
      query: ({postId,page}) => `blog/comment/${postId}?page=${page}&limit=4`,
      providesTags: (result, error, {postId}) =>
        result?.message
          ? [
              ...result.message.map(({ _id }) => ({ type: "Comment", id: _id })),
              { type: "Comment", id: `LIST-${postId}` },
            ]
          : [{ type: "Comment", id: `LIST-${postId}` }],
      keepUnusedDataFor: 30, // Add this to prevent stale cache
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
      ],
      async onQueryStarted({postId, authorId},{ dispatch, queryFulfilled }) {
        const patches = [];
        for (let page = 1; page <= 30; page++) {
            patches.push(
                dispatch(
                    postApi.util.updateQueryData('getPosts', { page }, (draft) => {
                        if (draft?.message) {
                            const post = draft.message.find(p => p._id === postId);
                            if (post) {
                                post.comment = (post.comment || 0) + 1;
                            }
                        }
                    })
                )
            );
        }
        patches.push(
            dispatch(
                postApi.util.updateQueryData('getUserData', { userid: authorId, page: 1 }, (draft) => {
                    if (draft?.response?.blogs) {
                        const post = draft.response.blogs.find(p => p._id === postId);
                        if (post) {
                            post.comment = (post.comment || 0) + 1;
                        }
                    }
                })
            )
        );
        try {
            await queryFulfilled;
        } catch {
            // Rollback all patches on error
            patches.forEach(patch => patch.undo());
        }
      }
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
      ],
      async onQueryStarted({postId, authorId},{ dispatch, queryFulfilled }) {
        const patches = [];
        for (let page = 1; page <= 30; page++) {
            patches.push(
                dispatch(
                    postApi.util.updateQueryData('getPosts', { page }, (draft) => {
                        if (draft?.message) {
                            const post = draft.message.find(p => p._id === postId);
                            if (post) {
                                post.comment = (post.comment || 0) - 1;
                            }
                        }
                    })
                )
            );
        }
        patches.push(
            dispatch(
                postApi.util.updateQueryData('getUserData', { userid: authorId, page: 1 }, (draft) => {
                    if (draft?.response?.blogs) {
                        const post = draft.response.blogs.find(p => p._id === postId);
                        if (post) {
                            post.comment = (post.comment || 0) - 1;
                        }
                    }
                })
            )
        );
        try {
            await queryFulfilled;
        } catch {
            // Rollback all patches on error
            patches.forEach(patch => patch.undo());
        }
      }
    }),

    // ✅ Get replies for a comment
    getReplies: builder.query({
      query: ({commentId, page}) => `blog/comment/${commentId}/reply?page=${page}&limit=4`,
      providesTags: (result, error, {commentId}) =>
        result
          ? [
              ...result.message.map(({ _id }) => ({ type: "Reply", id: _id })),
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