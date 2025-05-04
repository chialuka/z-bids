import { NextResponse } from 'next/server';
import { processNewFiles } from '@/server/modules/documentService';

export async function GET() {
  try {
    const result = await processNewFiles();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process files' },
      { status: 500 }
    );
  }
} 
