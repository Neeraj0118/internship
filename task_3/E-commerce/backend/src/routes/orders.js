const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderStatus);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
