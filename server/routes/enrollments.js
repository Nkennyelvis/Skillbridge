// routes/enrollments.js
const express = require('express');
const router = express.Router();
const { enroll, getUserEnrollments, updateProgress } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, enroll);
router.get('/:userId', protect, getUserEnrollments);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;
