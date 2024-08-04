const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
