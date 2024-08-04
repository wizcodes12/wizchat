const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://66af1a5788259249806a86f1--dynamic-narwhal-1ae0e0.netlify.app/",
    methods: ["GET", "POST"]
  }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userData) => {
    users.set(socket.id, userData);
    io.emit('userList', Array.from(users.values()));
  });

  socket.on('message', (message) => {
    io.emit('message', { ...message, sender: users.get(socket.id) });
  });

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('userTyping', { user: users.get(socket.id), isTyping });
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('userList', Array.from(users.values()));
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//https://5k1q885n-3000.inc1.devtunnels.ms/


