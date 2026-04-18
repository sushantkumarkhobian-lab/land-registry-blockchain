const express = require('express');
const router = express.Router();
const { 
  getPendingRegistrations, 
  approveRegistration, 
  getPendingTransfers, 
  approveTransfer,
  auditChain,
  viewDecryptedDocument
} = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All agent routes must be protected and restricted to 'agent' role
router.use(protect);
router.use(authorize('agent', 'admin'));

router.get('/pending-registrations', getPendingRegistrations);
router.post('/approve-registration/:id', approveRegistration);

router.get('/pending-transfers', getPendingTransfers);
router.post('/approve-transfer/:id', approveTransfer);

router.get('/audit', auditChain);
router.get('/view-document/:cid', viewDecryptedDocument);

module.exports = router;
