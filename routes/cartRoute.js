const express = require('express');
const router = express.Router();
const cartController  = require('../controllers/cartController');
const validation = require('../helpers/validation');
const { authUser, authAdmin } = require('../middlewares/authentication');

// endpoint for cart control
router.get('/cart', cartController.getAllCarts);
router.get('/cart/user', authUser, cartController.getUserCart);
router.post('/cart/user', authUser, cartController.createCart);
router.patch('/cart/user', authUser, cartController.updateCart);
router.delete('/cart/user/:id', authUser, cartController.deleteCartMenus);

module.exports = router;