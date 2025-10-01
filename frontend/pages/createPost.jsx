import { useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { useAddPostMutation } from "../features/post/postApi";

export default function CreatePost() {
  const [addPost] = useAddPostMutation()

  const [postData, setPostData] = useState({
    img:null,
    title:"",
    content:""
  });

  const handleChanges = (e) => {
    if (e.target.type === "file") {
      setPostData({ ...postData, img: e.target.files[0] }); // single file
    } else {
      setPostData({ ...postData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e)=>{

    e.preventDefault()

    try{
      const formData = new FormData()
      formData.append("title", postData.title)
      formData.append("content", postData.content)

      if (postData.img) {
        formData.append("img", postData.img);
      }

      await addPost(formData).unwrap()

      console.log("ho gaya post create")

      // Reset the form here
      setPostData({ img: null, title: "", content: "" });
    }
    catch(err){
      console.log(err)
    }
  }
  

  return (
    <div className="min-h-screen bg-white/10 text-black px-8 py-5">
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleChanges} />
        <div className="max-w-3xl mx-auto">
          {/* Title input */}
          <input
            type="text"
            name="title"
            placeholder="Title..."
            value={postData.title}
            onChange={handleChanges}
            className="w-full text-5xl font-bold outline-none placeholder-gray-400 mb-6 bg-white border-1 border-black/20 p-3 rounded-xl"
          />
          
          {/* Content editor */}
          <textarea
            name="content"
            placeholder="Tell your story..."
            value={postData.content}
            onChange={handleChanges}
            className="w-full h-[62vh] text-xl leading-relaxed outline-none placeholder-gray-400 resize-none bg-white border-1 border-black/20 p-3 rounded-xl"
          />
  
          {/* Formatting toolbar and Publish button */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-200 rounded transition">
                <Bold size={20} />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition">
                <Italic size={20} />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition">
                <Underline size={20} />
              </button>
            </div>
            
            <button className="px-6 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition" type="submit">
              Publish
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}