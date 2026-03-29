const { Enrollment, Course, Certificate } = require('../models');
const { generateCertificate } = require('../utils/generateCertificate');

// POST /api/enroll
exports.enroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(409).json({ message: 'Already enrolled.' });

    const enrollment = await Enrollment.create({ userId: req.user._id, courseId });
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/enrollments/:userId
exports.getUserEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.params.userId })
      .populate('courseId');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/enrollments/:id/progress
exports.updateProgress = async (req, res) => {
  try {
    const { lessonId, totalLessons } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }
    enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

    if (enrollment.progress >= 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
      // Auto-generate certificate
      const course = await require('../models').Course.findById(enrollment.courseId);
      const user = req.user;
      await generateCertificate(user, course, enrollment);
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
