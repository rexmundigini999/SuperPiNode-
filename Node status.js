const mongoose = require('mongoose');

const nodeStatusSchema = new mongoose.Schema({
  nodeID: { type: String, required: true },
  contractProcessed: { type: Number, default: 0 },
  networkHealth: { type: String, default: 'healthy' },
  lastUpdated: { type: Date, default: Date.now },
});

const NodeStatus = mongoose.model('NodeStatus', nodeStatusSchema);

module.exports = NodeStatus;
