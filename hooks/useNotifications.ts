import { useEffect, useState } from 'react';
import { doc, onSnapshot, query, collection, where, orderBy, limit, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Notification {
  id: string;
  type: 'user_joined' | 'document_shared' | 'other';
  documentId: string;
  documentTitle: string;
  message: string;
  fromUser: {
    userId: string;
    email: string;
    displayName: string;
  };
  createdAt: any;
  read: boolean;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Use a simpler query without compound index for now
    // We'll sort on the client side instead
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      limit(50)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));

      // Sort on client side by createdAt (newest first)
      newNotifications.sort((a, b) => {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setNotifications(newNotifications);
      
      // Calculate unread count
      const unread = newNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);

      // Auto-mark notifications as read after 5 seconds
      newNotifications.forEach(async (notification) => {
        if (!notification.read) {
          setTimeout(async () => {
            try {
              await updateDoc(doc(db, 'notifications', notification.id), {
                read: true
              });
            } catch (error) {
              console.error('Error marking notification as read:', error);
            }
          }, 5000);
        }
      });
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification =>
          updateDoc(doc(db, 'notifications', notification.id), {
            read: true
          })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
