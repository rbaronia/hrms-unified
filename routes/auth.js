const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { userValidationRules, validate } = require('../middleware/validation');

// Register endpoint
router.post('/register', userValidationRules(), validate, authController.register);
// Login endpoint
router.post('/login', validate, authController.login);

module.exports = router;
