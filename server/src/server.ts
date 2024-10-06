import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
  },
});

const PORT = 3001;

// Room state 
const rooms: { [key: string]: string[][] } = {};

io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  socket.on('join_room', (roomCode: string) => {
    socket.join(roomCode);

    if (!rooms[roomCode]) {
      // Initialize room with a 16x16 grid of green squares
      rooms[roomCode] = Array(16).fill(null).map(() => Array(16).fill('green'));
    }

    // Send the current grid state to the player that joined
    socket.emit('grid_update', rooms[roomCode]);
  });

  socket.on('click_box', (data: { roomCode: string, x: number, y: number }) => {
    const { roomCode, x, y } = data;

    if (rooms[roomCode] && rooms[roomCode][x][y] === 'green') {
      // Change the box to red
      rooms[roomCode][x][y] = 'red';

      // Broadcast the updated grid to everyone in the room
      io.to(roomCode).emit('grid_update', rooms[roomCode]);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
