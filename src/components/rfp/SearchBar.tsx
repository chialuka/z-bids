import { Input, Spinner } from "@heroui/react";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { searchDocument } from "@/services/documentService";

interface SearchBarProps {
  documentContent: string;
}

export default function SearchBar({ documentContent }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  const [searchResponse, setSearchResponse] = useState<string>("");

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
      <Input
        placeholder="Search File"
        value={searchTerm}
        name="searchTerm"
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        endContent={
          <SearchIcon
            onClick={handleSearch}
            className="h-6 w-6 text-gray-400 cursor-pointer"
          />
        }
        className="py-10"
      />
      
      {isLoadingResponse ? (
        <Spinner />
      ) : searchResponse ? (
        <div
          className="pt-5 pb-10 mb-5 bg-gray-100 p-4 rounded-lg border border-gray-300"
          dangerouslySetInnerHTML={{ __html: searchResponse }}
        />
      ) : null}
    </div>
  );
} 
