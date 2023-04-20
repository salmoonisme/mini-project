const express = require('express');
const router = express.Router();
const orderController  = require('../controllers/orderController');
const { menuValidator } = require('../middlewares/joi');
const validation = require('../helpers/validation');
const { authUser, authAdmin } = require('../middlewares/authentication');

// endpoint for menu
router.get('/order', orderController.getAllOrders);
router.get('/order/user', authUser, orderController.getOrderByID);
router.post('/order', authUser, orderController.createOrder);
router.post('/order/:id', authUser, orderController.payOrder);

module.exports = router;