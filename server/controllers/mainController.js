// ─── LESSONS ───
const { Lesson, Quiz, Certificate, Internship, User, Course, Enrollment, Payment } = require('../models');

exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId }).sort('order');
    res.json(lessons);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createLesson = async (req, res) => {
  try {
    const { courseId, title, videoUrl, duration, order, resources } = req.body;
    const lesson = await Lesson.create({ courseId, title, videoUrl, duration, order, resources });
    await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });
    res.status(201).json(lesson);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── QUIZZES ───
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });
    if (!quiz) return res.status(404).json({ message: 'No quiz for this course.' });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── CERTIFICATES ───
exports.generateCert = async (req, res) => {
  try {
    const { courseId } = req.body;
    const existing = await Certificate.findOne({ userId: req.user._id, courseId });
    if (existing) return res.json(existing);

    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (!enrollment || !enrollment.completed) {
      return res.status(400).json({ message: 'Course not yet completed.' });
    }

    const course = await Course.findById(courseId);
    const { generateCertificate } = require('../utils/generateCertificate');
    const cert = await generateCertificate(req.user, course, enrollment);
    res.status(201).json(cert);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUserCerts = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.params.userId }).populate('courseId', 'title category');
    res.json(certs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── INTERNSHIPS ───
exports.getInternships = async (req, res) => {
  try {
    const { skillCategory } = req.query;
    const filter = { active: true };
    if (skillCategory) filter.skillCategory = { $regex: skillCategory, $options: 'i' };
    const internships = await Internship.find(filter).sort('-createdAt');
    res.json(internships);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    res.status(201).json(internship);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteInternship = async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Internship deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── ADMIN ───
exports.getStats = async (req, res) => {
  try {
    const [learners, tutors, courses, enrollments, payments] = await Promise.all([
      User.countDocuments({ role: 'learner' }),
      User.countDocuments({ role: 'tutor' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' }, platformFee: { $sum: '$platformFee' }, tutorPayout: { $sum: '$tutorEarning' } } }
      ]),
    ])
    res.json({
      learners, tutors, courses, enrollments,
      totalRevenue: payments[0]?.totalRevenue || 0,
      platformFee: payments[0]?.platformFee || 0,
      tutorPayout: payments[0]?.tutorPayout || 0,
    })
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveTutor = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Tutor approved.', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ message: 'Course approved.', course });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPendingTutors = async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor', approved: false }).select('-password');
    res.json(tutors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ approved: false }).populate('tutorId', 'name email');
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
