const express = require('express');
const router = express.Router();
const c = require('../controllers/courseController');
const { protect, authorize, requireApproved } = require('../middleware/auth');

router.get('/', c.getCourses);
router.get('/tutor/my', protect, authorize('tutor'), c.getTutorCourses);
router.get('/:id', c.getCourse);
router.post('/', protect, authorize('tutor'), requireApproved, c.createCourse);
router.put('/:id', protect, authorize('tutor', 'admin'), c.updateCourse);
router.delete('/:id', protect, authorize('tutor', 'admin'), c.deleteCourse);

module.exports = router;
