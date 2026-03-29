const express = require('express');
const r = express.Router();
const { getInternships, createInternship, deleteInternship } = require('../controllers/mainController');
const { protect, authorize } = require('../middleware/auth');
r.get('/', getInternships);
r.post('/', protect, authorize('admin'), createInternship);
r.delete('/:id', protect, authorize('admin'), deleteInternship);
module.exports = r;
