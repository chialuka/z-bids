import { Input, Spinner } from "@heroui/react";
// import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { searchDocument } from "@/services/documentService";
import { getGreeting } from "@/utils/greetings";

interface SearchBarProps {
	documentContent: string;
}

export default function SearchBar({ documentContent }: SearchBarProps) {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
	const [searchResponse, setSearchResponse] = useState<string>("");
	const [greeting, setGreeting] = useState<string>("");

	useEffect(() => {
		setGreeting(getGreeting());
	}, []);

	const handleSearch = async () => {
		if (!searchTerm.trim()) return;

		setIsLoadingResponse(true);
		try {
			const response = await searchDocument(searchTerm, documentContent);
			setSearchResponse(response);
		} catch (error) {
			console.error("Error searching document:", error);
		} finally {
			setIsLoadingResponse(false);
		}
	};

	return (
		<div>
			{isLoadingResponse ? (
				<Spinner />
			) : searchResponse ? (
				<div
					className="pt-5 pb-10 mb-5 bg-gray-100 p-4 rounded-lg border border-gray-300"
					dangerouslySetInnerHTML={{ __html: searchResponse }}
				/>
			) : null}
			<p className="text-lg font-bold text-center">{greeting}</p>
			<div className="w-9/10 md:w-4/5 mx-auto">
				<Input
					placeholder="Ask Anything"
					value={searchTerm}
					name="searchTerm"
					onChange={(e) => setSearchTerm(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSearch()}
					className="py-10 w-full rounded-md"
				/>
			</div>
		</div>
	);
}
