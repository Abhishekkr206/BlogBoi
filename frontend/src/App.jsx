// App.jsx
import React, { useState } from "react";
import {
  useGetPostsQuery,
  useAddPostMutation,
  useLikePostMutation,
  useDeleteLikeMutation,
} from "../features/post/postApi";

import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useAddReplyMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} from "../features/comment/commentApi";

// ---- PostItem component ----
function PostItem({ post }) {
  const { data: commentsData, isLoading, error } = useGetCommentsQuery(post._id);
  const [addComment] = useAddCommentMutation();
  const [addReply] = useAddReplyMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [deleteReply] = useDeleteReplyMutation();

  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});

  const comments = commentsData?.message || [];

  const handleAddComment = async () => {
    if (!commentText) return;
    await addComment({ postId: post._id, body: { content: commentText } });
    setCommentText("");
  };

  const handleAddReply = async (commentId) => {
    if (!replyText[commentId]) return;
    await addReply({ commentId, postId: post._id, body: { content: replyText[commentId] } });
    setReplyText({ ...replyText, [commentId]: "" });
  };

  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      {post.img && <img src={post.img} alt="" style={{ maxWidth: "200px" }} />}
      <p>Likes: {post.like?.length || 0}</p>

      {/* Comments */}
      <h4>Comments</h4>
      <input
        placeholder="Add comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <button onClick={handleAddComment}>Comment</button>

      {isLoading && <p>Loading comments...</p>}
      {error && <p>Error loading comments</p>}

      {comments.map((c) => (
        <div key={c._id} style={{ marginLeft: "20px", marginTop: "5px" }}>
          <p>
            <b>{c.author?.username}:</b> {c.content}
          </p>
          <button onClick={() => deleteComment({ commentId: c._id, postId: post._id })}>
            Delete Comment
          </button>

          <input
            placeholder="Reply..."
            value={replyText[c._id] || ""}
            onChange={(e) => setReplyText({ ...replyText, [c._id]: e.target.value })}
          />
          <button onClick={() => handleAddReply(c._id)}>Reply</button>

          {c.reply?.map((r) => (
            <div key={r._id} style={{ marginLeft: "20px" }}>
              <p>
                <b>{r.author?.username}:</b> {r.content}
              </p>
              <button onClick={() => deleteReply({ commentId: c._id, replyId: r._id })}>
                Delete Reply
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---- Main App ----
function App() {
  const { data: postsData, isLoading, error } = useGetPostsQuery();
  const [addPost] = useAddPostMutation();
  const [likePost] = useLikePostMutation();
  const [deleteLike] = useDeleteLikeMutation();

  const posts = postsData?.message || [];

  const handleAddPost = async () => {
    await addPost({
      title: "Demo Post",
      content: "Hello World",
      img: "https://via.placeholder.com/300",
    });
  };

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error fetching posts</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Posts Demo with Comments & Replies</h1>
      <button onClick={handleAddPost}>Add Demo Post</button>

      {posts.map((post) => (
        <PostItem key={post._id} post={post} />
      ))}
    </div>
  );
}

export default App;
