const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.post('/', supportController.createSupportTicket);
router.get('/', supportController.getSupportTickets);

module.exports = router;
