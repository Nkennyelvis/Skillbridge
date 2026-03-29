import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader, Alert } from '../../components/common'
import api from '../../services/api'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [error, setError] = useState('')
  const [successModal, setSuccessModal] = useState(null) // holds { message, amount, tutorEarning, platformFee }

  useEffect(() => { loadCourse() }, [id])

  const loadCourse = async () => {
    try {
      const [courseRes, enrollRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/enrollments/${user._id}`),
      ])
      setCourse(courseRes.data)
      setEnrolled(enrollRes.data.some((e) => e.courseId?._id === id || e.courseId === id))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleEnroll = async () => {
    setError('')
    setEnrollLoading(true)
    try {
      if (course.price === 0) {
        // Free course — enroll directly
        await api.post('/enroll', { courseId: id })
        setEnrolled(true)
        setSuccessModal({
          message: `You have successfully enrolled in "${course.title}"!`,
          amount: 0,
          tutorEarning: 0,
          platformFee: 0,
          free: true,
        })
      } else {
        // Paid course — mock payment, instant enrollment
        const { data } = await api.post('/payments/enroll', { courseId: id })
        setEnrolled(true)
        setSuccessModal(data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.')
    } finally {
      setEnrollLoading(false)
    }
  }

  if (loading) return <PageLoader />
  if (!course) return <div className="text-center py-20 text-gray-400">Course not found.</div>

  const levelColors = {
    Beginner: 'text-green-600 bg-green-50',
    Intermediate: 'text-yellow-600 bg-yellow-50',
    Advanced: 'text-red-600 bg-red-50',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <i className="fa-solid fa-circle-check text-accent text-5xl" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-dark mb-2">Enrollment Successful!</h2>
              <p className="text-gray-500 text-sm">{successModal.message || `You are now enrolled in "${course.title}"`}</p>
            </div>

            {/* Payment breakdown — only for paid courses */}
            {!successModal.free && successModal.amount > 0 && (
              <div className="bg-surface rounded-xl p-4 text-sm space-y-2 text-left">
                <div className="font-heading font-semibold text-dark mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-receipt text-primary" /> Payment Summary
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Course price</span>
                  <span className="font-semibold text-dark">${successModal.amount}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-chalkboard-user text-xs" /> Tutor receives (95%)
                  </span>
                  <span className="font-semibold">${successModal.tutorEarning}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-building-columns text-xs" /> Platform fee (5%)
                  </span>
                  <span className="font-semibold">${successModal.platformFee}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => { setSuccessModal(null); navigate(`/learn/${id}`) }}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-play" /> Start Learning Now
              </button>
              <button
                onClick={() => setSuccessModal(null)}
                className="btn-secondary w-full py-2 text-sm"
              >
                Stay on this page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button onClick={() => navigate('/courses')} className="hover:text-primary flex items-center gap-1">
          <i className="fa-solid fa-arrow-left text-xs" /> Courses
        </button>
        <i className="fa-solid fa-chevron-right text-xs" />
        <span className="text-dark font-medium truncate">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Course info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-56 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <i className="fa-solid fa-book-open text-white/60 text-8xl relative z-10" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-primary/10 text-primary">{course.category}</span>
              <span className={`badge ${levelColors[course.level]}`}>{course.level}</span>
            </div>
            <h1 className="font-heading font-bold text-2xl text-dark mb-3">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-star text-yellow-400 text-xs" />
                <span className="font-semibold text-dark">{course.rating?.toFixed(1) || '4.5'}</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-users text-xs" /> {course.totalStudents || 0} students
              </span>
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-list text-xs" /> {course.lessons?.length || 0} lessons
              </span>
            </div>
            <p className="text-gray-500 font-body leading-relaxed">{course.description}</p>
          </div>

          {/* Instructor */}
          <div className="card">
            <h3 className="font-heading font-semibold text-dark mb-3 flex items-center gap-2">
              <i className="fa-solid fa-chalkboard-user text-primary" /> Your Instructor
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                {(course.tutorId?.name || 'T').charAt(0)}
              </div>
              <div>
                <div className="font-heading font-semibold text-dark">{course.tutorId?.name || course.tutorName}</div>
                <div className="text-sm text-gray-400">{course.tutorId?.bio || 'Expert Instructor'}</div>
              </div>
            </div>
          </div>

          {/* Curriculum */}
          {course.lessons?.length > 0 && (
            <div className="card">
              <h3 className="font-heading font-semibold text-dark mb-4 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-primary" /> Course Curriculum
              </h3>
              <div className="space-y-2">
                {course.lessons.map((lesson, i) => (
                  <div key={lesson._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 font-body text-sm text-dark">{lesson.title}</div>
                    <div className="text-xs text-gray-400">{lesson.duration || '—'}</div>
                    {enrolled
                      ? <i className="fa-solid fa-circle-play text-primary text-sm" />
                      : <i className="fa-solid fa-lock text-gray-300 text-sm" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Enroll card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6 space-y-4">
            <div className="text-3xl font-heading font-bold text-dark">
              {course.price === 0 ? <span className="text-accent">Free</span> : `$${course.price}`}
            </div>

            {course.price > 0 && (
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-info" /> Revenue split on enrollment
                </div>
                <div className="flex justify-between"><span>Tutor receives</span><span className="font-bold">${(course.price * 0.95).toFixed(2)} (95%)</span></div>
                <div className="flex justify-between"><span>Platform fee</span><span className="font-bold">${(course.price * 0.05).toFixed(2)} (5%)</span></div>
              </div>
            )}

            <Alert type="error" message={error} />

            {enrolled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                  <i className="fa-solid fa-circle-check" /> You are enrolled
                </div>
                <button onClick={() => navigate(`/learn/${id}`)} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  Continue Learning <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                {enrollLoading
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Processing...</>
                  : <><i className="fa-solid fa-bolt" /> {course.price === 0 ? 'Enroll for Free' : `Enroll — $${course.price}`}</>
                }
              </button>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-2">
              {[
                ['fa-list', `${course.lessons?.length || 0} lessons`],
                ['fa-trophy', 'Certificate of completion'],
                ['fa-infinity', 'Full lifetime access'],
                ['fa-signal', `${course.level} level`],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
                  <i className={`fa-solid ${icon} w-4 text-center text-gray-400`} />{text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
