const Web3 = require('web3');
require('dotenv').config();

const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);

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

module.exports = { getBalance, executeSmartContract };
