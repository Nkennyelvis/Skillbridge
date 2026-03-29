const express = require('express');
const r = express.Router();
const { generateCert, getUserCerts } = require('../controllers/mainController');
const { protect } = require('../middleware/auth');
r.post('/generate', protect, generateCert);
r.get('/:userId', protect, getUserCerts);
module.exports = r;
