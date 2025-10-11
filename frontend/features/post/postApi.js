import { api } from "../../app/apiSlice";

export const postApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query({
          query: () => "blog/post",
          providesTags: (result) =>
            result?.message
              ? [
                  ...result.message.map(({ _id }) => ({ type: "Post", id: _id })),
                  { type: "Post", id: "LIST" },
                ]
              : [{ type: "Post", id: "LIST" }],
        }),
        
        getPostById: builder.query({
            query: (postid) => `blog/post/${postid}`,
            providesTags: (result, error, postid) => {
                const authorId = result?.message?.author?._id;
                
                return [
                    {type: "Post", id: postid},
                    {type: "User", id: authorId}
                ];
            },
        }),
        
        addPost: builder.mutation({
            query: (body)=>({
                url:"blog/post",
                method:"POST",
                body,
            }),
            invalidatesTags:[{type:"Post", id:"LIST"}],
        }),
        
        likePost: builder.mutation({
            query: ({authorId, postid}) => ({
                url:`blog/post/${postid}/like`,
                method:"POST",
            }),
            invalidatesTags: (result, error, { postid, authorId }) => [
                { type: "Post", id: postid }, 
                { type: "User", id: authorId },
            ]
        }),
        
        deleteLike: builder.mutation({
          query: ({authorId, postid}) => ({
            url: `blog/post/${postid}/unlike`,
            method: "DELETE",
          }),
          invalidatesTags: (result, error, { postid, authorId }) => [
              { type: "Post", id: postid },
              { type: "User", id: authorId },
          ]
        }),
        
        deletePost: builder.mutation({
            query: ({authorId, postid}) =>({
                url:`blog/post/${postid}`,
                method:"DELETE",
            }),
            invalidatesTags: (result, error, { postid, authorId }) => [
                { type: "Post", id: postid }, 
                { type: "Post", id: "LIST" },
                { type: "User", id: authorId },
            ]
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
} = postApi