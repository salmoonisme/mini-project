const express = require('express');
const router = express.Router();
const userController  = require('../controllers/userController');
const { registerValidator, loginValidator } = require('../middlewares/joi');
const validation = require('../helpers/validation');
const { authUser, authAdmin } = require('../middlewares/authentication');

// endpoint for User
router.get('/user', userController.getAllUsers);
router.get('/user/:id', userController.getUserByID);
router.post('/register', validation(registerValidator), userController.registerUser);
router.post('/login', validation(loginValidator), userController.loginUser)
router.delete('/user/:id', authUser, userController.deleteUser)


module.exports = router;