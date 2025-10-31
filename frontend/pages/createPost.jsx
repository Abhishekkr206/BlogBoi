import { useState, useRef } from "react";
import { Image, X } from "lucide-react";
import { useAddPostMutation } from "../features/post/postApi";
import TextEditor from "../components/TextEditor";
import { useSelector } from "react-redux";
import { useToast } from "../components/Toast";

export default function CreatePost() {
  const [addPost] = useAddPostMutation();
  const editorRef = useRef(null);
  
  const [postData, setPostData] = useState({
    img: null,
    title: "",
    content: ""
  });
  const { showError, showMessage } = useToast();
  
  const currentUserId = useSelector((state) => state.auth.user?._id);

  const handleChanges = (e) => {
    if (e.target.name === "img" && e.target.files?.[0]) {
      setPostData({ ...postData, img: e.target.files[0] });
    } else {
      setPostData({ ...postData, [e.target.name]: e.target.value });
    }
  };

  const removeImage = () => {
    setPostData({ ...postData, img: null });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);

      if (postData.img) {
        formData.append("img", postData.img);
      }

      await addPost({body:formData, authorId:currentUserId}).unwrap();

      console.log("Post created successfully");

      setPostData({ img: null, title: "", content: "" });
      
      if (editorRef.current) {
        editorRef.current.clearContent();
      }
      showMessage("Post created successfully");
    } catch (err) {
      console.log(err);
      showError("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <label
              htmlFor="image-upload"
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-700"
              title="Add Image"
            >
              <Image size={20} className="text-gray-700" />
            </label>
            <input
              id="image-upload"
              name="img"
              type="file"
              accept="image/*"
              onChange={handleChanges}
              className="hidden"
            />
            
            {postData.img && (
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                {postData.img.name}
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            type="button"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-all"
          >
            Publish
          </button>
        </div>

        <div className="bg-white border rounded-xl p-8 shadow-sm">
          <input
            type="text"
            name="title"
            placeholder="Untitled Post"
            value={postData.title}
            onChange={handleChanges}
            className="w-full text-5xl font-bold outline-none placeholder-gray-400 mb-5 bg-transparent border border-gray-700 p-2 rounded-xl "
          />

          {postData.img && (
            <div className="relative mb-6">
              <img 
                src={URL.createObjectURL(postData.img)} 
                alt="Preview" 
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <TextEditor ref={editorRef} onChange={setPostData} />
        </div>
      </div>
    </div>
  );
}