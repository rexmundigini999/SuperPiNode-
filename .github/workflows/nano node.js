const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
require('dotenv').config();

// Initialize Express
const app = express();
app.use(bodyParser.json());

// Environment variables
const PORT = process.env.PORT || 4000;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

// Initialize Web3
const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);

// API Endpoints

// Test API
app.get('/api/test', (req, res) => {
    res.send({ message: 'NodeSuperPyJS is running successfully!' });
});

// Get Ethereum Account Balance
app.get('/api/balance/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const balance = await web3.eth.getBalance(address);
        res.json({ address, balance: web3.utils.fromWei(balance, 'ether') });
    } catch (error) {
        res.status(500).send({ error: 'Error fetching balance' });
    }
});

// Smart Contract Interaction
app.post('/api/contract', async (req, res) => {
    const { contractAddress, abi, method, params } = req.body;

    try {
        const contract = new web3.eth.Contract(abi, contractAddress);
        const result = await contract.methods[method](...params).call();
        res.json({ result });
    } catch (error) {
        res.status(500).send({ error: 'Error interacting with smart contract' });
    }
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`NodeSuperPyJS is running on http://localhost:${PORT}`);
});
