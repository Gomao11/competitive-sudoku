import React from 'react';
import type { GameRoom } from '../types';

interface ScoreBoardProps {
  room: GameRoom;
  myId: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ room, myId }) => {
  const players = Object.values(room.players);

  return (
    <div className="glass-panel score-board">
      {players.map(p => (
        <div key={p.socketId} className="player-score">
          <div className="player-name">
            <span className="color-dot" style={{ backgroundColor: p.color }}></span>
            {p.socketId === myId ? 'You' : `Player ${p.socketId.slice(0, 4)}`}
          </div>
          <div style={{ fontWeight: 600 }}>{p.score} pts</div>
        </div>
      ))}
      
      {/* Visual progress bar comparison */}
      <div className="progress-container">
        {players.map(p => {
          // Total score sum
          const totalScore = players.reduce((sum, curr) => sum + Math.max(0, curr.score), 0);
          const percentage = totalScore === 0 ? (100 / players.length) : (Math.max(0, p.score) / totalScore * 100);
          return (
            <div 
              key={`prog-${p.socketId}`} 
              className="progress-bar" 
              style={{ width: `${percentage}%`, backgroundColor: p.color }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBoard;
