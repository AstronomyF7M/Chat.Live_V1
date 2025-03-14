 // JavaScript (script.js) - Modified for Socket.IO
 document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatBody = document.getElementById('chat-body');
  const userList = document.getElementById('user-list');
  const privateChat = document.getElementById('private-chat');
  const privateChatUserSpan = document.getElementById('private-chat-user');
  const privateChatBody = document.getElementById('private-chat-body');
  const privateMessageInput = document.getElementById('private-message-input');
  const sendPrivateButton = document.getElementById('send-private-button');
  const closePrivateChatButton = document.getElementById('close-private-chat');
  const gameCanvas = document.getElementById('game-canvas');
  const ctx = gameCanvas.getContext('2d');
  const gameContainer = document.getElementById('game-container');
 

  // Initialize Socket.IO connection
  const socket = io();
  let currentUser = prompt('Enter your username:') || 'Guest'; // Get username
  let users = {}; // Changed to object
  let privateChatUser = null;
  let gameActive = false;
  let socket_id = '';
 

  // Let the server know a new user has joined
  socket.emit('new user', currentUser);
 

  socket.on('get socket ID', (id) => {
  socket_id = id;
  });
 

  // Listen for incoming chat messages
  socket.on('chat message', (msg) => {
  displayMessage(msg.sender, msg.message);
  });
 

  // Listen for incoming private messages
  socket.on('private message', (data) => {
  if (privateChatUser === data.sender || currentUser === data.sender) {
  displayMessage(data.sender, data.message, true);
  } else {
  alert(`New private message from ${data.sender}!`); // Or display in a notification
  }
  });
 

  // Listen for user joined event
  socket.on('user joined', (username) => {
  users[username] = username;
  updateUserList();
  });
 

  // Listen for user left event
  socket.on('user left', (username) => {
  delete users[username];
  updateUserList();
  });
 

  // Function to display a message in the chat
  function displayMessage(sender, message, isPrivate = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(sender === currentUser ? 'sent' : 'received');
  messageElement.textContent = `${sender}: ${message}`;
 

  if (isPrivate) {
  privateChatBody.appendChild(messageElement);
  privateChatBody.scrollTop = privateChatBody.scrollHeight;
  } else {
  chatBody.appendChild(messageElement);
  chatBody.scrollTop = chatBody.scrollHeight;
  }
  }
 

  // Function to update the user list
  function updateUserList() {
  userList.innerHTML = '<h2>Users</h2><ul>'; // Clear existing list
  for (const user in users) {
  if (users.hasOwnProperty(user)) {
  const userItem = document.createElement('li');
  userItem.textContent = user;
  userItem.addEventListener('click', () => startPrivateChat(user));
  userList.querySelector('ul').appendChild(userItem);
  }
  }
  userList.innerHTML += '</ul>';
  }
 

  // Function to start a private chat
  function startPrivateChat(user) {
  privateChatUser = user;
  privateChatUserSpan.textContent = user;
  privateChat.style.display = 'block';
  }
 

  // Event listener for sending a message
  sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message !== '') {
  socket.emit('chat message', { sender: currentUser, message: message }); // Emit to server
  messageInput.value = '';
  }
  });
 

  // Event listener for sending a private message
  sendPrivateButton.addEventListener('click', () => {
  const message = privateMessageInput.value.trim();
  if (message !== '' && privateChatUser) {
  // Send private message event to the server
  socket.emit('private message', { recipient: privateChatUser, message: message });
  displayMessage(currentUser, message, true) // diplay the sender private message to the sender
  privateMessageInput.value = '';
  }
  });
 

  // Event listener for closing the private chat
  closePrivateChatButton.addEventListener('click', () => {
  privateChat.style.display = 'none';
  privateChatUser = null;
  privateChatBody.innerHTML = '';
  });
 

  // Initialize user list
  updateUserList();
 

  // Flappy Bird Game
  let bird = {
  x: 50,
  y: 150,
  velocity: 0,
  gravity: 0.6,
  radius: 15
  };
 

  let pipes = [];
  let score = 0;
 

  function resetGame() {
  bird = {
  x: 50,
  y: 150,
  velocity: 0,
  gravity: 0.6,
  radius: 15
  };
  pipes = [];
  score = 0;
  gameActive = false; // stop the function updateGame
  ctx.font = '30px Arial'; // Text size
  ctx.fillStyle = 'red'; // Text color
  ctx.textAlign = 'center'; // Center alignment
  ctx.fillText('Game Over!', gameCanvas.width / 2, gameCanvas.height / 2);
  }
 

  function addPipe() {
  let pipeHeight = 50 + Math.random() * 200;
  let gap = 120;
  pipes.push({
  x: gameCanvas.width,
  top: 0,
  topHeight: pipeHeight,
  bottom: gameCanvas.height - pipeHeight - gap,
  bottomHeight: gameCanvas.height - pipeHeight - gap,
  width: 50
  });
  }
 

  function drawBird() {
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  ctx.closePath();
  }
 

  function drawPipes() {
  pipes.forEach(pipe => {
  ctx.fillStyle = 'green';
  ctx.fillRect(pipe.x, pipe.top, pipe.width, pipe.topHeight);
  ctx.fillRect(pipe.x, pipe.bottom, pipe.width, gameCanvas.height);
  });
  }
 

  function updateGame() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
 

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
 

  if (bird.y + bird.radius > gameCanvas.height || bird.y - bird.radius < 0) {
  resetGame();
  return;
  }
 

  if (Math.random() < 0.01) {
  addPipe();
  }
 

  pipes.forEach((pipe, index) => {
  pipe.x -= 2;
 

  // Collision detection
  if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipe.width) {
  if (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.bottom) {
  resetGame();
  return;
  }
  }
 

  if (pipe.x + pipe.width < 0) {
  pipes.splice(index, 1);
  score++;
  }
  });
 

  drawPipes();
  drawBird();
 

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
 

  if (gameActive) {
  requestAnimationFrame(updateGame);
  }
  }
 

  document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
  bird.velocity = -10;
  if (!gameActive) {
  gameActive = true;
  updateGame();
  }
  }
  });
 

  // Start the game when the container is clicked
  gameContainer.addEventListener('click', () => {
  if (!gameActive) {
  gameActive = true;
  updateGame();
  }
  });
 });

