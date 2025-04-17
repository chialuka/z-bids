import {
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Spinner,
	Button,
} from "@heroui/react";
import { Document, Folder } from "@/types";
import { useState } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { OpenFolderIcon } from "../icons/OpenFolderIcon";
import { ClosedFolderIcon } from "../icons/ClosedFolderIcon";

interface FileListProps {
	files: Document[];
	folders: Folder[];
	isLoading: boolean;
	onFileSelect: (file: Document) => void;
}

export default function FileList({
	files,
	folders,
	isLoading,
	onFileSelect,
}: FileListProps) {
	const [activeFile, setActiveFile] = useState<string | null>(null);
	const [openFolders, setOpenFolders] = useState<number[]>([]);

	const openOrCloseFolder = (index: number) => {
		if (openFolders.includes(index)) {
			setOpenFolders(openFolders.filter((i) => i !== index));
		} else {
			setOpenFolders([...openFolders, index]);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center p-4">
				<Spinner color="default" label="Parsing document..." />
			</div>
		);
	}

	if (!files.length) {
		return <p className="text-gray-500 text-center p-4">No files found.</p>;
	}

	// Mobile view
	const renderMobileView = () =>
		folders.map((folder, index) => (
			<div className="space-y-4 sm:hidden" key={index}>
				<div
					onClick={() => openOrCloseFolder(index)}
					className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 rounded-md transition-colors touch-manipulation"
				>
					{openFolders.includes(index) ? (
						<OpenFolderIcon className="text-blue-500 transition-transform duration-1000 w-6 h-6" />
					) : (
						<ClosedFolderIcon className="text-blue-500 transition-transform duration-1000 w-6 h-6" />
					)}
					<p className="font-medium text-gray-700 text-base">
						{folder.name}
					</p>
				</div>
				{openFolders.includes(index) && (
					<div className="space-y-4 pl-4">
						{files
							.filter((file: Document) => file.folderId === folder.id)
							.map((file: Document) => (
								<div 
									key={file.id} 
									className="border rounded-lg p-3 space-y-3 bg-white shadow-sm"
								>
									<div className="flex justify-between items-start">
										<h3 className="font-medium text-sm text-gray-900 line-clamp-2 max-w-[200px]">{file.name}</h3>
										<Button
											isIconOnly
											variant="light"
											onPress={() => setActiveFile(activeFile === file.id.toString() ? null : file.id.toString())}
											className="p-1"
										>
											<ChevronDownIcon 
												className="w-5 h-5" 
												isOpen={activeFile === file.id.toString()}
											/>
										</Button>
									</div>
									
									<p className="text-xs text-gray-500 line-clamp-3 max-w-[200px]">{file.description}</p>
									
									<p className="text-xs text-gray-500">
										{file.dueDate
											? new Date(file.dueDate).toLocaleDateString()
											: "No due date"}
									</p>

									{activeFile === file.id.toString() && (
										<div className="space-y-2 pt-2 border-t">
											<Button
												size="sm"
												fullWidth
												onPress={() => onFileSelect(file)}
												className="text-sm"
											>
												Generate Cover Sheet
											</Button>
											<Button
												size="sm"
												fullWidth
												variant="bordered"
												className="text-sm"
											>
												Generate Compliance Matrix
											</Button>
										</div>
									)}
								</div>
							))}
					</div>
				)}
			</div>
		));

	// Desktop view
	const renderDesktopView = () => (
		<div className="hidden sm:block max-h-[80vh] overflow-y-auto border border-gray-200 rounded-lg p-4">
			<div className="space-y-4">
				{folders.map((folder, index) => (
					<div className="pl-2" key={index}>
						<div
							onClick={() => openOrCloseFolder(index)}
							className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 sm:p-2 rounded-md transition-colors touch-manipulation"
						>
							{openFolders.includes(index) ? (
								<OpenFolderIcon className="text-blue-500 transition-transform duration-1000 w-6 h-6 sm:w-5 sm:h-5" />
							) : (
								<ClosedFolderIcon className="text-blue-500 transition-transform duration-1000 w-6 h-6 sm:w-5 sm:h-5" />
							)}
							<p className="font-medium text-gray-700 text-base sm:text-sm">
								{folder.name}
							</p>
						</div>
						{openFolders.includes(index) && (
							<Table aria-label="Table of Files">
								<TableHeader>
									<TableColumn>Name</TableColumn>
									<TableColumn>Summary</TableColumn>
									<TableColumn>Cover Sheet</TableColumn>
									<TableColumn>Compliance Matrix</TableColumn>
									<TableColumn>Due Date</TableColumn>
								</TableHeader>
								<TableBody>
									{files
										.filter((file: Document) => file.folderId === folder.id)
										.map((file: Document) => (
											<TableRow key={file.id}>
												<TableCell>{file.name}</TableCell>
												<TableCell>{file.description}</TableCell>
												<TableCell>
													<Button size="sm" onPress={() => onFileSelect(file)}>
														Generate Cover Sheet
													</Button>
												</TableCell>
												<TableCell>
													<Button size="sm" variant="bordered">
														Generate Compliance Matrix
													</Button>
												</TableCell>
												<TableCell>
													{file.dueDate
														? new Date(file.dueDate).toLocaleDateString()
														: "No due date"}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						)}
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div>
			{renderMobileView()}
			{renderDesktopView()}
		</div>
	);
}
