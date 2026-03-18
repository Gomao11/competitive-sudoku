export type SudokuBoard = (number | null)[][];

export interface Player {
  socketId: string;
  color: string;
  score: number;
}

export interface GameRoom {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Record<string, Player>;
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  owners: (string | null)[][];
}
