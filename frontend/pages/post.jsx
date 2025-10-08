import { useState } from "react";
import { Heart, Share2, UserPlus } from "lucide-react";
import {LoaderOne as Spinner} from "../components/spinner"
import CommentCard from "../components/comment";
import { useGetPostByIdQuery } from "../features/post/postApi";
import { useGetCommentsQuery, useAddCommentMutation } from "../features/comment/commentApi";
import { Link, useParams } from "react-router-dom";

export default function PostSection() {

  const {postid} = useParams()
  
  const {data, isLoading, isError} = useGetPostByIdQuery(postid)
  const {data:commentData, isLoading:commentIsLoading} = useGetCommentsQuery(postid)
    
  const [addComment] = useAddCommentMutation()
  const [formData, setFormData] = useState({
    postid:postid,
    content:"",
  })

  if(isLoading){
    return <Spinner/>
  }

  if(commentIsLoading){
    return <Spinner/>
  }

  if (isError) {
    return <div className="text-center mt-10 text-red-500">Failed to load post.</div>;
  }
  
  console.log(data);
  console.log(commentData)

  const post = data?.message
  const comment = commentData?.message || []

  if (!post) return <div className="text-center mt-10">Post not found.</div>;

  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()

    try {
      const res = await addComment({
        postId: formData.postid,
        body: { content: formData.content },      
      }).unwrap();

      console.log("Comment added:", res);
      setFormData({ ...formData, content: "" });
    } catch (err) {
      console.error("Comment failed:", err);
    }
  }
      


  return (
    <div className="flex gap-4 max-w-6xl mx-auto p-6">
      {/* Left Side - Post 70% */}
      <div className="flex-1 basis-7/10 border rounded-lg shadow-md p-4 flex flex-col gap-4 bg-white">
        {/* User Info + Follow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/user/${post.author._id}`}>
              <div className="flex items-center justify-center gap-3 hover:underline">
              <img
                src={post.author.profileimg || "https://randomuser.me/api/portraits/men/65.jpg"} 
                alt={post.author.username}
                className="w-12 h-12 rounded-full"
              />
                <h4 className="font-bold">{post.author.username}</h4>
              </div>
            </Link>
              <span className="text-gray-500 text-sm">                  
                {new Date(post.createdAt).toLocaleString()} {/* show readable date */}
              </span>
          </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-xl">
              <UserPlus className="w-4 h-4" /> Follow
            </button>
        </div>

        {/* Like & Share Buttons ABOVE */}
        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1 text-gray-700 hover:text-red-500 transition">
            <Heart className="w-5 h-5" /> Like
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition">
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {/* Title + Image + Content */}
        <div className="flex flex-col gap-3 mt-2">
          <h2 className="text-4xl font-semibold">{post.title}</h2>
          {post.img && (
            <img
              src={post.img}
              alt={post.title}
              className="w-full h-fit "
            />
          )}
          <p className="text-gray-700">{post.content}</p>
        </div>
      </div>

      {/* Right Side - Comments 30% */}
      <div className="flex flex-col basis-3/10 gap-4">
        <h3 className="text-2xl font-semibold">Comments</h3>

        {/* Comment input */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <textarea
            onChange={handleChanges}
              name="content"
              value={formData.content}
              placeholder="Write a comment..."
              className="border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-black bg-white/80"
              rows={4}
            />
            <button className="px-3 py-1 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition" type="submit">
              Comment
            </button>
          </div>
        </form>

        {/* Comments list */}
          {
              comment.map((c)=>(
              <CommentCard key={c._id} comments={c}/>
              ))
          }
      </div>
    </div>
  );
}
