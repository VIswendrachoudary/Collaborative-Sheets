'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Cell, Grid as GridType } from '@/types/spreadsheet';
import { getCellId, getAdjacentCell } from '@/lib/gridUtils';
import CellComponent from './Cell';
import RowHeader from './RowHeader';
import ColumnHeader from './ColumnHeader';

interface GridProps {
  grid: GridType;
  onUpdate: (cellId: string, value: string) => void;
  onSelect?: (cellId: string) => void;
  rows?: number;
  cols?: number;
}

const DEFAULT_ROWS = 50;
const DEFAULT_COLS = 26;

export default function Grid({ 
  grid, 
  onUpdate, 
  onSelect,
  rows = DEFAULT_ROWS, 
  cols = DEFAULT_COLS 
}: GridProps) {
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const handleCellSelect = useCallback((cellId: string) => {
    setSelectedCell(cellId);
    onSelect?.(cellId);
  }, [onSelect]);

  const handleStartEdit = useCallback((cellId: string) => {
    setEditingCell(cellId);
  }, []);

  const handleCellUpdate = useCallback((cellId: string, value: string) => {
    onUpdate(cellId, value);
  }, [onUpdate]);

  const handleStopEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (editingCell) return;

    let nextCell: string | null = null;

    switch (e.key) {
      case 'ArrowUp':
        nextCell = getAdjacentCell(selectedCell, 'up');
        break;
      case 'ArrowDown':
        nextCell = getAdjacentCell(selectedCell, 'down');
        break;
      case 'ArrowLeft':
        nextCell = getAdjacentCell(selectedCell, 'left');
        break;
      case 'ArrowRight':
        nextCell = getAdjacentCell(selectedCell, 'right');
        break;
      case 'Tab':
        e.preventDefault();
        nextCell = getAdjacentCell(selectedCell, e.shiftKey ? 'left' : 'right');
        break;
      case 'Enter':
        e.preventDefault();
        nextCell = getAdjacentCell(selectedCell, 'down');
        break;
      case 'F2':
        e.preventDefault();
        handleStartEdit(selectedCell);
        return;
    }

    if (nextCell) {
      setSelectedCell(nextCell);
    }
  }, [selectedCell, editingCell, handleStartEdit]);

  // Add keyboard event listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Generate column letters
  const columnLetters = useMemo(() => {
    const letters = [];
    for (let i = 1; i <= cols; i++) {
      let column = '';
      let num = i;
      while (num > 0) {
        num--;
        column = String.fromCharCode('A'.charCodeAt(0) + (num % 26)) + column;
        num = Math.floor(num / 26);
      }
      letters.push(column);
    }
    return letters;
  }, [cols]);

  return (
    <div className="overflow-auto border border-gray-300 rounded-lg">
      <div className="inline-block min-w-full">
        {/* Column Headers */}
        <div className="flex">
          <div className="w-12 h-6 border border-gray-200 bg-gray-100"></div>
          {columnLetters.map((letter, index) => (
            <ColumnHeader key={letter} columnLetter={letter} columnIndex={index} />
          ))}
        </div>

        {/* Grid Rows */}
        {Array.from({ length: rows }, (_, rowIndex) => {
          const rowNumber = rowIndex + 1;
          return (
            <div key={rowNumber} className="flex">
              <RowHeader rowNumber={rowNumber} />
              {columnLetters.map((letter) => {
                const cellId = getCellId(rowNumber, columnLetters.indexOf(letter) + 1);
                const cell = grid[cellId];
                const isSelected = selectedCell === cellId;
                const isEditing = editingCell === cellId;

                return (
                  <CellComponent
                    key={cellId}
                    cellId={cellId}
                    cell={cell}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    grid={grid}
                    onSelect={handleCellSelect}
                    onStartEdit={handleStartEdit}
                    onUpdate={handleCellUpdate}
                    onStopEdit={handleStopEdit}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
