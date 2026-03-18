import React from 'react';
import type { GameRoom } from '../types';

interface BoardProps {
  room: GameRoom;
  socketId: string;
  selectedCell: {r: number, c: number} | null;
  onSelectCell: (r: number, c: number) => void;
}

const Board: React.FC<BoardProps> = ({ room, selectedCell, onSelectCell }) => {
  return (
    <div className="sudoku-board">
      {room.puzzle.map((row, r) => (
        row.map((val, c) => {
          const owner = room.owners[r][c];
          let bgColor = '';
          let textColor = '';
          
          if (owner === 'locked') {
            textColor = 'var(--cell-text-locked)';
          } else if (owner !== null && room.players[owner]) {
            bgColor = room.players[owner].color;
            textColor = 'var(--cell-text-player)';
          }

          const isSelected = selectedCell?.r === r && selectedCell?.c === c;

          return (
            <div 
              key={`${r}-${c}`}
              id={`cell-${r}-${c}`}
              className={`cell ${isSelected ? 'selected' : ''} ${owner && owner !== 'locked' ? 'player-filled' : ''}`}
              style={{ backgroundColor: owner && owner !== 'locked' ? bgColor : undefined, color: textColor }}
              onClick={() => {
                if (owner === null) {
                  onSelectCell(r, c);
                }
              }}
            >
              {val !== null ? val : ''}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default Board;
