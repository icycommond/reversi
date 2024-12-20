import { useState, useEffect } from "react";
import { Board, CellState, Position } from "../types";
import GameBoard from "./GameBoard";

export default function Game() {
  const [board, setBoard] = useState<Board>(() => {
    const initialBoard: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    // 设置初始四个棋子
    initialBoard[3][3] = "white";
    initialBoard[3][4] = "black";
    initialBoard[4][3] = "black";
    initialBoard[4][4] = "white";
    return initialBoard;
  });
  const [currentPlayer, setCurrentPlayer] = useState<"black" | "white">(
    "black"
  );
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // 检查位置是否在棋盘内
  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  // 获取有效移动位置
  const updateValidMoves = (currentBoard: Board, player: CellState) => {
    const moves: Position[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (
          currentBoard[row][col] === null &&
          canPlace(currentBoard, row, col, player)
        ) {
          moves.push({ row, col });
        }
      }
    }

    setValidMoves(moves);
  };

  // 检查是否可以在指定位置放置棋子
  const canPlace = (
    currentBoard: Board,
    row: number,
    col: number,
    player: CellState
  ): boolean => {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    return directions.some(([dx, dy]) => {
      return checkDirection(currentBoard, row, col, dx, dy, player);
    });
  };

  // 检查某个方向是否可以翻转棋子
  const checkDirection = (
    currentBoard: Board,
    row: number,
    col: number,
    dx: number,
    dy: number,
    player: CellState
  ): boolean => {
    let x = row + dx;
    let y = col + dy;
    let hasOpponent = false;

    while (isValidPosition(x, y)) {
      if (currentBoard[x][y] === null) return false;
      if (currentBoard[x][y] === player) return hasOpponent;
      hasOpponent = true;
      x += dx;
      y += dy;
    }

    return false;
  };

  // 添加 AI 移动逻辑
  const getAIMove = (validMoves: Position[]): Position => {
    // 1. 优先选择角落位置
    const corners = validMoves.filter(
      move =>
        (move.row === 0 && move.col === 0) ||
        (move.row === 0 && move.col === 7) ||
        (move.row === 7 && move.col === 0) ||
        (move.row === 7 && move.col === 7)
    );
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // 2. 避免下在角落旁边的位置
    const safeMoves = validMoves.filter(
      move =>
        !(
          (move.row === 0 || move.row === 1 || move.row === 6 || move.row === 7) &&
          (move.col === 0 || move.col === 1 || move.col === 6 || move.col === 7)
        )
    );
    if (safeMoves.length > 0) {
      return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    // 3. 如果没有更好的选择，随机选择一个有效位置
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  };

  // 修改 handleMove 函数
  const handleMove = (row: number, col: number) => {
    // 如果不是玩家的回合，或者游戏结束，则不处理
    if (currentPlayer !== "black" || gameOver) return;
    
    if (!validMoves.some((move) => move.row === row && move.col === col))
      return;

    const newBoard = [...board.map((row) => [...row])];
    newBoard[row][col] = currentPlayer;

    // 翻转棋子
    flipPieces(newBoard, row, col, currentPlayer);

    setBoard(newBoard);
    setCurrentPlayer("white"); // 切换到 AI 回合
  };

  // 翻转棋子
  const flipPieces = (
    currentBoard: Board,
    row: number,
    col: number,
    player: CellState
  ) => {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    directions.forEach(([dx, dy]) => {
      if (checkDirection(currentBoard, row, col, dx, dy, player)) {
        let x = row + dx;
        let y = col + dy;
        while (currentBoard[x][y] !== player) {
          currentBoard[x][y] = player;
          x += dx;
          y += dy;
        }
      }
    });
  };

  // 添加计算分数的函数
  const calculateScores = () => {
    let blackCount = 0;
    let whiteCount = 0;

    if (!board.length) return { blackCount, whiteCount };

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] === "black") blackCount++;
        if (board[i][j] === "white") whiteCount++;
      }
    }

    return { blackCount, whiteCount };
  };

  const { blackCount, whiteCount } = calculateScores();

  // 在 state 声明之后添加这个 useEffect
  useEffect(() => {
    updateValidMoves(board, currentPlayer);
  }, [board, currentPlayer]); // 当棋盘或当前��家改变时更新有效移动位置

  // 添加一个检查对手是否有效移动的函数
  const checkOpponentMoves = (currentBoard: Board, player: CellState) => {
    const opponent = player === "black" ? "white" : "black";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (
          currentBoard[row][col] === null &&
          canPlace(currentBoard, row, col, opponent)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // 修改检查跳过的 useEffect
  useEffect(() => {
    if (gameOver) return;

    if (validMoves.length === 0) {
      console.log(`${currentPlayer === "black" ? "黑棋" : "白棋"}无路可走`);

      // 检查对手是否有路可走
      if (!checkOpponentMoves(board, currentPlayer)) {
        console.log("游戏结束！双方都无路可走");
        setGameOver(true);
        return;
      }

      const timer = setTimeout(() => {
        setCurrentPlayer(currentPlayer === "black" ? "white" : "black");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [validMoves, currentPlayer, board, gameOver]);

  // 添加 AI 移动的 useEffect
  useEffect(() => {
    if (currentPlayer === "white" && !gameOver) {
      // 添加短暂延迟，使 AI 走棋更自然
      const timer = setTimeout(() => {
        if (validMoves.length > 0) {
          const aiMove = getAIMove(validMoves);
          const newBoard = [...board.map((row) => [...row])];
          newBoard[aiMove.row][aiMove.col] = "white";
          
          // 翻转棋子
          flipPieces(newBoard, aiMove.row, aiMove.col, "white");
          
          setBoard(newBoard);
          setCurrentPlayer("black");
        }
      }, 1000); // 1秒延迟

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, validMoves, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">黑白棋</h1>
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-black"></div>
          <span className="font-semibold">黑棋: {blackCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
          <span className="font-semibold">白棋: {whiteCount}</span>
        </div>
      </div>
      <div className="mb-4">
        当前玩家:{" "}
        <span className="font-bold">
          {currentPlayer === "black" ? "玩家（黑棋）" : "电脑（白棋）"}
        </span>
      </div>
      <GameBoard
        board={board}
        validMoves={validMoves}
        onCellClick={handleMove}
      />
      {gameOver && (
        <div className="text-xl font-bold mb-4 text-red-600">
          游戏结束！
          {blackCount > whiteCount
            ? "黑棋胜利！"
            : whiteCount > blackCount
            ? "白棋胜利！"
            : "平局！"}
        </div>
      )}
    </div>
  );
}
