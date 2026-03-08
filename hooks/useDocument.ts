'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Document, Grid } from '@/types/spreadsheet';

export function useDocument(documentId: string) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const docRef = doc(db, 'documents', documentId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setDocument({
            id: docSnapshot.id,
            title: data.title || 'Untitled',
            author: data.author || 'Anonymous',
            lastModified: data.lastModified?.toDate() || new Date(),
            grid: data.grid || {},
          });
        } else {
          // Create new document if it doesn't exist
          const newDoc: Omit<Document, 'id'> = {
            title: 'Untitled Spreadsheet',
            author: 'Anonymous',
            lastModified: new Date(),
            grid: {},
          };
          setDoc(docRef, {
            ...newDoc,
            lastModified: new Date(),
          }).then(() => {
            setDocument({
              id: documentId,
              ...newDoc,
            });
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching document:', err);
        setError('Failed to load document');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [documentId]);

  const updateDocument = async (updates: Partial<Document>) => {
    if (!documentId) return;

    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        ...updates,
        lastModified: new Date(),
      });
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document');
    }
  };

  const updateGrid = async (grid: Grid) => {
    await updateDocument({ grid });
  };

  return {
    document,
    loading,
    error,
    updateDocument,
    updateGrid,
  };
}
