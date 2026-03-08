import { Grid, CellReference, Cell } from '@/types/spreadsheet';

export function evaluateFormula(formula: string, grid: Grid): string | number {
  if (!formula.startsWith('=')) {
    return formula;
  }

  try {
    // Remove the = prefix
    const expression = formula.substring(1).trim();
    
    // Handle different functions
    if (expression.toUpperCase().startsWith('SUM(')) {
      return evaluateSum(expression, grid);
    }
    
    if (expression.toUpperCase().startsWith('AVERAGE(')) {
      return evaluateAverage(expression, grid);
    }
    
    if (expression.toUpperCase().startsWith('COUNT(')) {
      return evaluateCount(expression, grid);
    }
    
    if (expression.toUpperCase().startsWith('MIN(')) {
      return evaluateMin(expression, grid);
    }
    
    if (expression.toUpperCase().startsWith('MAX(')) {
      return evaluateMax(expression, grid);
    }
    
    // Handle arithmetic operations with cell references
    return evaluateArithmetic(expression, grid);
  } catch (error) {
    return '#ERROR';
  }
}

function evaluateSum(expression: string, grid: Grid): number {
  // Support both SUM(A1:B3) and SUM(A1,B2,C3)
  const rangeMatch = expression.match(/SUM\(([^)]+)\)/i);
  if (!rangeMatch) {
    throw new Error('Invalid SUM syntax');
  }

  const args = rangeMatch[1].split(',').map(arg => arg.trim());
  let sum = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      // Range like A1:B3
      const [startCell, endCell] = arg.split(':');
      const cells = getCellRange(startCell.trim(), endCell.trim());
      
      for (const cellId of cells) {
        const cell = grid[cellId];
        if (cell) {
          const value = getCellValue(cell, grid);
          sum += value;
        }
      }
    } else {
      // Single cell
      const cell = grid[arg];
      if (cell) {
        const value = getCellValue(cell, grid);
        sum += value;
      }
    }
  }
  
  return sum;
}

function evaluateAverage(expression: string, grid: Grid): number {
  const rangeMatch = expression.match(/AVERAGE\(([^)]+)\)/i);
  if (!rangeMatch) {
    throw new Error('Invalid AVERAGE syntax');
  }

  const args = rangeMatch[1].split(',').map(arg => arg.trim());
  let sum = 0;
  let count = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      // Range like A1:B3
      const [startCell, endCell] = arg.split(':');
      const cells = getCellRange(startCell.trim(), endCell.trim());
      
      for (const cellId of cells) {
        const cell = grid[cellId];
        if (cell) {
          const value = getCellValue(cell, grid);
          sum += value;
          count++;
        }
      }
    } else {
      // Single cell
      const cell = grid[arg];
      if (cell) {
        const value = getCellValue(cell, grid);
        sum += value;
        count++;
      }
    }
  }
  
  return count > 0 ? sum / count : 0;
}

function evaluateCount(expression: string, grid: Grid): number {
  const rangeMatch = expression.match(/COUNT\(([^)]+)\)/i);
  if (!rangeMatch) {
    throw new Error('Invalid COUNT syntax');
  }

  const args = rangeMatch[1].split(',').map(arg => arg.trim());
  let count = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      // Range like A1:B3
      const [startCell, endCell] = arg.split(':');
      const cells = getCellRange(startCell.trim(), endCell.trim());
      
      for (const cellId of cells) {
        const cell = grid[cellId];
        if (cell && cell.value) {
          const value = getCellValue(cell, grid);
          if (!isNaN(value) && value !== 0) {
            count++;
          }
        }
      }
    } else {
      // Single cell
      const cell = grid[arg];
      if (cell && cell.value) {
        const value = getCellValue(cell, grid);
        if (!isNaN(value) && value !== 0) {
          count++;
        }
      }
    }
  }
  
  return count;
}

