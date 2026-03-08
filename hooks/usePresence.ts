'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Presence } from '@/types/spreadsheet';

const PRESENCE_COLORS = [
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
];

export function usePresence(documentId: string, userId: string, userName: string) {
  const [presence, setPresence] = useState<Presence[]>([]);
  const [userColor] = useState(() => PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)]);

  useEffect(() => {
    if (!documentId || !userId) return;

    const presenceRef = doc(db, 'presence', documentId);
    
    // Set up heartbeat to keep user alive
    const heartbeat = setInterval(async () => {
      try {
        await updateDoc(presenceRef, {
          [userId]: {
            name: userName,
            color: userColor,
            lastSeen: serverTimestamp(),
          },
        });
      } catch (err: any) {
        // If document doesn't exist, create it
        if (err.code === 'not-found') {
          try {
            await setDoc(presenceRef, {
              [userId]: {
                name: userName,
                color: userColor,
                lastSeen: serverTimestamp(),
              },
            });
          } catch (createErr) {
            console.error('Error creating presence document:', createErr);
          }
        } else {
          console.error('Error updating presence:', err);
        }
      }
    }, 10000); // Update every 10 seconds

    // Initial presence update - try to create or update
    const initializePresence = async () => {
      try {
        await updateDoc(presenceRef, {
          [userId]: {
            name: userName,
            color: userColor,
            lastSeen: serverTimestamp(),
          },
        });
      } catch (err: any) {
        // If document doesn't exist, create it
        if (err.code === 'not-found') {
          try {
            await setDoc(presenceRef, {
              [userId]: {
                name: userName,
                color: userColor,
                lastSeen: serverTimestamp(),
              },
            });
          } catch (createErr) {
            console.error('Error creating presence document:', createErr);
          }
        } else {
          console.error('Error initializing presence:', err);
        }
      }
    };

    initializePresence();

    // Listen to presence updates
    const unsubscribe = onSnapshot(
      presenceRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const now = new Date();
          const activeUsers: Presence[] = [];

          Object.entries(data).forEach(([uid, userData]: [string, any]) => {
            const lastSeen = userData.lastSeen?.toDate() || new Date();
            // Remove users who haven't been seen in the last 30 seconds
            if (now.getTime() - lastSeen.getTime() < 30000) {
              activeUsers.push({
                userId: uid,
                name: userData.name,
                color: userData.color,
                lastSeen,
              });
            }
          });

          setPresence(activeUsers);
        }
      },
      (err) => {
        console.error('Error listening to presence:', err);
      }
    );

    return () => {
      clearInterval(heartbeat);
      unsubscribe();
      
      // Remove user from presence when they leave
      updateDoc(presenceRef, {
        [userId]: null,
      }).catch(() => {
        // Ignore errors during cleanup
      });
    };
  }, [documentId, userId, userName, userColor]);

  const updateCursor = async (cellId: string) => {
    if (!documentId || !userId) return;

    try {
      const presenceRef = doc(db, 'presence', documentId);
      await updateDoc(presenceRef, {
        [userId]: {
          cursor: { cellId },
          lastSeen: serverTimestamp(),
        },
      });
    } catch (err: any) {
      // If document doesn't exist, create it with cursor info
      if (err.code === 'not-found') {
        try {
          const presenceRef = doc(db, 'presence', documentId);
          await setDoc(presenceRef, {
            [userId]: {
              name: userName,
              color: userColor,
              cursor: { cellId },
              lastSeen: serverTimestamp(),
            },
          });
        } catch (createErr) {
          console.error('Error creating presence document for cursor:', createErr);
        }
      } else {
        console.error('Error updating cursor:', err);
      }
    }
  };

  return {
    presence,
    updateCursor,
    userColor,
  };
}
