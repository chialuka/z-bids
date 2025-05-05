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
import { Document, Folder, File as UploadThingFile } from "@/types";
import { useEffect, useState } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { OpenFolderIcon } from "../icons/OpenFolderIcon";
import { ClosedFolderIcon } from "../icons/ClosedFolderIcon";

interface FileListProps {
	files: Document[];
	folders: Folder[];
	isLoading: boolean;
	onFileSelect: (
		file: Document,
		contentType: "coverSheet" | "pdfContent" | "complianceMatrix" | "feasibilityCheck"
	) => void;
}

export default function FileList({
	files,
	folders,
	isLoading,
	onFileSelect,
}: FileListProps) {
	const [activeFile, setActiveFile] = useState<string | null>(null);
	const [openFolders, setOpenFolders] = useState<number[]>([]);
	const [uploadThingFiles, setUploadThingFiles] = useState<UploadThingFile[]>(
		[]
	);
	console.log({ uploadThingFiles });
	useEffect(() => {
		const fetchUploadThingFiles = async () => {
			const response = await fetch("/api/uploadThing");
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

	// Mobile view
	const renderMobileView = () =>
		folders.map((folder, index) => (
			<div className="space-y-4 md:hidden h-full overflow-y-auto" key={index}>
				<div
					onClick={() => openOrCloseFolder(index)}
					className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 rounded-md transition-colors touch-manipulation"
				>
					{openFolders.includes(index) ? (
						<OpenFolderIcon className="text-blue-500 transition-transform duration-5000 w-6 h-6" />
					) : (
						<ClosedFolderIcon className="text-blue-500 transition-transform duration-5000 w-6 h-6" />
					)}
					<p className="font-medium text-gray-700 text-base">{folder.name}</p>
				</div>
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
							.map((file: Document) => (
								<div
									key={file.id}
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
											? new Date(file.dueDate).toLocaleDateString()
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
							))}
					</div>
				</div>
			</div>
		));

	// Desktop view
	const renderDesktopView = () => (
		<div className="hidden md:block h-full overflow-y-auto">
			<div className="space-y-4 p-4">
				{folders.map((folder, index) => (
					<div className="pl-2" key={index}>
						<div
							onClick={() => openOrCloseFolder(index)}
							className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 sm:p-2 rounded-md transition-colors touch-manipulation"
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
														<div
															onClick={() => openFilePdf({ name: file.name })}
															className="truncate max-w-[200px] xl:max-w-none xl:whitespace-normal cursor-pointer"
														>
															{file.name}
														</div>
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
															? new Date(file.dueDate).toLocaleDateString()
															: "No due date"}
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</div>
						</div>
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
