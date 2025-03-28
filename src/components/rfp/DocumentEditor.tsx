import { Button } from "@heroui/react";
import { useState, useEffect } from "react";
import Editor from "@/components/tiptap/Editor";

interface DocumentEditorProps {
	documentId: string;
	initialContent: string;
	documentName: string;
	onSave: (id: string, name: string, content: string) => Promise<void>;
}

export default function DocumentEditor({
	documentId,
	initialContent,
	documentName,
	onSave,
}: DocumentEditorProps) {
	const [content, setContent] = useState<string>(initialContent);
	const [isEditMode, setIsEditMode] = useState<boolean>(true);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	// Update local content when initialContent prop changes
	useEffect(() => {
		setContent(initialContent);
	}, [initialContent]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(documentId, documentName, content);
			setIsEditMode(false);
		} catch (error) {
			console.error("Error saving document:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div>
			<p className="font-bold text-center text-xl">Compliance Matrix</p>
			{isEditMode ? (
				<Editor
					content={content}
					editable={isEditMode}
					setContent={setContent}
				/>
			) : (
				<div className="p-5" dangerouslySetInnerHTML={{ __html: content }} />
			)}
			<div className="flex justify-end gap-3 mt-4 mb-2">
				<Button
					className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
					onPress={() => setIsEditMode(true)}
					isDisabled={isEditMode || isSaving}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4 mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						/>
					</svg>
					Edit
				</Button>
				<Button
					className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
					onPress={handleSave}
					isDisabled={!isEditMode || isSaving}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4 mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</div>
	);
}
