const socketIO = require('socket.io');
const io = socketIO();

const handleConnection = (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('smartContractExecution', (data) => {
    // Process smart contract here
    console.log('Processing smart contract:', data);
  });

  socket.on('multicastMessage', (message) => {
    // Handle multicast messages here
    console.log('Multicast message received:', message);
  });

  // Send updates to the client
  setInterval(() => {
    socket.emit('networkUpdate', { message: 'Node health update', timestamp: new Date() });
  }, 1000);
};

module.exports = { io, handleConnection };
