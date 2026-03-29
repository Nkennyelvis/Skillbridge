// routes/quizzes.js
const express = require('express');
const r = express.Router();
const { getQuiz, createQuiz } = require('../controllers/mainController');
const { protect, authorize } = require('../middleware/auth');
r.get('/:courseId', protect, getQuiz);
r.post('/', protect, authorize('tutor'), createQuiz);
module.exports = r;
