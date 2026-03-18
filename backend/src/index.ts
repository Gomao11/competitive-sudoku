import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './gameManager';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager();
const socketRooms: Record<string, string> = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    socketRooms[socket.id] = roomId;
    const room = gameManager.joinRoom(roomId, socket.id);
    
    // Broadcast updated room state
    io.to(roomId).emit('roomState', room);
  });

  socket.on('makeMove', ({ roomId, row, col, value }) => {
    const result = gameManager.makeMove(roomId, socket.id, row, col, value);
    if (result) {
      io.to(roomId).emit('roomState', result.room);
      if (result.valid) {
        io.to(roomId).emit('moveResult', { socketId: socket.id, valid: true, row, col, value });
      } else {
        // Send fail message to everyone or just the initiator (for penalties)
        io.to(roomId).emit('moveResult', { socketId: socket.id, valid: false, row, col, value }); 
      }
      
      if (result.isFinished) {
        io.to(roomId).emit('gameFinished', result.room);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const roomId = socketRooms[socket.id];
    if (roomId) {
      gameManager.leaveRoom(roomId, socket.id);
      const room = gameManager.getRoom(roomId);
      if (room) {
        io.to(roomId).emit('roomState', room);
      }
      delete socketRooms[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
