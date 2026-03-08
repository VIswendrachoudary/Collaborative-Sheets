export function getCellId(row: number, col: number): string {
  return `${numberToColumn(col)}${row}`;
}

export function parseCellId(cellId: string): { row: number; col: number } {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell ID: ${cellId}`);
  }
  
  const col = columnToNumber(match[1]);
  const row = parseInt(match[2]);
  
  return { row, col };
}

export function numberToColumn(num: number): string {
  let result = '';
  while (num > 0) {
    num--;
    result = String.fromCharCode('A'.charCodeAt(0) + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

export function columnToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result;
}

export function generateGrid(rows: number, cols: number): string[] {
  const cells: string[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      cells.push(getCellId(row, col));
    }
  }
  return cells;
}

export function getAdjacentCell(cellId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null {
  const { row, col } = parseCellId(cellId);
  
  switch (direction) {
    case 'up':
      return row > 1 ? getCellId(row - 1, col) : null;
    case 'down':
      return getCellId(row + 1, col);
    case 'left':
      return col > 1 ? getCellId(row, col - 1) : null;
    case 'right':
      return getCellId(row, col + 1);
  }
}
