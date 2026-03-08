export interface Cell {
  value: string;
  computed?: string | number;
}

export interface Grid {
  [cellId: string]: Cell;
}

export interface Document {
  id: string;
  title: string;
  author: string;
  lastModified: Date;
  grid: Grid;
}

export interface Presence {
  userId: string;
  name: string;
  color: string;
  lastSeen: Date;
  cursor?: {
    cellId: string;
  };
}

export interface SaveStatus {
  status: 'saving' | 'saved' | 'offline';
  lastSaved?: Date;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
}

export type CellReference = string; // A1, B2, etc.
export type Formula = string; // =SUM(A1:A10)
export type CellValue = string | number | Formula;
