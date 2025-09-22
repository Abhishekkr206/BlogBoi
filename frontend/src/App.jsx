// // src/features/api/apiSlice.js
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const apiSlice = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "https://your-backend.com/api", // change to your backend
//     prepareHeaders: (headers, { getState }) => {
//       const token = getState().auth.token; // assuming auth slice exists
//       if (token) headers.set("Authorization", `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ["Post", "Comment"],
//   endpoints: (builder) => ({
//     // ================= POSTS =================
//     getPosts: builder.query({
//       query: () => "/posts",
//       providesTags: ["Post"], // list tag
//     }),
//     getPostById: builder.query({
//       query: (postId) => `/posts/${postId}`,
//       providesTags: (result, error, postId) => [{ type: "Post", id: postId }],
//     }),
//     addPost: builder.mutation({
//       query: (newPost) => ({
//         url: "/posts",
//         method: "POST",
//         body: newPost,
//       }),
//       invalidatesTags: ["Post"], // refresh all posts list
//     }),
//     deletePost: builder.mutation({
//       query: (postId) => ({
//         url: `/posts/${postId}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["Post"],
//     }),

//     // ================= COMMENTS =================
//     getComments: builder.query({
//       query: (postId) => `/posts/${postId}/comments`,
//       providesTags: (result, error, postId) => [{ type: "Comment", id: postId }],
//     }),
//     addComment: builder.mutation({
//       query: ({ postId, content }) => ({
//         url: `/posts/${postId}/comments`,
//         method: "POST",
//         body: { content },
//       }),
//       async onQueryStarted({ postId, content }, { dispatch, queryFulfilled }) {
//         // Optimistically update getPosts list
//         const patchList = dispatch(
//           apiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
//             const post = draft.find((p) => p._id === postId);
//             if (post) post.comment.push({ _id: "temp", content });
//           })
//         );
//         // Optimistically update getPostById
//         const patchSingle = dispatch(
//           apiSlice.util.updateQueryData("getPostById", postId, (draft) => {
//             if (draft) draft.comment.push({ _id: "temp", content });
//           })
//         );

//         try {
//           const { data } = await queryFulfilled;
//           // Replace temp id with real comment id from backend
//           patchList.undo(); // remove temp
//           patchSingle.undo();

//           dispatch(
//             apiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
//               const post = draft.find((p) => p._id === postId);
//               if (post) post.comment.push(data);
//             })
//           );
//           dispatch(
//             apiSlice.util.updateQueryData("getPostById", postId, (draft) => {
//               if (draft) draft.comment.push(data);
//             })
//           );
//         } catch {
//           patchList.undo();
//           patchSingle.undo();
//         }
//       },
//       invalidatesTags: [{ type: "Comment", id: postId }],
//     }),
//     deleteComment: builder.mutation({
//       query: ({ postId, commentId }) => ({
//         url: `/posts/${postId}/comments/${commentId}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: [{ type: "Comment", id: postId }],
//     }),

//     // ================= REPLIES =================
//     addReply: builder.mutation({
//       query: ({ postId, commentId, content }) => ({
//         url: `/posts/${postId}/comments/${commentId}/reply`,
//         method: "POST",
//         body: { content },
//       }),
//       invalidatesTags: [{ type: "Comment", id: postId }],
//     }),
//     deleteReply: builder.mutation({
//       query: ({ postId, commentId, replyId }) => ({
//         url: `/posts/${postId}/comments/${commentId}/reply/${replyId}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: [{ type: "Comment", id: postId }],
//     }),

//     // ================= LIKES =================
//     addLike: builder.mutation({
//       query: ({ postId }) => ({
//         url: `/posts/${postId}/like`,
//         method: "POST",
//       }),
//       async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
//         const patchList = dispatch(
//           apiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
//             const post = draft.find((p) => p._id === postId);
//             if (post) post.like.push("temp");
//           })
//         );
//         const patchSingle = dispatch(
//           apiSlice.util.updateQueryData("getPostById", postId, (draft) => {
//             if (draft) draft.like.push("temp");
//           })
//         );
//         try {
//           const { data } = await queryFulfilled;
//           patchList.undo();
//           patchSingle.undo();
//           dispatch(
//             apiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
//               const post = draft.find((p) => p._id === postId);
//               if (post) post.like.push(data.userId);
//             })
//           );
//           dispatch(
//             apiSlice.util.updateQueryData("getPostById", postId, (draft) => {
//               if (draft) draft.like.push(data.userId);
//             })
//           );
//         } catch {
//           patchList.undo();
//           patchSingle.undo();
//         }
//       },
//       invalidatesTags: [{ type: "Post", id: postId }],
//     }),
//     removeLike: builder.mutation({
//       query: ({ postId }) => ({
//         url: `/posts/${postId}/like`,
//         method: "DELETE",
//       }),
//       invalidatesTags: [{ type: "Post", id: postId }],
//     }),
//   }),
// });

// // ================= EXPORT HOOKS =================
// export const {
//   useGetPostsQuery,
//   useGetPostByIdQuery,
//   useAddPostMutation,
//   useDeletePostMutation,
//   useGetCommentsQuery,
//   useAddCommentMutation,
//   useDeleteCommentMutation,
//   useAddReplyMutation,
//   useDeleteReplyMutation,
//   useAddLikeMutation,
//   useRemoveLikeMutation,
// } = apiSlice;

