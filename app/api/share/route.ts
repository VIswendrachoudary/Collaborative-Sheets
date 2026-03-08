import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { documentId, generateLink = false } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the document to check if it exists
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const docData = docSnap.data();

    if (generateLink) {
      // Generate or get existing share link
      const shareId = docData.shareId || generateShareId();
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com';
      const shareLink = `${baseUrl}/shared/${shareId}`;

      // Update document with share ID if it doesn't exist
      if (!docData.shareId) {
        await updateDoc(docRef, {
          shareId: shareId,
          shareLinkGenerated: true,
          shareLinkGeneratedAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        shareLink: shareLink,
        shareId: shareId,
        message: 'Share link generated successfully'
      });
    }

    return NextResponse.json({
      error: 'Invalid request. Use generateLink: true to create share link.'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in share API:', error);
    return NextResponse.json(
      { error: 'Failed to process share request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateShareId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
