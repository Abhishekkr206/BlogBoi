import { useEditor, EditorContent} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { forwardRef, useImperativeHandle } from 'react';
import { Bold, Italic, Heading3 } from 'lucide-react';

const TextEditor = forwardRef(({ onChange }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      BubbleMenu
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onChange((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  useImperativeHandle(ref, () => ({
    clearContent: () => {
      if (editor) {
        editor.commands.clearContent();
      }
    },
  }));

  if (!editor) return null;

  return (
    <div  onClick={() => editor?.commands.focus()} >
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex gap-1 bg-gray-800 rounded px-2 py-2 text-white">
          {/* <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 text-sm rounded-sm ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-700' : 'bg-gray-800'
            }`}
          >
            <Heading3 size={20} />
          </button> */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-sm rounded-sm ${
              editor.isActive('bold') ? 'bg-gray-700' : 'bg-gray-800'
            }`}
          >
            <Bold size={20} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-sm rounded-sm ${
              editor.isActive('italic') ? 'bg-gray-700' : 'bg-gray-800'
            }`}
          >
            <Italic size={20} />
          </button>
        </div>
      </BubbleMenu>
      
      <EditorContent editor={editor} className='text-xl min-h-[500px] p-3 rounded-2xl border border-gray-700' />
    </div>
  );
});

TextEditor.displayName = 'TextEditor';

export default TextEditor;