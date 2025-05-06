import { NextResponse } from 'next/server';
import { fetchAllDocuments, processNewFiles } from '@/server/modules/documentService';
import { listAllUploadThingFiles } from '@/server/modules/uploadThing';
import { File as UploadThingFile } from '@/types';

// This API processes a single file at a time to avoid Vercel's 60-second timeout
export async function GET() {
  try {
    // Get existing docs and all upload thing files
    const [existingDocuments, files] = await Promise.all([
      fetchAllDocuments(),
      listAllUploadThingFiles() as Promise<UploadThingFile[]>
    ]);

    // Find files not in database
    const filesNotInDatabase = files.filter(
      (file) => !existingDocuments?.some((doc) => doc.name === file.name)
    );

    console.log({ filesNotInDatabase });
    // If no files to process, return success
    if (!filesNotInDatabase.length) {
      return NextResponse.json({ 
        success: true, 
        processedFile: null,
        remainingFiles: 0,
        message: "No files need processing" 
      });
    }

    // Process just the first unprocessed file to avoid timeout
    const fileToProcess = filesNotInDatabase[0];
    
    // Process single file and return status
    await processNewFiles([fileToProcess]);
    
    return NextResponse.json({ 
      success: true, 
      processedFile: fileToProcess.name,
      remainingFiles: filesNotInDatabase.length - 1,
      message: `Processed file ${fileToProcess.name}. ${filesNotInDatabase.length - 1} files remaining.`
    });
  } catch (error) {
    console.error('Error processing files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process files' },
      { status: 500 }
    );
  }
} 
