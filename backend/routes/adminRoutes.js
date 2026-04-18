const express = require('express');
const router = express.Router();
const { getAllLands, getAgents, removeAgent, acceptAgent, rejectAgent, getLogs } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/lands', getAllLands);
router.get('/agents', getAgents);
router.delete('/agents/:id', removeAgent);
router.post('/agents/:id/accept', acceptAgent);
router.post('/agents/:id/reject', rejectAgent);
router.get('/logs', getLogs);

module.exports = router;
