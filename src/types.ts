export type CellState = 'black' | 'white' | null;
export type Board = CellState[][];
export type Position = {
  row: number;
  col: number;
}; 