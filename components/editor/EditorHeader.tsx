interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export default function EditorHeader({ title, onTitleChange }: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Dashboard"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
          placeholder="Untitled Spreadsheet"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Share Button */}
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span className="text-sm font-medium">Share</span>
        </button>
        
        {/* Presence Avatars */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium shadow-sm">
              A
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium shadow-sm">
              S
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium shadow-sm">
              J
            </div>
          </div>
          <span className="text-sm text-gray-600">+3</span>
        </div>
        
        {/* User Menu */}
        <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
            U
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
