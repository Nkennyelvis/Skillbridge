const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── USER ───
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['learner', 'tutor', 'admin'], default: 'learner' },
    approved: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
const User = mongoose.model('User', userSchema);

// ─── COURSE ───
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    thumbnail: { type: String, default: '' },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutorName: { type: String },
    approved: { type: Boolean, default: false },
    category: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    rating: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { timestamps: true }
);
const Course = mongoose.model('Course', courseSchema);

// ─── LESSON ───
const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, default: '' },
    duration: { type: String, default: '0:00' },
    order: { type: Number, default: 0 },
    resources: [{ name: String, url: String }],
  },
  { timestamps: true }
);
const Lesson = mongoose.model('Lesson', lessonSchema);

// ─── ENROLLMENT ───
const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// ─── QUIZ ───
const quizSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
      },
    ],
  },
  { timestamps: true }
);
const Quiz = mongoose.model('Quiz', quizSchema);

// ─── CERTIFICATE ───
const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    issueDate: { type: Date, default: Date.now },
    certificateUrl: { type: String, default: '' },
    certificateId: { type: String, unique: true },
  },
  { timestamps: true }
);
const Certificate = mongoose.model('Certificate', certificateSchema);

// ─── INTERNSHIP ───
const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['Remote', 'Onsite', 'Hybrid'], default: 'Remote' },
    skillCategory: { type: String, required: true },
    description: { type: String, default: '' },
    applyUrl: { type: String, default: '#' },
    deadline: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Internship = mongoose.model('Internship', internshipSchema);

// ─── PAYMENT ───
const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },   // 5% to admin
    tutorEarning: { type: Number, default: 0 },  // 95% to tutor
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    stripePaymentId: { type: String, default: '' },
  },
  { timestamps: true }
);
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { User, Course, Lesson, Enrollment, Quiz, Certificate, Internship, Payment };
