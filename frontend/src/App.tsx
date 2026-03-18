import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameRoom } from './types';
import Board from './components/Board';
import Keypad from './components/Keypad';
import ScoreBoard from './components/ScoreBoard';

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState('');
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('roomState', (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);
    });

    newSocket.on('moveResult', ({ valid, row, col }) => {
      if (!valid) {
        // Shake cell on invalid move
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) {
          cell.classList.add('shake');
          setTimeout(() => cell.classList.remove('shake'), 400); // match animation duration
        }
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && roomId.trim()) {
      socket.emit('joinRoom', roomId.trim().toUpperCase());
    }
  };

  const handleNumberInput = (num: number) => {
    if (!socket || !room || !selectedCell || room.status !== 'playing') return;
    
    // Only send if cell is empty
    if (room.owners[selectedCell.r][selectedCell.c] === null) {
      socket.emit('makeMove', {
        roomId: room.roomId,
        row: selectedCell.r,
        col: selectedCell.c,
        value: num
      });
    }
  };

  if (!room) {
    return (
      <div className="join-screen">
        <div className="header">
          <h1>Sudoku Arena</h1>
          <p>Real-time competitive Sudoku. Claim your territory!</p>
        </div>
        <form onSubmit={handleJoin} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Room ID" 
            value={roomId} 
            onChange={e => setRoomId(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Join Match</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Room: {room.roomId}</h1>
        {room.status === 'waiting' && <p>Waiting for opponent to join...</p>}
        {room.status === 'finished' && <h2>Match Finished!</h2>}
      </div>

      <ScoreBoard room={room} myId={socket?.id || ''} />
      
      <Board 
        room={room} 
        socketId={socket?.id || ''} 
        selectedCell={selectedCell}
        onSelectCell={(r, c) => setSelectedCell({r, c})}
      />

      <Keypad onNumberClick={handleNumberInput} disabled={room.status !== 'playing'} />
    </div>
  );
}

export default App;
