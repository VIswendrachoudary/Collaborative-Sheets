'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Document, Grid as GridType, SaveStatus, Presence } from '@/types/spreadsheet';
import GridComponent from '@/components/grid/Grid';
import EditorHeader from '@/components/editor/EditorHeader';
import FormulaBar from '@/components/editor/FormulaBar';
import SaveIndicator from '@/components/editor/SaveIndicator';
import PresenceBar from '@/components/presence/PresenceBar';
import { useDocument } from '@/hooks/useDocument';
import { usePresence } from '@/hooks/usePresence';
import { exportToCSV, exportToJSON, downloadFile } from '@/lib/exportUtils';
import { evaluateFormula, recalculateGrid, isFormula } from '@/lib/formulaEngine';

// Mock user data - in real app, this would come from auth
const currentUser = {
  uid: 'user123',
  displayName: 'Current User',
  email: 'user@example.com',
};

export default function DocumentPage() {
  const params = useParams();
  const documentId = params.id as string;

  const { document, loading, error, updateDocument, updateGrid } = useDocument(documentId);
  const { presence = [], updateCursor } = usePresence(documentId, currentUser.uid, currentUser.displayName);

  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaValue, setFormulaValue] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'saved' });

  useEffect(() => {
    // Update formula bar when selected cell changes
    if (document) {
      const cell = document.grid[selectedCell];
      if (cell) {
        setFormulaValue(cell.value || '');
      } else {
        setFormulaValue('');
      }
    }
  }, [selectedCell, document]);

  const handleTitleChange = async (newTitle: string) => {
    setSaveStatus({ status: 'saving' });
    await updateDocument({ title: newTitle });
    setSaveStatus({ status: 'saved', lastSaved: new Date() });
  };

  const handleCellUpdate = async (cellId: string, value: string) => {
    setSaveStatus({ status: 'saving' });
    
    if (document) {
      const updatedGrid = {
        ...document.grid,
        [cellId]: { value },
      };

      // Recalculate all formulas if this was a value change
      const recalculatedGrid = recalculateGrid(updatedGrid);
      
      await updateGrid(recalculatedGrid);
    }
    
    setSaveStatus({ status: 'saved', lastSaved: new Date() });
    updateCursor(cellId);
  };

  const handleFormulaChange = (value: string) => {
    setFormulaValue(value);
  };

  const handleFormulaCommit = () => {
    handleCellUpdate(selectedCell, formulaValue);
  };

  const handleCellSelect = (cellId: string) => {
    setSelectedCell(cellId);
    updateCursor(cellId);
  };

  const handleFormatAction = (action: string) => {
    if (!document) return;
    
    const currentCell = document.grid[selectedCell];
    if (!currentCell) return;
    
    let newValue = currentCell.value;
    
    switch (action) {
      case 'bold':
        // For now, we'll just add a visual indicator
        newValue = `**${newValue}**`;
        break;
      case 'italic':
        newValue = `*${newValue}*`;
        break;
      case 'strikethrough':
        newValue = `~~${newValue}~~`;
        break;
      case 'clear':
        newValue = '';
        break;
      default:
        break;
    }
    
    handleCellUpdate(selectedCell, newValue);
  };

  const handleExportCSV = () => {
    if (document) {
      const csv = exportToCSV(document.grid);
      const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
      downloadFile(csv, filename, 'text/csv');
    }
  };

  const handleExportJSON = () => {
    if (document) {
      const json = exportToJSON(document.grid);
      const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      downloadFile(json, filename, 'application/json');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading document</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <EditorHeader
        title={document.title}
        onTitleChange={handleTitleChange}
      />

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <button className="p-2 hover:bg-gray-100 rounded" title="Undo">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Redo">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <button 
              className="p-2 hover:bg-gray-100 rounded" 
              title="Bold"
              onClick={() => handleFormatAction('bold')}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded" 
              title="Italic"
              onClick={() => handleFormatAction('italic')}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 4L8 20M6 20h4" />
              </svg>
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded" 
              title="Strikethrough"
              onClick={() => handleFormatAction('strikethrough')}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 17h10M5 12h14" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <button className="p-2 hover:bg-gray-100 rounded" title="Align Left">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Align Center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Align Right">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded" title="Borders">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M6 6v12M18 6v12" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Fill Color">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded" title="Functions">
              <span className="text-sm font-medium text-gray-600">fx</span>
            </button>
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 rounded flex items-center space-x-1" title="Export">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export as CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export as JSON</span>
                </button>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded" title="Share">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <SaveIndicator status={saveStatus} />
          </div>
        </div>
      </div>

      {/* Formula Bar */}
      <FormulaBar
        selectedCell={selectedCell}
        value={formulaValue}
        onChange={handleFormulaChange}
        onEnter={handleFormulaCommit}
        onApplyFormatting={handleFormatAction}
        onClearFormatting={() => handleFormatAction('clear')}
        onInsertFunction={() => console.log('Insert Function')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-white">
        <GridComponent
          grid={document.grid}
          onUpdate={handleCellUpdate}
          onSelect={handleCellSelect}
          rows={50}
          cols={26}
        />
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-t border-gray-300">
        <PresenceBar users={presence} />
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Ready</span>
          <span>•</span>
          <span>Cells: {Object.keys(document.grid).length}</span>
          <span>•</span>
          <span>Selected: {selectedCell}</span>
        </div>
      </div>
    </div>
  );
}
