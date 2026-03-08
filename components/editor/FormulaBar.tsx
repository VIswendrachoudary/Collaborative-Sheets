interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  selectedCell: string | null;
  onApplyFormatting: (formatType: 'bold' | 'italic' | 'strikethrough' | 'underline') => void;
  onClearFormatting: () => void;
  onInsertFunction: () => void;
}

import React, { useState, useEffect, useRef } from 'react';

export const FormulaBar: React.FC<FormulaBarProps> = ({
  value,
  onChange,
  onEnter,
  selectedCell,
  onApplyFormatting,
  onClearFormatting,
  onInsertFunction,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    }
  };

  const handleInsertFunction = () => {
    // Placeholder for future function insertion logic
    console.log('Insert Function clicked');
    // Example: onChange(value + '=SUM()');
  };

  return (
    <div className="flex items-center border-b border-gray-200 p-2 bg-white">
      <div className="flex items-center px-4 py-2 bg-gray-100 rounded-l-lg border border-gray-300 min-w-[80px]">
        <span className="text-sm font-semibold text-gray-900">
          {selectedCell}
        </span>
      </div>
      <div className="flex-1 flex items-center bg-white border border-l-0 border-gray-300 rounded-r-lg">
        <div className="px-4 py-2 text-gray-500 border-r border-gray-300 bg-gray-50">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter value or formula"
          className="flex-1 px-4 py-2 outline-none text-sm font-mono font-bold text-black placeholder-gray-400"
          ref={inputRef}
        />
        {value && value.startsWith('=') && (
          <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mr-2">
            Formula
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="flex items-center space-x-2 ml-4">
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Insert Function"
          onClick={handleInsertFunction}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M15 11h.01M12 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Clear Cell"
          onClick={onClearFormatting}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Bold"
          onClick={() => onApplyFormatting('bold')}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Italic"
          onClick={() => onApplyFormatting('italic')}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 4L8 20M6 20h4" />
          </svg>
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Strikethrough"
          onClick={() => onApplyFormatting('strikethrough')}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 17h10M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FormulaBar;
