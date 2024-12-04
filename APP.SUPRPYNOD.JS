// SuperPyNode - Main Node Application Code (Backend + Frontend + Network)

require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const mongoose = require('mongoose');
const redis = require('redis');
const socketIO = require('socket.io');
const http = require('http');

// MongoDB Model for Node Status
const nodeStatusSchema = new mongoose.Schema({
  nodeID: { type: String, required: true },
  contractProcessed: { type: Number, default: 0 },
  networkHealth: { type: String, default: 'healthy' },
  lastUpdated: { type: Date, default: Date.now },
});
const NodeStatus = mongoose.model('NodeStatus', nodeStatusSchema);

// Redis Connection
const redisClient = redis.createClient({ host: '127.0.0.1', port: 6379 });

// Web3 setup for Ethereum interaction
const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);

// Express Setup
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 4000;

// Cache and DB setup for Node Status
const setCache = (key, value, ttl = 3600) => {
  redisClient.setex(key, ttl, JSON.stringify(value), (err) => {
    if (err) console.error('Error setting cache:', err);
  });
};
const getCache = (key, callback) => {
  redisClient.get(key, (err, data) => {
    if (err) console.error('Error getting cache:', err);
    callback(JSON.parse(data));
  });
};

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Web3 Helper Functions
const getBalance = async (address) => {
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, 'ether');
};

const executeSmartContract = async (contractAddress, abi, method, params) => {
  const contract = new web3.eth.Contract(abi, contractAddress);
  try {
    const result = await contract.methods[method](...params).call();
    return result;
  } catch (error) {
    console.error('Error executing contract method:', error);
  }
};

// Socket.IO Handling for Real-Time Communication
io.on('connection', (socket) => {
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

  setInterval(() => {
    socket.emit('networkUpdate', { message: 'Node health update', timestamp: new Date() });
  }, 1000);
});

// Frontend - Simple Node.js Backend to Serve HTML (just for demo)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SuperPyNode - Mesh Network</title>
      </head>
      <body>
        <h1>SuperPyNode Mesh Network</h1>
        <p>Node health: <span id="health">loading...</span></p>
        <p>Smart Contract Processing: <span id="processing">0</span></p>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.0/socket.io.min.js"></script>
        <script>
          const socket = io();
          socket.on('networkUpdate', (data) => {
            document.getElementById('health').textContent = data.message;
          });

          socket.on('smartContractExecution', (data) => {
            document.getElementById('processing').textContent = data.count;
          });
        </script>
      </body>
    </html>
  `);
});

// API to get balance
app.get('/balance/:address', async (req, res) => {
  const balance = await getBalance(req.params.address);
  res.json({ address: req.params.address, balance });
});

// API to execute contract method
app.post('/contract', async (req, res) => {
  const { contractAddress, abi, method, params } = req.body;
  const result = await executeSmartContract(contractAddress, abi, method, params);
  res.json({ result });
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Background processes (for example, monitoring node status and sending updates)
setInterval(() => {
  const nodeStatus = new NodeStatus({
    nodeID: 'node1',
    contractProcessed: Math.floor(Math.random() * 100),
    networkHealth: 'healthy',
  });

  nodeStatus.save()
    .then((status) => {
      console.log('Node status saved:', status);
      setCache('nodeStatus', status);
    })
    .catch((err) => console.error('Error saving node status:', err));
}, 5000);

// Sample Blockchain Interaction (Infura Ethereum mainnet)
(async () => {
  const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';  // example Ethereum address
  const balance = await getBalance(address);
  console.log('Balance:', balance);  // Log the balance of the address
})();
