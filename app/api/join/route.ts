import { NextRequest, NextResponse } from 'next/server';
import { doc, collection, getDoc, updateDoc, setDoc, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { shareId, userId, userEmail, userDisplayName } = await request.json();

    if (!shareId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Share ID, user ID, and email are required' },
        { status: 400 }
      );
    }

    // Find the document with this share ID
    const documentsRef = collection(db, 'documents');
    const q = query(documentsRef, where('shareId', '==', shareId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Shared document not found or link expired' },
        { status: 404 }
      );
    }

    const document = querySnapshot.docs[0];
    const docData = document.data();
    const documentId = document.id;

    // Check if user is already in shared users
    const sharedUsers = docData.sharedUsers || [];
    const alreadyShared = sharedUsers.some((user: any) => user.userId === userId);

    if (alreadyShared) {
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        documentId: documentId,
        message: 'You already have access to this document'
      });
    }

    // Add user to shared users
    const userToAdd = {
      userId: userId,
      email: userEmail,
      displayName: userDisplayName || 'Anonymous User',
      joinedAt: new Date(),
    };

    await updateDoc(doc(db, 'documents', documentId), {
      sharedUsers: arrayUnion(userToAdd),
      lastModified: new Date(),
    });

    // Create notification for document owner
    const notification = {
      id: Math.random().toString(36).substring(2, 15),
      type: 'user_joined',
      documentId: documentId,
      documentTitle: docData.title,
      message: `${userDisplayName || userEmail} joined your shared document "${docData.title}"`,
      userId: docData.userId, // Document owner
      fromUser: {
        userId: userId,
        email: userEmail,
        displayName: userDisplayName || 'Anonymous User'
      },
      createdAt: new Date(),
      read: false
    };

    // Save notification to a notifications collection
    const notificationRef = doc(collection(db, 'notifications'), notification.id);
    await setDoc(notificationRef, notification);

    console.log(`User ${userEmail} joined document ${documentId}`);

    return NextResponse.json({
      success: true,
      documentId: documentId,
      message: 'Successfully joined shared document',
      document: {
        id: documentId,
        title: docData.title,
        author: docData.author,
        grid: docData.grid || {}
      }
    });

  } catch (error) {
    console.error('Error joining shared document:', error);
    return NextResponse.json(
      { error: 'Failed to join shared document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    // Find the document with this share ID
    const documentsRef = collection(db, 'documents');
    const q = query(documentsRef, where('shareId', '==', shareId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Shared document not found or link expired' },
        { status: 404 }
      );
    }

    const document = querySnapshot.docs[0];
    const docData = document.data();

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: docData.title,
        author: docData.author,
        description: docData.description || 'No description available',
        shareId: docData.shareId
      }
    });

  } catch (error) {
    console.error('Error fetching shared document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
