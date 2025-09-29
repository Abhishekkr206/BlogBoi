import { useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="min-h-screen bg-white/10 text-black px-8 py-5">
      <div className="max-w-3xl mx-auto">
        {/* Title input */}
        <input
          type="text"
          placeholder="Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-5xl font-bold outline-none placeholder-gray-400 mb-6 bg-white border-1 border-black/20 p-3 rounded-xl"
        />
        
        {/* Content editor */}
        <textarea
          placeholder="Tell your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
          
          <button className="px-6 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition">
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}