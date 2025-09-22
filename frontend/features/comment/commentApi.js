import { api } from "../../app/apiSlice";

export const commentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getComments: builder.query({
            query: (postid) => `/comment/${postid}`,
            providesTags: (result, error, postId) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: "Comment", id: _id })),
                        { type: "Comment", id: `LIST-${postId}` },
                      ]
                    : [{ type: "Comment", id: `LIST-${postId}` }],
            
        }),
        addComment: builder.mutation({
            query: ({postid, body}) => ({
                url:`/comment/${postid}`,
                method:"POST",
                body,
            }),
            invalidatesTags: (result, error, { postId }) => [
                { type: "Comment", id: `LIST-${postId}` },
                { type: "Post", id: postId },
            ],
        }),
        addReply: builder.mutation({
              query: ({ commentId, ...body }) => ({
                url: `/comment/${commentId}/reply`,
                method: "POST",
                body,
              }),
              invalidatesTags: (result, error, { commentId }) => [
                { type: "Comment", id: commentId },
              ],
        }),
        deleteComment: builder.mutation({
            query: (postid)=>({
                url: `/comment/${postid}/reply`,
                method:"DELETE"
            }),
            invalidatesTags: (result, error, { postId }) => [
                { type: "Comment", id: `LIST-${postId}` },
                { type: "Post", id: postId },
            ],
        }),
        deleteReply: builder.mutation({
            query: (commentid)=>({
                url: `/comment/${commentid}/reply`,
                method:"DELETE"
            }),
            invalidatesTags: (result, error, { commentid }) => [
                { type: "Comment", id: commentid },
            ],
        })
    })
})

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useAddReplyMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} = commentApi;
