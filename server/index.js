const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const roomRoutes = require('./routes/roomRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.io for WebRTC signaling (prepared for next phase)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_room', (roomCode) => {
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room ${roomCode}`);
  });
  
  socket.on('participant_joined', (roomCode) => {
    socket.to(roomCode).emit('update_participants');
  });
  
  // File sharing events
  socket.on('file_share_start', (data) => {
    socket.to(data.roomCode).emit('file_share_start', {
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      totalChunks: data.totalChunks
    });
  });

  socket.on('file_chunk', (data) => {
    socket.to(data.roomCode).emit('file_chunk', {
      chunk: data.chunk,
      index: data.index
    });
  });

  socket.on('file_share_complete', (roomCode) => {
    socket.to(roomCode).emit('file_share_complete');
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pdfly';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
