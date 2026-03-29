const express = require('express')
const r = express.Router()
const { mockEnroll, getTutorEarnings, getAdminRevenue } = require('../controllers/paymentController')
const { protect, authorize } = require('../middleware/auth')

r.post('/enroll', protect, authorize('learner'), mockEnroll)
r.get('/tutor-earnings', protect, authorize('tutor'), getTutorEarnings)
r.get('/admin-revenue', protect, authorize('admin'), getAdminRevenue)

module.exports = r
