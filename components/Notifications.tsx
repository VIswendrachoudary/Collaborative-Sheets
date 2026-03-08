'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

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

export default function Notifications({ userId }: { userId: string | undefined }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  // Auto-hide notifications after 10 seconds
  useEffect(() => {
    if (notifications.length > 0 && unreadCount > 0) {
      const timer = setTimeout(() => {
        setShowNotifications(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notifications, unreadCount]);

  const formatTimeAgo = (date: any) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const notificationDate = date.toDate ? date.toDate() : new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (!userId) return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {notification.fromUser.displayName?.charAt(0).toUpperCase() || 
                       notification.fromUser.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Popup Notification for New Joins */}
      {unreadCount > 0 && notifications.filter(n => !n.read && n.type === 'user_joined').length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Someone joined your document!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {notifications.find(n => !n.read && n.type === 'user_joined')?.message}
              </p>
            </div>
            <button
              onClick={() => setShowNotifications(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View
            </button>
          </div>
        </div>
      )}
    </>
  );
}
