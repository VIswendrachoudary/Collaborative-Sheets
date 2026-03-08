import { Grid } from '@/types/spreadsheet';

export function exportToCSV(grid: Grid): string {
  // Find the max row and column to determine the grid size
  const cellIds = Object.keys(grid);
  if (cellIds.length === 0) return '';

  const maxRow = Math.max(...cellIds.map(id => parseInt(id.match(/\d+/)?.[0] || '0')));
  const maxCol = Math.max(...cellIds.map(id => {
    const col = id.match(/[A-Z]+/)?.[0] || '';
    return columnToNumber(col);
  }));

  const rows: string[][] = [];
  
  for (let row = 1; row <= maxRow; row++) {
    const rowData: string[] = [];
    for (let col = 1; col <= maxCol; col++) {
      const cellId = getCellId(row, col);
      const cell = grid[cellId];
      rowData.push(cell?.value || '');
    }
    // Remove empty trailing cells
    while (rowData.length > 0 && rowData[rowData.length - 1] === '') {
      rowData.pop();
    }
    if (rowData.length > 0) {
      rows.push(rowData);
    }
  }

  return rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if needed
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

export function exportToJSON(grid: Grid): string {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    grid: grid
  };
  
  return JSON.stringify(exportData, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Helper functions
function getCellId(row: number, col: number): string {
  return `${numberToColumn(col)}${row}`;
}

function numberToColumn(num: number): string {
  let result = '';
  while (num > 0) {
    num--;
    result = String.fromCharCode('A'.charCodeAt(0) + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

function columnToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result;
}
