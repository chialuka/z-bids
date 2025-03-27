"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({
	content,
	editable = true,
  setContent,
}: {
	content: string;
	editable: boolean;
  setContent: (content: string) => void;
}) => {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		immediatelyRender: false,
		autofocus: true,
		editable,
    onUpdate: ({ editor }) => {
      // Update content state when editor content changes
      setContent(editor.getHTML());
    },
	});

	useEffect(() => {
		if (editor) {
			editor.setEditable(editable);
			if (content !== editor.getHTML()) {
				editor.commands.setContent(content);
			}
		}
	}, [editor, editable, content]);

	return <EditorContent editor={editor} />;
};

export default Editor;
