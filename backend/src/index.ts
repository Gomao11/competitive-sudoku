import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './gameManager';

const app = express();
app.use(cors());

// ヘルスチェック用（Renderが起動を確認するために必要）
app.get('/', (req, res) => {
  res.send('Server is running');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
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
    io.to(roomId).emit('roomState', room);
  });

  socket.on('makeMove', ({ roomId, row, col, value }) => {
    const result = gameManager.makeMove(roomId, socket.id, row, col, value);
    if (result) {
      io.to(roomId).emit('roomState', result.room);
      io.to(roomId).emit('moveResult', { socketId: socket.id, valid: result.valid, row, col, value });

      if (result.isFinished) {
        io.to(roomId).emit('gameFinished', result.room);
      }
    }
  });

  socket.on('disconnect', () => {
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

// Renderのためのポート設定修正
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});