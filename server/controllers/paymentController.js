const { Payment, Course, Enrollment, User } = require('../models')

/**
 * POST /api/payments/enroll
 * Mock payment — instantly enrolls learner, records payment,
 * splits earnings: 95% tutor, 5% admin platform fee.
 */
exports.mockEnroll = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user._id

    // Check course exists
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found.' })

    // Check not already enrolled
    const existing = await Enrollment.findOne({ userId, courseId })
    if (existing) return res.status(409).json({ message: 'You are already enrolled in this course.' })

    const amount = course.price || 0
    const platformFee = parseFloat((amount * 0.05).toFixed(2))
    const tutorEarning = parseFloat((amount * 0.95).toFixed(2))

    // Record payment
    await Payment.create({
      userId,
      courseId,
      amount,
      platformFee,
      tutorEarning,
      status: 'completed',
      stripePaymentId: `MOCK-${Date.now()}`,
    })

    // Create enrollment
    await Enrollment.create({ userId, courseId })

    // Increment student count on course
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } })

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in "${course.title}"!`,
      amount,
      tutorEarning,
      platformFee,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET /api/payments/tutor-earnings
 * Returns total earnings and per-course breakdown for the logged-in tutor.
 */
exports.getTutorEarnings = async (req, res) => {
  try {
    // Get all courses by this tutor
    const courses = await Course.find({ tutorId: req.user._id }).select('_id title price totalStudents')
    const courseIds = courses.map((c) => c._id)

    // Get all completed payments for those courses
    const payments = await Payment.find({ courseId: { $in: courseIds }, status: 'completed' })
      .populate('userId', 'name email')
      .populate('courseId', 'title price')
      .sort('-createdAt')

    const totalEarnings = payments.reduce((sum, p) => sum + (p.tutorEarning || 0), 0)
    const totalSales = payments.length

    // Per-course breakdown
    const perCourse = courses.map((course) => {
      const coursePayments = payments.filter((p) => p.courseId?._id.toString() === course._id.toString())
      return {
        courseId: course._id,
        title: course.title,
        price: course.price,
        totalStudents: course.totalStudents || 0,
        sales: coursePayments.length,
        earnings: parseFloat(coursePayments.reduce((sum, p) => sum + (p.tutorEarning || 0), 0).toFixed(2)),
      }
    })

    res.json({
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalSales,
      perCourse,
      recentPayments: payments.slice(0, 10),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET /api/payments/admin-revenue
 * Returns platform-wide revenue (5% fees) for admin.
 */
exports.getAdminRevenue = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'completed' })
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .sort('-createdAt')

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalPlatformFee = payments.reduce((sum, p) => sum + (p.platformFee || 0), 0)
    const totalTutorPayout = payments.reduce((sum, p) => sum + (p.tutorEarning || 0), 0)

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalPlatformFee: parseFloat(totalPlatformFee.toFixed(2)),
      totalTutorPayout: parseFloat(totalTutorPayout.toFixed(2)),
      totalTransactions: payments.length,
      recentPayments: payments.slice(0, 10),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
