'use client';

import { useState, useRef, useEffect } from 'react';
import { Cell as CellType } from '@/types/spreadsheet';
import { evaluateFormula } from '@/lib/formulaEngine';

interface CellProps {
  cellId: string;
  cell: CellType | undefined;
  isSelected: boolean;
  isEditing: boolean;
  grid: { [cellId: string]: CellType };
  onSelect: (cellId: string) => void;
  onStartEdit: (cellId: string) => void;
  onUpdate: (cellId: string, value: string) => void;
  onStopEdit: () => void;
}

export default function Cell({
  cellId,
  cell,
  isSelected,
  isEditing,
  grid,
  onSelect,
  onStartEdit,
  onUpdate,
  onStopEdit,
}: CellProps) {
  const [editValue, setEditValue] = useState(cell?.value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    onSelect(cellId);
  };

  const handleDoubleClick = () => {
    onStartEdit(cellId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onUpdate(cellId, editValue);
      onStopEdit();
    } else if (e.key === 'Escape') {
      setEditValue(cell?.value || '');
      onStopEdit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = () => {
    onUpdate(cellId, editValue);
    onStopEdit();
  };

  const getDisplayValue = () => {
    if (!cell) return '';
    
    if (cell.value && cell.value.startsWith('=')) {
      // Use computed value if available, otherwise compute it
      if (cell.computed !== undefined) {
        return cell.computed.toString();
      }
      const computed = evaluateFormula(cell.value, grid);
      return computed.toString();
    }
    
    // Parse and render markdown formatting
    return renderMarkdown(cell.value);
  };

  const renderMarkdown = (text: string) => {
    if (!text) return '';
    
    return text
      // Bold: **text** → <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text* → <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Strikethrough: ~~text~~ → <del>text</del>
      .replace(/~~(.*?)~~/g, '<del>$1</del>');
  };

  const getCellClasses = () => {
    const baseClasses = 'border border-gray-200 px-3 py-2 text-sm min-w-[120px] h-8 relative transition-all duration-200';
    
    if (isSelected) {
      return `${baseClasses} ring-2 ring-blue-500 outline-none bg-blue-50 z-10 border-blue-500`;
    }
    
    return `${baseClasses} hover:bg-gray-50 hover:border-gray-300`;
  };

  const getTextAlign = () => {
    if (!cell) return 'text-left';
    
    const value = cell.value;
    if (value && value.startsWith('=')) {
      // Use computed value if available, otherwise compute it
      let computed;
      if (cell.computed !== undefined) {
        computed = cell.computed;
      } else {
        computed = evaluateFormula(value, grid);
      }
      
      if (!isNaN(Number(computed)) && computed !== '#ERROR') {
        return 'text-right';
      }
    } else if (value && !isNaN(Number(value))) {
      return 'text-right';
    }
    
    return 'text-left';
  };

  return (
    <div
      className={getCellClasses()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          className="w-full h-full outline-none bg-transparent font-mono font-bold text-black"
        />
      ) : (
        <div 
          className={`truncate ${getTextAlign()} font-bold text-black`}
          dangerouslySetInnerHTML={{ __html: getDisplayValue() }}
        />
      )}
    </div>
  );
}
