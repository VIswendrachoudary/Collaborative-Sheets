import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { title, author, userId } = await request.json();

    if (!title || !author || !userId) {
      return NextResponse.json(
        { error: 'Title, author, and userId are required' },
        { status: 400 }
      );
    }

    // Create a new document in Firestore
    const docRef = doc(collection(db, 'documents'));
    const newDoc = {
      title,
      author,
      userId,
      lastModified: serverTimestamp(),
      grid: {},
      createdAt: serverTimestamp(),
    };

    await setDoc(docRef, newDoc);

    // Return the document with the same structure as stored in Firestore
    return NextResponse.json({
      id: docRef.id,
      title,
      author,
      userId,
      lastModified: new Date(), // Temporary, will be updated by Firestore
      grid: {},
      createdAt: new Date(), // Temporary, will be updated by Firestore
    });
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to create spreadsheet' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get the current user from the session/token
    const authHeader = request.headers.get('authorization');
    
    // For now, we'll get the user ID from the query parameter
    // In production, you should verify the Firebase auth token
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    // Always use debug mode logic: show user's documents + orphaned docs
    console.log('Fetching user documents + orphaned docs (default behavior)');
    const documentsRef = collection(db, 'documents');
    
    // Query for all documents
    const q = query(documentsRef, orderBy('lastModified', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Handle Firebase timestamps properly
      let lastModified = new Date();
      let createdAt = new Date();
      
      if (data.lastModified) {
        lastModified = data.lastModified.toDate ? data.lastModified.toDate() : new Date(data.lastModified);
      }
      
      if (data.createdAt) {
        createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      }
      
      return {
        id: doc.id,
        title: data.title || 'Untitled Spreadsheet',
        author: data.author || 'Unknown Author',
        lastModified,
        createdAt,
        grid: data.grid || {},
        userId: data.userId || 'NO_USER_ID',
      };
    });

    // Filter: show user's documents + documents without userId (potential orphaned docs)
    const filteredDocs = documents.filter(doc => 
      doc.userId === userId || 
      doc.userId === 'NO_USER_ID'
    );

    console.log(`Found ${documents.length} total documents, ${filteredDocs.length} for user ${userId} (user docs + orphaned)`);
    filteredDocs.forEach(doc => {
      console.log(`Doc "${doc.title}" by ${doc.author}, userId: ${doc.userId}`);
    });
    
    return NextResponse.json(filteredDocs);
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    // Return empty array if Firebase fails
    return NextResponse.json([]);
  }
}
