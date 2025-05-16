import {
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Spinner,
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { Document, Folder, File as UploadThingFile } from "@/types";
import { useEffect, useState, ReactNode, useRef } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { OpenFolderIcon } from "../icons/OpenFolderIcon";
import { ClosedFolderIcon } from "../icons/ClosedFolderIcon";
import { useDrag, useDrop } from 'react-dnd';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

// Define item types for drag and drop
const ItemTypes = {
	FILE: 'file',
};

interface DraggableItemType {
	id: number;
	type: string;
}

interface DraggableFileProps {
	file: Document;
	children: ReactNode;
}

// Draggable file component
const DraggableFile = ({ file, children }: DraggableFileProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [{ isDragging }, dragRef] = useDrag({
		type: ItemTypes.FILE,
		item: { id: file.id, type: ItemTypes.FILE } as DraggableItemType,
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	});
	
	dragRef(ref);

	return (
		<div
			ref={ref}
			style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
		>
			{children}
		</div>
	);
};

interface DroppableFolderProps {
	folder: Folder;
	onMoveFile: (fileId: number, targetFolderId: number) => Promise<void>;
	children: ReactNode;
	openFolders: number[];
	openOrCloseFolder: (index: number) => void;
	index: number;
	onEditFolder?: (folderId: number, newName: string) => Promise<void>;
	onDeleteFolder?: (folderId: number) => Promise<void>;
}

// Droppable folder component
const DroppableFolder = ({ 
	folder, 
	onMoveFile, 
	children, 
	openFolders, 
	openOrCloseFolder, 
	index,
	onEditFolder,
	onDeleteFolder
}: DroppableFolderProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [folderName, setFolderName] = useState(folder.name);
	
	const [{ isOver }, dropRef] = useDrop({
		accept: ItemTypes.FILE,
		drop: (item: DraggableItemType) => {
			onMoveFile(item.id, folder.id);
			return { moved: true };
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
		}),
	});
	
	dropRef(ref);
	
	const handleSaveEdit = async () => {
		if (folderName.trim() && onEditFolder) {
			await onEditFolder(folder.id, folderName);
			setIsEditing(false);
		}
	};

	return (
		<div 
			ref={ref} 
			className={`${isOver ? 'bg-blue-50' : ''} transition-colors`}
		>
			<div
				className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 sm:p-2 rounded-md transition-colors touch-manipulation ${isOver ? 'bg-blue-100' : ''}`}
			>
				{isEditing ? (
					<>
						<input
							type="text"
							value={folderName}
							onChange={(e) => setFolderName(e.target.value)}
							className="border rounded px-2 py-1 flex-1"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleSaveEdit();
								if (e.key === 'Escape') {
									setFolderName(folder.name);
									setIsEditing(false);
								}
							}}
						/>
						<Button 
							size="sm" 
							onPress={handleSaveEdit}
							variant="ghost"
						>
							Save
						</Button>
						<Button 
							size="sm" 
							onPress={() => {
								setFolderName(folder.name);
								setIsEditing(false);
							}}
							variant="ghost"
						>
							Cancel
						</Button>
					</>
				) : (
					<>
						<div 
							onClick={() => openOrCloseFolder(index)}
							className="flex-1 flex items-center gap-2"
						>
							{openFolders.includes(index) ? (
								<OpenFolderIcon className="text-blue-500 transition-transform duration-500 w-6 h-6 sm:w-5 sm:h-5" />
							) : (
								<ClosedFolderIcon className="text-blue-500 transition-transform duration-500 w-6 h-6 sm:w-5 sm:h-5" />
							)}
							<p className="font-medium text-gray-700 text-base sm:text-sm">
								{folder.name}
							</p>
						</div>
						{isOver && (
							<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
								Drop here
							</span>
						)}
						<Dropdown>
							<DropdownTrigger>
								<Button 
									isIconOnly 
									variant="light" 
									size="sm"
									onClick={(e) => e.stopPropagation()}
								>
									<EllipsisVerticalIcon className="h-5 w-5" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem 
									key="edit" 
									onPress={() => setIsEditing(true)}
								>
									Edit
								</DropdownItem>
								<DropdownItem 
									key="delete" 
									color="danger"
									onPress={() => onDeleteFolder && onDeleteFolder(folder.id)}
								>
									Delete
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</>
				)}
			</div>
			{children}
		</div>
	);
};

interface FileListProps {
	files: Document[];
	folders: Folder[];
	isLoading: boolean;
	onFileSelect: (
		file: Document,
		contentType: "coverSheet" | "pdfContent" | "complianceMatrix" | "feasibilityCheck"
	) => void;
	onMoveFile: (fileId: number, targetFolderId: number) => Promise<void>;
	onEditFolder?: (folderId: number, newName: string) => Promise<void>;
	onDeleteFolder?: (folderId: number) => Promise<void>;
}

export default function FileList({
	files,
	folders,
	isLoading,
	onFileSelect,
	onMoveFile,
	onEditFolder,
	onDeleteFolder,
}: FileListProps) {
	const [activeFile, setActiveFile] = useState<string | null>(null);
	const [openFolders, setOpenFolders] = useState<number[]>([]);
	const [uploadThingFiles, setUploadThingFiles] = useState<UploadThingFile[]>(
		[]
	);
	
	// Filter out duplicate folders by ID and ensure they have unique keys
	const uniqueFolders = folders.filter((folder, index, self) => 
		index === self.findIndex((f) => f.id === folder.id)
	);
	
	// Get files that don't belong to any folder
	const filesWithoutFolder = files.filter(file => !file.folderId);
	
	console.log({ uniqueFolders });
	useEffect(() => {
		const fetchUploadThingFiles = async () => {
			const response = await fetch("/api/uploadthing");
			const data = await response.json();
			setUploadThingFiles(data.files);
		};
		fetchUploadThingFiles();
	}, []);

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

	const openFilePdf = ({ name }: { name: string }) => {
		const file = uploadThingFiles.find((file) => file.name === name);
		if (file) {
			window.open(`https://pa6rt2x38u.ufs.sh/f/${file.key}`, "_blank");
		}
	};

	// Render files without a folder
	const renderFilesWithoutFolder = (isMobile = false) => {
		if (!filesWithoutFolder.length) return null;
		
		if (isMobile) {
			return (
				<div className="space-y-4 md:hidden mt-4 border-t pt-4">
					<h3 className="font-medium text-gray-700">Uncategorized Files</h3>
					<div className="space-y-4">
						{filesWithoutFolder.map((file) => (
							<DraggableFile key={`file-${file.id}-uncat`} file={file}>
								<div className="border rounded-lg p-3 space-y-3 bg-white shadow-sm">
									<div className="flex justify-between items-start">
										<h3
											onClick={() => openFilePdf({ name: file.name })}
											className="font-medium text-sm text-gray-900 line-clamp-2 max-w-[200px] cursor-pointer"
										>
											{file.name}
										</h3>
										<Button
											isIconOnly
											variant="light"
											onPress={() =>
												setActiveFile(
													activeFile === file.id.toString()
														? null
														: file.id.toString()
												)
											}
											className="p-1"
										>
											<ChevronDownIcon
												className="w-5 h-5"
												isOpen={activeFile === file.id.toString()}
											/>
										</Button>
									</div>

									<p className="text-xs text-gray-500 line-clamp-3 max-w-[200px]">
										{file.description}
									</p>

									<p className="text-xs text-gray-500">
										{file.dueDate
											? new Date(file.dueDate).toISOString().split('T')[0]
											: "No due date"}
									</p>

									{activeFile === file.id.toString() && (
										<div className="space-y-2 pt-2 border-t">
											<Button
												size="sm"
												fullWidth
												onPress={() => onFileSelect(file, "coverSheet")}
												className="text-sm"
											>
												Generate Cover Sheet
											</Button>
											<Button
												size="sm"
												fullWidth
												variant="bordered"
												className="text-sm"
												onPress={() => onFileSelect(file, "complianceMatrix")}
											>
												Generate Compliance Matrix
											</Button>
											<Button
												size="sm"
												fullWidth
												variant="flat"
												color="secondary"
												className="text-sm"
												onPress={() => onFileSelect(file, "feasibilityCheck")}
											>
												Feasibility Check
											</Button>
										</div>
									)}
								</div>
							</DraggableFile>
						))}
					</div>
				</div>
			);
		} else {
			// Desktop view
			return (
				<div className="hidden md:block mt-4 border-t pt-4">
					<h3 className="font-medium text-gray-700 mb-2">Uncategorized Files</h3>
					<Table aria-label="Uncategorized Files">
						<TableHeader>
							<TableColumn className="w-1/4">Name</TableColumn>
							<TableColumn className="w-1/3">Summary</TableColumn>
							<TableColumn className="w-1/6">Cover Sheet</TableColumn>
							<TableColumn className="w-1/6">
								Compliance Matrix
							</TableColumn>
							<TableColumn className="w-1/6">
								Feasibility
							</TableColumn>
							<TableColumn className="w-1/12">Due Date</TableColumn>
						</TableHeader>
						<TableBody>
							{filesWithoutFolder.map((file) => (
								<TableRow key={`desktop-${file.id}-uncat`}>
									<TableCell className="w-1/4">
										<DraggableFile file={file}>
											<div
												onClick={() => openFilePdf({ name: file.name })}
												className="truncate max-w-[200px] xl:max-w-none xl:whitespace-normal cursor-pointer"
											>
												{file.name}
												<span className="ml-2 text-xs text-gray-400">(Drag to move)</span>
											</div>
										</DraggableFile>
									</TableCell>
									<TableCell className="w-1/3">
										<div className="line-clamp-3 max-w-[300px] xl:max-w-none xl:line-clamp-3 2xl:line-clamp-none">
											{file.description}
										</div>
									</TableCell>
									<TableCell className="w-1/6">
										<Button
											size="sm"
											onPress={() => onFileSelect(file, "coverSheet")}
											className="text-xs px-2 py-1 xl:text-sm xl:px-3 xl:py-2"
										>
											Cover Sheet
										</Button>
									</TableCell>
									<TableCell className="w-1/6">
										<Button
											size="sm"
											variant="bordered"
											onPress={() =>
												onFileSelect(file, "complianceMatrix")
											}
											className="text-xs px-2 py-1 xl:text-sm xl:px-3 xl:py-2"
										>
											Compliance Matrix
										</Button>
									</TableCell>
									<TableCell className="w-1/6">
										<Button
											size="sm"
											variant="flat"
											color="secondary"
											onPress={() =>
												onFileSelect(file, "feasibilityCheck")
											}
											className="text-xs px-2 py-1 xl:text-sm xl:px-3 xl:py-2"
										>
											Feasibility Check
										</Button>
									</TableCell>
									<TableCell className="w-1/12">
										{file.dueDate
											? new Date(file.dueDate).toISOString().split('T')[0]
											: "No due date"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			);
		}
	};

	return (
		<div>
			<div className="space-y-4 md:hidden h-full overflow-y-auto">
				{uniqueFolders.map((folder, index) => (
					<DroppableFolder 
						key={`mobile-folder-${folder.id}-${index}`} 
						folder={folder} 
						onMoveFile={onMoveFile} 
						openFolders={openFolders} 
						openOrCloseFolder={openOrCloseFolder}
						index={index}
						onEditFolder={onEditFolder}
						onDeleteFolder={onDeleteFolder}
					>
						<div
							className={`transition-all duration-500 ease-in-out ${
								openFolders.includes(index)
									? "max-h-[2000px] opacity-100"
									: "max-h-0 opacity-0 overflow-hidden"
							}`}
						>
							<div className="space-y-4 pl-4">
								{files
									.filter((file: Document) => file.folderId === folder.id)
									.map((file: Document) => {
                    console.log({ folder,file })
                    return (
										<DraggableFile key={`file-${file.id}-${folder.id}`} file={file}>
											<div
												className="border rounded-lg p-3 space-y-3 bg-white shadow-sm"
											>
												<div className="flex justify-between items-start">
													<h3
														onClick={() => openFilePdf({ name: file.name })}
														className="font-medium text-sm text-gray-900 line-clamp-2 max-w-[200px] cursor-pointer"
													>
														{file.name}
													</h3>
													<Button
														isIconOnly
														variant="light"
														onPress={() =>
															setActiveFile(
																activeFile === file.id.toString()
																	? null
																	: file.id.toString()
															)
														}
														className="p-1"
													>
														<ChevronDownIcon
															className="w-5 h-5"
															isOpen={activeFile === file.id.toString()}
														/>
													</Button>
												</div>

												<p className="text-xs text-gray-500 line-clamp-3 max-w-[200px]">
													{file.description}
												</p>

												<p className="text-xs text-gray-500">
													{file.dueDate
														? new Date(file.dueDate).toISOString().split('T')[0]
														: "No due date"}
												</p>

												{activeFile === file.id.toString() && (
													<div className="space-y-2 pt-2 border-t">
														<Button
															size="sm"
															fullWidth
															onPress={() => onFileSelect(file, "coverSheet")}
															className="text-sm"
														>
															Generate Cover Sheet
														</Button>
														<Button
															size="sm"
															fullWidth
															variant="bordered"
															className="text-sm"
															onPress={() => onFileSelect(file, "complianceMatrix")}
														>
															Generate Compliance Matrix
														</Button>
														<Button
															size="sm"
															fullWidth
															variant="flat"
															color="secondary"
															className="text-sm"
															onPress={() => onFileSelect(file, "feasibilityCheck")}
														>
															Feasibility Check
														</Button>
													</div>
												)}
											</div>
										</DraggableFile>
									)})}
							</div>
						</div>
					</DroppableFolder>
				))}
				{renderFilesWithoutFolder(true)}
			</div>
			
			<div className="hidden md:block h-full overflow-y-auto">
				<div className="space-y-4 p-4">
					{uniqueFolders.map((folder, index) => (
						<DroppableFolder 
							key={`desktop-folder-${folder.id}-${index}`} 
							folder={folder} 
							onMoveFile={onMoveFile} 
							openFolders={openFolders} 
							openOrCloseFolder={openOrCloseFolder}
							index={index}
							onEditFolder={onEditFolder}
							onDeleteFolder={onDeleteFolder}
						>
							<div
								className={`transition-all duration-500 ease-in-out ${
									openFolders.includes(index)
										? "max-h-[2000px] opacity-100"
										: "max-h-0 opacity-0 overflow-hidden"
								}`}
							>
								<div className="mt-2">
									<Table aria-label="Table of Files">
										<TableHeader>
											<TableColumn className="w-1/4">Name</TableColumn>
											<TableColumn className="w-1/3">Summary</TableColumn>
											<TableColumn className="w-1/6">Cover Sheet</TableColumn>
											<TableColumn className="w-1/6">
												Compliance Matrix
											</TableColumn>
											<TableColumn className="w-1/6">
												Feasibility
											</TableColumn>
											<TableColumn className="w-1/12">Due Date</TableColumn>
										</TableHeader>
										<TableBody>
											{files
												.filter((file: Document) => file.folderId === folder.id)
												.map((file: Document) => (
													<TableRow key={file.id}>
														<TableCell className="w-1/4">
															<DraggableFile file={file}>
																<div
																	onClick={() => openFilePdf({ name: file.name })}
																	className="truncate max-w-[200px] xl:max-w-none xl:whitespace-normal cursor-pointer"
																>
																	{file.name}
																	<span className="ml-2 text-xs text-gray-400">(Drag to move)</span>
																</div>
															</DraggableFile>
														</TableCell>
														<TableCell className="w-1/3">
															<div className="line-clamp-3 max-w-[300px] xl:max-w-none xl:line-clamp-3 2xl:line-clamp-none">
																{file.description}
															</div>
														</TableCell>
														<TableCell className="w-1/6">
															<Button
																size="sm"
																onPress={() => onFileSelect(file, "coverSheet")}
																className="text-xs px-2 py-1 xl:text-sm xl:px-3 xl:py-2"
															>
																Cover Sheet
															</Button>
														</TableCell>
														<TableCell className="w-1/6">
															<Button
																size="sm"
																variant="bordered"
																onPress={() =>
																	onFileSelect(file, "complianceMatrix")
																}
																className="text-xs px-2 py-1 xl:text-sm xl:px-3 xl:py-2"
															>
																Compliance Matrix
															</Button>
														</TableCell>
														<TableCell className="w-1/6">
															<Button
																size="sm"
																variant="flat"
																color="secondary"
																onPress={() =>
																	onFileSelect(file, "feasibilityCheck")
																}
																className="text-xs px-2 py-1 xl:text-sm xl:px-3 xl:py-2"
															>
																Feasibility Check
															</Button>
														</TableCell>
														<TableCell className="w-1/12">
															{file.dueDate
																? new Date(file.dueDate).toISOString().split('T')[0]
																: "No due date"}
														</TableCell>
													</TableRow>
												))}
										</TableBody>
									</Table>
								</div>
							</div>
						</DroppableFolder>
					))}
					{renderFilesWithoutFolder()}
				</div>
			</div>
		</div>
	);
}
