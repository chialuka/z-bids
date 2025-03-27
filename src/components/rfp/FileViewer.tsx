import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import SearchBar from "./SearchBar";
import DocumentEditor from "./DocumentEditor";

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  documentId: string;
  documentContent: string;
  onSaveDocument: (id: string, name: string, content: string) => Promise<void>;
}

export default function FileViewer({
  isOpen,
  onClose,
  fileName,
  documentId,
  documentContent,
  onSaveDocument,
}: FileViewerProps) {
  return (
    <Modal
      isOpen={isOpen}
      size="full"
      onClose={onClose}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="text-2xl font-bold text-center">
          {fileName}
        </ModalHeader>
        <ModalBody>
          <div className="p-10">
            <SearchBar documentContent={documentContent} />
            
            <DocumentEditor
              documentId={documentId}
              initialContent={documentContent}
              documentName={fileName}
              onSave={onSaveDocument}
            />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 
