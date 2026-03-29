const express = require('express');
const router = express.Router();
const { getLessons, createLesson } = require('../controllers/mainController');
const { protect, authorize, requireApproved } = require('../middleware/auth');

router.get('/:courseId', protect, getLessons);
router.post('/', protect, authorize('tutor'), requireApproved, createLesson);

module.exports = router;
