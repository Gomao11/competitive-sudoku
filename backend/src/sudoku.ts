export type SudokuBoard = (number | null)[][];

export function generateBoard(numberOfHoles: number = 40): { puzzle: SudokuBoard, solution: SudokuBoard } {
  const board: SudokuBoard = Array(9).fill(null).map(() => Array(9).fill(null));
  
  // Fill the diagonal 3x3 matrices first
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
  
  // Fill the rest
  solveInternal(board);
  
  const solution = board.map(row => [...row]);
  
  // Remove numbers based on holes
  let count = numberOfHoles;
  while (count > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (board[row][col] !== null) {
      board[row][col] = null;
      count--;
    }
  }

  return { puzzle: board, solution };
}

function fillBox(board: SudokuBoard, rowStart: number, colStart: number) {
  let num: number;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, rowStart, colStart, num));
      board[rowStart + i][colStart + j] = num;
    }
  }
}

function isSafeInBox(board: SudokuBoard, rowStart: number, colStart: number, num: number): boolean {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) {
        return false;
      }
    }
  }
  return true;
}

function solveInternal(board: SudokuBoard): boolean {
  let row = -1;
  let col = -1;
  let isEmpty = false;
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }
  
  // no empty space left
  if (!isEmpty) return true;
  
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  
  for (let num of nums) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;
      if (solveInternal(board)) {
        return true;
      }
      board[row][col] = null;
    }
  }
  
  return false;
}

function isSafe(board: SudokuBoard, row: number, col: number, num: number): boolean {
  for (let d = 0; d < 9; d++) {
    if (board[row][d] === num) return false;
  }
  
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  
  let boxRowStart = row - row % 3;
  let boxColStart = col - col % 3;
  for (let r = 0; r < 3; r++) {
    for (let d = 0; d < 3; d++) {
      if (board[r + boxRowStart][d + boxColStart] === num) return false;
    }
  }
  
  return true;
}

export function isValidMove(solution: SudokuBoard, row: number, col: number, value: number): boolean {
  return solution[row][col] === value;
}
