import { Board, Position } from '../types';

interface GameBoardProps {
  board: Board;
  validMoves: Position[];
  onCellClick: (row: number, col: number) => void;
}

export default function GameBoard({ board, validMoves, onCellClick }: GameBoardProps) {
  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  return (
    <div className="w-[90%] max-w-[600px] xs:w-fit grid grid-cols-8 gap-[2px] bg-green-800 p-4 rounded-lg">
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`
              aspect-square xs:w-16 xs:h-16 flex items-center justify-center
              bg-green-600 cursor-pointer
              ${isValidMove(rowIndex, colIndex) ? 'hover:bg-green-500' : ''}
            `}
            onClick={() => onCellClick(rowIndex, colIndex)}
          >
            {cell && (
              <div className={`
                w-[87.5%] h-[87.5%] xs:w-14 xs:h-14 rounded-full
                ${cell === 'black' 
                  ? 'bg-black shadow-[inset_-3px_-3px_8px_rgba(255,255,255,0.2),_2px_2px_4px_rgba(0,0,0,0.4)]' 
                  : 'bg-white shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.1),_2px_2px_4px_rgba(0,0,0,0.2)]'}
                transition-all duration-300 ease-in-out
              `} />
            )}
            {!cell && isValidMove(rowIndex, colIndex) && (
              <div className="w-4 h-4 rounded-full bg-green-400 opacity-50" />
            )}
          </div>
        ))
      ))}
    </div>
  );
} 