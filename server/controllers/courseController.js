const { Course, Enrollment } = require('../models');

// GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = { approved: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter).populate('tutorId', 'name avatar').sort('-createdAt');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/courses/:id
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('tutorId', 'name avatar bio')
      .populate('lessons');
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/courses (tutor only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, thumbnail, category, level } = req.body;
    const course = await Course.create({
      title, description, price, thumbnail, category, level,
      tutorId: req.user._id,
      tutorName: req.user.name,
      approved: false,
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/courses/:id (tutor owner or admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    if (req.user.role !== 'admin' && course.tutorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    if (req.user.role !== 'admin' && course.tutorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    await course.deleteOne();
    res.json({ message: 'Course deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/courses/tutor/my — tutor's own courses
exports.getTutorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ tutorId: req.user._id }).sort('-createdAt');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
