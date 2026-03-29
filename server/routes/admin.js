const express = require('express');
const r = express.Router();
const {
  getStats,
  approveTutor,
  approveCourse,
  getUsers,
  getPendingTutors,
  getPendingCourses,
} = require('../controllers/mainController');
const { protect, authorize } = require('../middleware/auth');

r.use(protect, authorize('admin'));

r.get('/stats', getStats);
r.get('/users', getUsers);
r.get('/pending-tutors', getPendingTutors);
r.get('/pending-courses', getPendingCourses);
r.put('/approve-tutor/:id', approveTutor);
r.put('/approve-course/:id', approveCourse);

module.exports = r;
