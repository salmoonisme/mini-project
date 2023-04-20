const express = require('express');
const router = express.Router();
const user = require('./userRoute');
const menu = require('./menuRoute');
const cart = require('./cartRoute');
const order = require('./orderRoute');

// middlewares for each route
router.use('/', user);
router.use('/', menu);
router.use('/', cart);
router.use('/', order);

module.exports = router;