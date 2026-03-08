'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SharedDocument {
  id: string;
  title: string;
  author: string;
  description: string;
  shareId: string;
}

export default function SharedDocument({ params }: { params: { shareId: string } }) {
  const [document, setDocument] = useState<SharedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchSharedDocument();
  }, [params.shareId]);

  const fetchSharedDocument = async () => {
    try {
      const response = await fetch(`/api/join?shareId=${params.shareId}`);
      const result = await response.json();

      if (response.ok) {
        setDocument(result.document);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to fetch shared document');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDocument = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/shared/${params.shareId}`);
      return;
    }

    setJoining(true);
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareId: params.shareId,
          userId: user.uid,
          userEmail: user.email || '',
          userDisplayName: user.displayName || 'Anonymous User',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.alreadyJoined) {
          alert('You already have access to this document!');
        } else {
          alert('Successfully joined the document!');
        }
        // Redirect to the document
        router.push(`/doc/${result.documentId}`);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to join document');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This shared document link is not valid or has expired.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Collaborative Sheets</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Document Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>

            {/* Document Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h2>
            <p className="text-gray-600 mb-1">Created by {document.author}</p>
            <p className="text-sm text-gray-500 mb-8">{document.description}</p>

            {/* User Status */}
            {user ? (
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{user.displayName || 'Anonymous User'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">You need to sign in to access this shared document</p>
              </div>
            )}

            {/* Join Button */}
            <button
              onClick={handleJoinDocument}
              disabled={joining}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {joining ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12v8m0-2-4h4m4 4h4m4-4v6h4m2 4h4m2 4h4m0 2-4h4"></path>
                  </svg>
                  Joining...
                </span>
              ) : user ? (
                'Join Document'
              ) : (
                'Sign In to Join'
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              By joining, you'll get access to view and edit this document
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
