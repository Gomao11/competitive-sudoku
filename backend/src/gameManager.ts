import { generateBoard, SudokuBoard, isValidMove } from './sudoku';

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
  owners: (string | null)[][]; // null = empty, 'locked' = initial, socketId = filled by player
}

const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']; // blue, red, green, yellow

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();

  public createRoom(roomId: string): GameRoom {
    const { puzzle, solution } = generateBoard(45); // 45 holes
    const owners: (string | null)[][] = Array(9).fill(null).map((_, r) => 
      Array(9).fill(null).map((_, c) => puzzle[r][c] !== null ? 'locked' : null)
    );

    const room: GameRoom = {
      roomId,
      status: 'waiting',
      players: {},
      puzzle,
      solution,
      owners
    };
    this.rooms.set(roomId, room);
    return room;
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  public joinRoom(roomId: string, socketId: string): GameRoom {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }
    
    if (!room.players[socketId]) {
      const color = colors[Object.keys(room.players).length % colors.length];
      room.players[socketId] = { socketId, color, score: 0 };
    }
    
    // Auto-start if 2 players joined
    if (Object.keys(room.players).length >= 2 && room.status === 'waiting') {
      room.status = 'playing';
      console.log(`Room ${roomId} started!`);
    }
    
    return room;
  }

  public leaveRoom(roomId: string, socketId: string) {
    const room = this.getRoom(roomId);
    if (room) {
      delete room.players[socketId];
      if (Object.keys(room.players).length === 0) {
        this.rooms.delete(roomId);
      } else if (Object.keys(room.players).length < 2) {
        // Option to pause or stop, but let's keep it simple for now
      }
    }
  }

  public makeMove(roomId: string, socketId: string, row: number, col: number, value: number): { valid: boolean, room: GameRoom, isFinished: boolean } | null {
    const room = this.getRoom(roomId);
    if (!room || room.status !== 'playing') return null;
    
    // Check if cell is already filled
    if (room.owners[row][col] !== null) return null;

    const player = room.players[socketId];
    if (!player) return null;

    if (isValidMove(room.solution, row, col, value)) {
      // Correct move
      room.puzzle[row][col] = value;
      room.owners[row][col] = socketId;
      player.score += 10;
      
      const isFinished = this.checkFinished(room);
      if (isFinished) room.status = 'finished';

      return { valid: true, room, isFinished };
    } else {
      // Wrong move
      player.score -= 5;
      return { valid: false, room, isFinished: false };
    }
  }

  private checkFinished(room: GameRoom): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (room.puzzle[r][c] === null) return false;
      }
    }
    return true;
  }
}
