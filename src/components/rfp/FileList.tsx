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
import { File } from "@/types";
import { useState } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";

interface FileListProps {
	files: File[];
	isLoading: boolean;
	onFileSelect: (file: File) => void;
}

export default function FileList({
	files,
	isLoading,
	onFileSelect,
}: FileListProps) {
	const [activeFile, setActiveFile] = useState<string | null>(null);

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
	const renderMobileView = () => (
		<div className="space-y-4 sm:hidden">
			{files.map((file: File) => (
				<div 
					key={file.id} 
					className="border rounded-lg p-3 space-y-3 bg-white shadow-sm"
				>
					<div className="flex justify-between items-start">
						<h3 className="font-medium text-sm text-gray-900">{file.name}</h3>
						<Button
							isIconOnly
							variant="light"
							onPress={() => setActiveFile(activeFile === file.id ? null : file.id)}
							className="p-1"
						>
							<ChevronDownIcon 
								className="w-5 h-5" 
								isOpen={activeFile === file.id}
							/>
						</Button>
					</div>
					
					<p className="text-xs text-gray-500">
						Created: {new Date(file.uploadedAt).toLocaleDateString()}
					</p>

					{activeFile === file.id && (
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
	);

	// Desktop view
	const renderDesktopView = () => (
		<div className="hidden sm:block">
			<Table aria-label="Table of Files">
				<TableHeader>
					<TableColumn>Name</TableColumn>
					<TableColumn>Cover Sheet</TableColumn>
					<TableColumn>Compliance Matrix</TableColumn>
					<TableColumn>Date Created</TableColumn>
				</TableHeader>
				<TableBody>
					{files.map((file: File) => (
						<TableRow key={file.id}>
							<TableCell>{file.name}</TableCell>
							<TableCell>
								<Button 
									size="sm"
									onPress={() => onFileSelect(file)}
								>
									Generate Cover Sheet
								</Button>
							</TableCell>
							<TableCell>
								<Button 
									size="sm"
									variant="bordered"
								>
									Generate Compliance Matrix
								</Button>
							</TableCell>
							<TableCell>
								{new Date(file.uploadedAt).toLocaleDateString()}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);

	return (
		<div>
			{renderMobileView()}
			{renderDesktopView()}
		</div>
	);
}
