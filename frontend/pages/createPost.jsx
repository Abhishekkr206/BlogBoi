import { useState, useRef } from "react";
import { Image, X } from "lucide-react";
import { useAddPostMutation } from "../features/post/postApi";
import TextEditor from "../components/TextEditor";
import { useSelector } from "react-redux";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { LoaderOne as Spinner } from "../components/spinner";

export default function CreatePost() {
  // Local loading state
  const [isLoading, setIsLoading] = useState(false)

  // API mutation
  const [addPost] = useAddPostMutation();

  // Ref for clearing editor content
  const editorRef = useRef(null);
  
  // Post form state
  const [postData, setPostData] = useState({
    img: null,
    title: "",
    content: ""
  });

  const { showError, showMessage } = useToast();
  const currentUserId = useSelector((state) => state.auth.user?._id);
  const navigate = useNavigate();

  // Handle input changes (image + text fields)
  const handleChanges = (e) => {
    if (e.target.name === "img" && e.target.files?.[0]) {
      const file = e.target.files[0];

      // Frontend file validation (max 5MB + allowed types)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        showError("Only JPG, JPEG, PNG files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError("File size must be below 5MB");
        return;
      }

      setPostData({ ...postData, img: file });
    } else {
      setPostData({ ...postData, [e.target.name]: e.target.value });
    }
  };

  // Remove selected image
  const removeImage = () => {
    setPostData({ ...postData, img: null });
  };
  
  // Show full-screen loader during post creation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50/20">
        <Spinner />
      </div>
    )
  }

  // Submit post
  const handleSubmit = async () => {

  if (!postData.title.trim()) {
    showError("Title is required");
    return;
  }

  if (!postData.content || !postData.content.trim()) {
    showError("Content is required");
    return;
  }
  
    try {
      setIsLoading(true)

      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);

      if (postData.img) {
        formData.append("img", postData.img);
      }

      await addPost({ body: formData, authorId: currentUserId }).unwrap();

      setPostData({ img: null, title: "", content: "" });

      if (editorRef.current) {
        editorRef.current.clearContent();
      }

      showMessage("Post created successfully");
      navigate(`/user/${currentUserId}`);
    } catch (err) {
      setIsLoading(false)
      console.log(err);
      showError("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20">
      <div className="sm:max-w-4xl w-full mx-auto px-1.5 sm:px-6 py-6 sm:py-8">
        
        {/* ---------- Top Bar ---------- */}
        <div className="bg-white border rounded-xl p-4 mb-6 flex flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            
            {/* Image Upload Button */}
            <label
              htmlFor="image-upload"
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-700"
              title="Add Image"
            >
              <Image size={18} className="text-gray-700" />
            </label>

            {/* Hidden File Input */}
            <input
              id="image-upload"
              name="img"
              type="file"
              accept="image/*"
              onChange={handleChanges}
              className="hidden"
            />

            {/* Display selected filename */}
            {postData.img && (
              <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg truncate max-w-[150px] sm:max-w-none">
                {postData.img.name}
              </span>
            )}
          </div>

          {/* Publish Button */}
          <button
            onClick={handleSubmit}
            type="button"
            className="w-auto px-4 sm:px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-all"
          >
            Publish
          </button>
        </div>

        {/* UI Note for image rules */}
        <p className="text-xs sm:text-sm text-gray-600 mb-3 ml-1">
          <strong>Allowed:</strong> JPG, JPEG, PNG — <strong>Max size:</strong> 5MB
        </p>

        {/* ---------- Post Editor Card ---------- */}
        <div className="bg-white border rounded-xl p-4 px-2 sm:p-8 shadow-sm">
          
          {/* Title Input */}
          <input
            type="text"
            name="title"
            placeholder="Untitled Post"
            value={postData.title}
            onChange={handleChanges}
            className="w-full h-18 text-2xl sm:text-4xl lg:text-5xl font-bold outline-none placeholder-gray-400 mb-4 sm:mb-5 bg-transparent border border-gray-700 p-2 rounded-xl"
          />

          {/* Image Preview */}
          {postData.img && (
            <div className="relative mb-6">
              <img
                src={URL.createObjectURL(postData.img)}
                alt="Preview"
                className="w-full max-h-80 object-cover rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Rich Text Editor */}
          <div className="min-h-[200px] sm:min-h-[300px]">
            <TextEditor ref={editorRef} onChange={setPostData} />
          </div>
        </div>

      </div>
    </div>
  );
}
