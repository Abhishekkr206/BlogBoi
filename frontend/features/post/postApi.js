import { api } from "../../app/apiSlice";

export const postApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query({
          query: ({page}) => `blog/post?page=${page}&limit=6`,
          providesTags: (result) =>
            result?.message
              ? [
                  ...result.message.map(({ _id }) => ({ type: "Post", id: _id })),
                  { type: "Post", id: "LIST" },
                ]
              : [{ type: "Post", id: "LIST" }],
        }),
        
        getPostById: builder.query({
            query: (postid) => `blog/post/${postid}?page=1&limit=5`,
            providesTags: (result, error, postid) => {
                const authorId = result?.message?.author?._id;
                
                return [
                    {type: "Post", id: postid},
                    {type: "User", id: authorId}
                ];
            },
        }),
        
        addPost: builder.mutation({
            query: ({body, authorId})=>({
                url:"blog/post",
                method:"POST",
                body,
            }),
            invalidatesTags: (result, error, { authorId }) => [
                { type: "Post", id: "LIST" },
                { type: "User", id: authorId },
            ]
        }),

        likePost: builder.mutation({
            query: ({authorId, postid}) => ({
                url:`blog/post/${postid}/like`,
                method:"POST",
            }),
            async onQueryStarted({ postid, authorId }, { dispatch, queryFulfilled }) {
                const patches = [];
                
                // Update getPostById cache
                patches.push(
                    dispatch(
                        postApi.util.updateQueryData('getPostById', postid, (draft) => {
                            if (draft?.message) {
                                draft.message.like = (draft.message.like || 0) + 1;
                                draft.message.isliked = true;
                            }
                        })
                    )
                );

                // ✅ Update getPosts cache for multiple pages
                for (let page = 1; page <= 30; page++) {
                    patches.push(
                        dispatch(
                            postApi.util.updateQueryData('getPosts', { page }, (draft) => {
                                if (draft?.message) {
                                    const post = draft.message.find(p => p._id === postid);
                                    if (post) {
                                        post.like = (post.like || 0) + 1;
                                        post.isliked = true;
                                    }
                                }
                            })
                        )
                    );
                }

                // Update getUserData cache
                patches.push(
                    dispatch(
                        postApi.util.updateQueryData('getUserData', { userid: authorId, page: 1 }, (draft) => {
                            if (draft?.response?.blogs) {
                                const post = draft.response.blogs.find(p => p._id === postid);
                                if (post) {
                                    post.like = (post.like || 0) + 1;
                                    post.isliked = true;
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
            },
        }),
        
        deleteLike: builder.mutation({
          query: ({authorId, postid}) => ({
            url: `blog/post/${postid}/unlike`,
            method: "DELETE",
          }),
          async onQueryStarted({ postid, authorId }, { dispatch, queryFulfilled }) {
                const patches = [];
                
                // Update getPostById cache
                patches.push(
                    dispatch(
                        postApi.util.updateQueryData('getPostById', postid, (draft) => {
                            if (draft?.message) {
                                draft.message.like = Math.max(0, (draft.message.like || 0) - 1);
                                draft.message.isliked = false;
                            }
                        })
                    )
                );

                // ✅ Update getPosts cache for multiple pages
                for (let page = 1; page <= 10; page++) {
                    patches.push(
                        dispatch(
                            postApi.util.updateQueryData('getPosts', { page }, (draft) => {
                                if (draft?.message) {
                                    const post = draft.message.find(p => p._id === postid);
                                    if (post) {
                                        post.like = Math.max(0, (post.like || 0) - 1);
                                        post.isliked = false;
                                    }
                                }
                            })
                        )
                    );
                }

                // Update getUserData cache
                patches.push(
                    dispatch(
                        postApi.util.updateQueryData('getUserData', { userid: authorId, page: 1 }, (draft) => {
                            if (draft?.response?.blogs) {
                                const post = draft.response.blogs.find(p => p._id === postid);
                                if (post) {
                                    post.like = Math.max(0, (post.like || 0) - 1);
                                    post.isliked = false;
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
            },
        }),
        
        deletePost: builder.mutation({
            query: ({authorId, postid}) =>({
                url:`blog/post/${postid}`,
                method:"DELETE",
            }),
            async onQueryStarted({ postid, authorId }, { dispatch, queryFulfilled }) {
                const patches = [];

                // Update getPosts cache - remove post from all pages
                for (let page = 1; page <= 30; page++) {
                    patches.push(
                        dispatch(
                            postApi.util.updateQueryData('getPosts', { page }, (draft) => {
                                if (draft?.message) {
                                    draft.message = draft.message.filter(p => p._id !== postid);
                                }
                            })
                        )
                    );
                }
            
                // Update getUserData cache - remove post from user's profile
                for (let page = 1; page <= 10; page++) {
                    patches.push(
                        dispatch(
                            postApi.util.updateQueryData('getUserData', { userid: authorId, page }, (draft) => {
                                if (draft?.response?.blogs) {
                                    draft.response.blogs = draft.response.blogs.filter(p => p._id !== postid);
                                }
                            })
                        )
                    );
                }
            
                try {
                    await queryFulfilled;
                } catch {
                    // Rollback all patches on error
                    patches.forEach(patch => patch.undo());
                }
            },
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