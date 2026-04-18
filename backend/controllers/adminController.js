const User = require('../models/User');
const Land = require('../models/Land');
const Log = require('../models/Log');

// @desc    Get all lands
// @route   GET /api/admin/lands
const getAllLands = async (req, res) => {
  try {
    const lands = await Land.find().populate('owner', 'username email');
    res.json(lands);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all agents
// @route   GET /api/admin/agents
const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove an agent
// @route   DELETE /api/admin/agents/:id
const removeAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept an agent request
// @route   POST /api/admin/agents/:id/accept
const acceptAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    agent.status = 'accepted';
    await agent.save();
    res.json({ message: 'Agent accepted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject an agent request
const rejectAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    agent.status = 'rejected';
    await agent.save();
    res.json({ message: 'Agent rejected successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system logs
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    
    // Simulate port status for the request
    const portStatus = [
      { port: 3000, service: 'Frontend', status: 'Running' },
      { port: 5000, service: 'Backend API', status: 'Running' },
      { port: 27017, service: 'MongoDB', status: 'Running' },
      { port: 8545, service: 'Blockchain Node', status: 'Running' }
    ];

    res.json({ logs, portStatus });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllLands,
  getAgents,
  removeAgent,
  acceptAgent,
  rejectAgent,
  getLogs
};