function evaluateMin(expression: string, grid: Grid): number {
  const rangeMatch = expression.match(/MIN\(([^)]+)\)/i);
  if (!rangeMatch) {
    throw new Error('Invalid MIN syntax');
  }

  const args = rangeMatch[1].split(',').map(arg => arg.trim());
  let min = Infinity;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      // Range like A1:B3
      const [startCell, endCell] = arg.split(':');
      const cells = getCellRange(startCell.trim(), endCell.trim());
      
      for (const cellId of cells) {
        const cell = grid[cellId];
        if (cell) {
          const value = getCellValue(cell, grid);
          if (value < min) min = value;
        }
      }
    } else {
      // Single cell
      const cell = grid[arg];
      if (cell) {
        const value = getCellValue(cell, grid);
        if (value < min) min = value;
      }
    }
  }
  
  return min === Infinity ? 0 : min;
}

function evaluateMax(expression: string, grid: Grid): number {
  const rangeMatch = expression.match(/MAX\(([^)]+)\)/i);
  if (!rangeMatch) {
    throw new Error('Invalid MAX syntax');
  }

  const args = rangeMatch[1].split(',').map(arg => arg.trim());
  let max = -Infinity;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      // Range like A1:B3
      const [startCell, endCell] = arg.split(':');
      const cells = getCellRange(startCell.trim(), endCell.trim());
      
      for (const cellId of cells) {
        const cell = grid[cellId];
        if (cell) {
          const value = getCellValue(cell, grid);
          if (value > max) max = value;
        }
      }
    } else {
      // Single cell
      const cell = grid[arg];
      if (cell) {
        const value = getCellValue(cell, grid);
        if (value > max) max = value;
      }
    }
  }
  
  return max === -Infinity ? 0 : max;
}

function getCellValue(cell: Cell, grid: Grid): number {
  if (!cell || !cell.value) return 0;
  
  // If cell contains a formula, evaluate it first
  if (cell.value.startsWith('=')) {
    const result = evaluateFormula(cell.value, grid);
    return typeof result === 'number' ? result : 0;
  }
  
  const value = parseFloat(cell.value);
  return isNaN(value) ? 0 : value;
}

function evaluateArithmetic(expression: string, grid: Grid): number {
  // Replace cell references with their values
  let evaluatedExpression = expression.replace(/[A-Z]\d+/g, (match) => {
    const cell = grid[match];
    if (!cell) return '0';
    
    return getCellValue(cell, grid).toString();
  });
  
  // Evaluate the arithmetic expression safely
  try {
    // Use Function constructor instead of eval for better security
    return Function(`"use strict"; return (${evaluatedExpression})`)();
  } catch (error) {
    console.error('Arithmetic evaluation error:', error);
    return 0;
  }
}

function getCellRange(start: string, end: string): string[] {
  const startCol = start.match(/[A-Z]+/)?.[0] || '';
  const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
  const endCol = end.match(/[A-Z]+/)?.[0] || '';
  const endRow = parseInt(end.match(/\d+/)?.[0] || '1');
  
  const cells: string[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = columnToNumber(startCol); col <= columnToNumber(endCol); col++) {
      cells.push(numberToColumn(col) + row);
    }
  }
  
  return cells;
}

function columnToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result;
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

export function isFormula(value: string): boolean {
  return value.startsWith('=');
}

export function extractCellReferences(formula: string): string[] {
  const references = formula.match(/[A-Z]\d+/g) || [];
  return [...new Set(references)];
}

// Recalculate all formulas in the grid
export function recalculateGrid(grid: Grid): Grid {
  const updatedGrid = { ...grid };
  
  // Find all cells with formulas
  const formulaCells = Object.keys(grid).filter(cellId => 
    grid[cellId]?.value?.startsWith('=')
  );
  
  // Evaluate each formula
  for (const cellId of formulaCells) {
    const result = evaluateFormula(grid[cellId].value, updatedGrid);
    updatedGrid[cellId] = {
      ...updatedGrid[cellId],
      computed: result
    };
  }
  
  return updatedGrid;
}
