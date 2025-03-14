 // server.js
 const express = require('express');
 const http = require('http');
 const socketIO = require('socket.io');
 

 const app = express();
 const server = http.createServer(app);
 const io = socketIO(server);
 

 app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)
 

 io.on('connection', (socket) => {
  console.log('A user connected');
 

  // Listen for new messages
  socket.on('chat message', (msg) => {
  io.emit('chat message', msg); // Broadcast message to all connected clients
  });
 

  // Listen for private messages
  socket.on('private message', (data) => {
  // data should contain {recipient: 'username', message: 'text'}
  io.to(data.recipient).emit('private message', {sender: socket.id, message: data.message});
  });
 

  // Listen for new users
  socket.on('new user', (username) => {
  socket.username = username;
  io.emit('user joined', username); // Let everyone know a user joined
 

  // Send the current username to the user to save socket ID to username
  socket.emit('get socket ID', socket.id);
  })
 

  socket.on('disconnect', () => {
  console.log('User disconnected');
  io.emit('user left', socket.username);
  });
 });
 

 const PORT = process.env.PORT || 3000;
 server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
 });
 <script src="/socket.io/socket.io.js"></script>
