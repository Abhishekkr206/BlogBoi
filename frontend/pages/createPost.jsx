import { useState } from "react";

export default function CreatePostFull() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Function to render HTML tags in content
  const renderContent = (text) => {
    return { __html: text };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-8">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-center">Create Post</h1>

        {/* Title input */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-6 py-4 border border-gray-300 rounded-md focus:outline-none focus:border-black text-2xl font-bold"
        />

        {/* Content textarea */}
        <textarea
          placeholder="Write your content here using <b>bold</b>, <i>italic</i>, <u>underline</u>"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="w-full px-6 py-4 border border-gray-300 rounded-md focus:outline-none focus:border-black resize-none text-lg"
        />

        {/* Live Preview */}
        <div className="border-t border-gray-300 pt-4">
          <h2 className="text-2xl font-semibold mb-2">Preview</h2>
          <div
            className="prose max-w-full text-gray-800"
            dangerouslySetInnerHTML={renderContent(content)}
          ></div>
        </div>

        {/* Post Button */}
        <button className="px-8 py-4 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition text-lg self-end">
          Post
        </button>
      </div>
    </div>
  );
}
