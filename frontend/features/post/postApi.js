import { api } from "../../app/apiSlice";

export const postApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query({
            query: ()=> "/post",
            providesTags:(result) =>
                result
            ? [
                ...result.map(({id}) => ({ type:"Post", id:_id})),
                { type: "Post", id: "LIST" },
                ]
            : [{ type: "Post", id: "LIST" }],
        }),
        getPostById: builder.query({
            query: (postid) => `/post/${postid}`,
            providesTags: (result, error, postid) => [{type:"Post", id: postid}],
        }),
        addPost: builder.mutation({
            query: (body)=>({
                url:"/post",
                method:"POST",
                body,
            }),
            invalidatesTags:[{type:"Post", id:"LIST"}],
        }),
        likePost: builder.mutation({
            query: (postId) => ({
                url:`/post/${postId}/like`,
                method:"POST",
            }),
        invalidatesTags: (result, error, postId) => [
            { type: "Post", id: postId },
        ],
        }),
        deleteLike: builder.mutation({
            query:(postid) =>({
                url:`/post/${postid}/like`,
                method:"DELETE",
            }),
            invalidatesTags:[{type:"Post", id: postid}]
        }),
        deletePost: builder.mutation({
            query: (postid) =>({
                url:`/post${postid}`,
                method:"DELETE",
            }),
            invalidatesTags:[{type:"Post", id:"LIST"}],
        })
    })
})

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useAddPostMutation,
  useLikePostMutation,
  useDeleteLikeMutation,
  useDeletePostMutation,
} = postApi;