'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Notifications from '@/components/Notifications';

interface Document {
  id: string;
  title: string;
  author: string;
  lastModified: Date;
  createdAt: Date;
  grid: any;
  userId: string;
}

function formatTimeAgo(date: Date | any): string {
  const now = new Date();
  
  // Handle different date types (Firebase timestamp, string, etc.)
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Unknown time';
  }
  
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    return `${diffDays} days ago`;
  }
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'shared' | 'archived'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'viewer' | 'editor'>('viewer');
  const [shareLink, setShareLink] = useState('');
  const [linkPermission, setLinkPermission] = useState<'viewer' | 'editor'>('viewer');
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [debugMode, setDebugMode] = useState(true); // Always start in debug mode
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Fetch documents from Firestore API (always shows user docs + orphaned docs)
    const fetchDocuments = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/spreadsheets?userId=${user.uid}`);
        if (response.ok) {
          const docs = await response.json();
          console.log('Dashboard received documents:', docs);
          setDocuments(docs);
        } else {
          console.error('API response not ok:', response.status);
          setDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        // Set empty array if Firebase fails
        setDocuments([]);
      }
    };

    fetchDocuments();
  }, [user]);

  useEffect(() => {
    // Close profile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  const createNewSpreadsheet = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/spreadsheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Spreadsheet',
          author: user.displayName || 'Anonymous User',
          userId: user.uid,
        }),
      });
      
      if (response.ok) {
        const newDoc = await response.json();
        console.log('New document created:', newDoc);
        // Add the new document to the local state
        setDocuments(prev => [newDoc, ...prev]);
        // Navigate to the new spreadsheet
        router.push(`/doc/${newDoc.id}`);
      } else {
        console.error('Failed to create spreadsheet');
      }
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const refreshDocuments = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/spreadsheets?userId=${user.uid}`);
      if (response.ok) {
        const docs = await response.json();
        console.log('Refreshed documents:', docs);
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error refreshing documents:', error);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocumentName.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/spreadsheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newDocumentName.trim(),
          userId: user?.uid,
        }),
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setNewDocumentName('');
        setShowCreateDialog(false);
        router.push(`/doc/${newDoc.id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleShare = async (docId: string, docTitle: string) => {
    console.log('Share button clicked for:', docId, docTitle);
    
    // Find the document
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setSelectedDoc(doc);
    setShowShareDialog(true);
    
    // Generate share link
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: docId,
          generateLink: true,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setShareLink(result.shareLink);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
    }

    // Load shared users for this document
    // This would come from your API in a real implementation
    setSharedUsers([]);
  };

  const handleEmailShare = async () => {
    if (!selectedDoc || !shareEmail) return;

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          emailToShare: shareEmail,
          permission: sharePermission,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`${selectedDoc.title} has been shared with ${shareEmail} as ${sharePermission}`);
        setShareEmail('');
        // Refresh shared users list
        setSharedUsers([...sharedUsers, {
          email: shareEmail,
          permission: sharePermission,
          displayName: shareEmail
        }]);
      } else {
        alert(`Failed to share: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document. Please try again.');
    }
  };

  const copyShareLink = async () => {
    if (shareLink && navigator.clipboard) {
      await navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'owned':
        return doc.author === (user?.displayName || 'Anonymous User');
      case 'shared':
        return doc.author !== (user?.displayName || 'Anonymous User');
      case 'archived':
        return false; // No archived docs in current implementation
      default:
        return true;
    }
  });

  // Group documents by author
  const documentsByAuthor = filteredDocuments.reduce((acc, doc) => {
    const author = doc.author || 'Unknown Author';
    if (!acc[author]) {
      acc[author] = [];
    }
    acc[author].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="min-h-screen bg-gray-50 grid grid-rows-[auto_1fr_auto] backdrop-blur-sm">
      {/* Header - Updated for deployment */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-black">
                  Collaborative Sheets
                </h1>
              </div>
              
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <Notifications userId={user?.uid} />
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-xl mx-2 my-1 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-xl mx-2 my-1 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black">Your Workspace</h2>
                <p className="text-black mt-1">Create and manage your spreadsheets</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={refreshDocuments}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Refresh
                </button>
                <button
                  onClick={createNewSpreadsheet}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12v8m0-2-4h4m4 4h4m4-4v6h4m2 4h4m2 4h4m0 2-4h4"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>New Spreadsheet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'all', label: 'All Documents' },
                  { key: 'owned', label: 'Owned by me' },
                  { key: 'shared', label: 'Shared with me' },
                  { key: 'archived', label: 'Archived' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Document Grid */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-black mb-2">No spreadsheets yet</h3>
                <p className="text-black mb-6">Get started by creating your first spreadsheet</p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12v8m0-2-4h4m4 4h4m4-4v6h4m2 4h4m2 4h4m0 2-4h4"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Your First Spreadsheet</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(documentsByAuthor).map(([author, authorDocs]) => (
                  <div key={author}>
                    {/* Author Header */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm mr-3">
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">{author}</h3>
                        <p className="text-sm text-black">{authorDocs.length} spreadsheet{authorDocs.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    {/* Documents Grid for this Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {authorDocs.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/doc/${doc.id}`}
                          className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 hover:-translate-y-1"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                              </svg>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleShare(doc.id, doc.title);
                                }}
                                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                title="Share document"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m9.032 4.026A9.001 9.001 0 012.968 7.326" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-blue-600 transition-colors">
                            {doc.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-black">
                            <span>{doc.author}</span>
                            <span>{formatTimeAgo(doc.lastModified)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-black">
                Showing <span className="font-medium">{filteredDocuments.length}</span> of{' '}
                <span className="font-medium">{documents.length}</span> documents
              </div>
      
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-black">
              © 2023 Collaborative Sheets. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-black">
              <a href="#" className="hover:text-gray-700">Help Center</a>
              <a href="#" className="hover:text-gray-700">Terms</a>
              <a href="#" className="hover:text-gray-700">Privacy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Google Sheets-style Share Dialog */}
      {showShareDialog && selectedDoc && (
        <div className="fixed inset-0   flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Share "{selectedDoc.title}"</h2>
              <button
                onClick={() => setShowShareDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Share via Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add people and groups
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email addresses"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value as 'viewer' | 'editor')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={handleEmailShare}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Shared Users List */}
              {sharedUsers.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">People with access</label>
                    <span className="text-xs text-gray-500">{sharedUsers.length + 1} people</span>
                  </div>
                  <div className="space-y-2">
                    {/* Owner */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user?.displayName?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.displayName || 'You'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Owner</span>
                    </div>
                    
                    {/* Shared Users */}
                    {sharedUsers.map((sharedUser, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {sharedUser.displayName?.charAt(0).toUpperCase() || sharedUser.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sharedUser.displayName || sharedUser.email}</p>
                            <p className="text-xs text-gray-500">{sharedUser.email}</p>
                          </div>
                        </div>
                        <select
                          value={sharedUser.permission}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Link Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">General access</label>
                  <select
                    value={linkPermission}
                    onChange={(e) => setLinkPermission(e.target.value as 'viewer' | 'editor')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    placeholder="Generating link..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Copy link
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Anyone with the link can {linkPermission} this document
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Spreadsheet Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-sm mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Create Spreadsheet
            </h2>
            <input
              className="w-full p-2 bg-slate-700 rounded mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Document name"
              value={newDocumentName}
              onChange={(e) => setNewDocumentName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateDocument();
                }
              }}
            />
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewDocumentName('');
                }}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateDocument}
                disabled={!newDocumentName.trim() || isCreating}
                className="flex-1 bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
