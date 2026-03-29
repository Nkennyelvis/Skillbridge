import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { StatCard, CourseCard, ProgressBar, PageLoader, EmptyState } from '../../components/common'
import api from '../../services/api'

export default function LearnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [recommended, setRecommended] = useState([])
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [enrollRes, courseRes, internRes] = await Promise.all([
        api.get(`/enrollments/${user._id}`),
        api.get('/courses'),
        api.get('/internships'),
      ])
      setEnrollments(enrollRes.data)
      const enrolledIds = enrollRes.data.map((e) => e.courseId?._id)
      setRecommended(courseRes.data.filter((c) => !enrolledIds.includes(c._id)).slice(0, 3))
      setInternships(internRes.data.slice(0, 3))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  const completed = enrollments.filter((e) => e.completed).length
  const inProgress = enrollments.filter((e) => !e.completed && e.progress > 0).length
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-2xl text-dark">My Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Track your learning progress and achievements</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="fa-book-open" label="Enrolled Courses" value={enrollments.length} color="blue" />
        <StatCard icon="fa-circle-check" label="Completed" value={completed} color="green" />
        <StatCard icon="fa-fire" label="In Progress" value={inProgress} color="orange" />
        <StatCard icon="fa-chart-line" label="Avg Progress" value={`${avgProgress}%`} color="purple" />
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-dark">Continue Learning</h2>
          <button onClick={() => navigate('/courses')} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
            Browse courses <i className="fa-solid fa-arrow-right text-xs" />
          </button>
        </div>

        {enrollments.filter((e) => !e.completed).length === 0 ? (
          <EmptyState
            icon="fa-book-open"
            title="No courses yet"
            description="Enroll in your first course to start learning"
            action={<button onClick={() => navigate('/courses')} className="btn-primary">Browse Courses</button>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {enrollments.filter((e) => !e.completed && e.courseId).map((enrollment) => (
              <div key={enrollment._id} className="card cursor-pointer hover:shadow-card-hover transition-all"
                onClick={() => navigate(`/learn/${enrollment.courseId._id}`)}>
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/80 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-book-open text-white text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-dark text-sm mb-1 line-clamp-1">
                      {enrollment.courseId.title}
                    </h3>
                    <div className="text-xs text-gray-400 mb-2">{enrollment.courseId.category}</div>
                    <ProgressBar value={enrollment.progress} />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{enrollment.progress}% complete</span>
                      <span className="text-primary font-semibold flex items-center gap-1">
                        Continue <i className="fa-solid fa-arrow-right" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div>
          <h2 className="font-heading font-bold text-lg text-dark mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((course) => (
              <CourseCard key={course._id} course={course} onClick={() => navigate(`/courses/${course._id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Internships */}
      {internships.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-dark">Internship Opportunities</h2>
            <button onClick={() => navigate('/internships')} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              View all <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {internships.map((item) => (
              <div key={item._id} className="card hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <i className="fa-solid fa-building text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-dark">{item.title}</h3>
                    <div className="text-xs text-gray-400">{item.company}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge bg-blue-50 text-blue-600">{item.type}</span>
                  <span className="badge bg-gray-100 text-gray-500 flex items-center gap-1">
                    <i className="fa-solid fa-location-dot text-xs" /> {item.location}
                  </span>
                </div>
                <a href={item.applyUrl || '#'} target="_blank" rel="noreferrer"
                  className="btn-accent w-full text-center block text-sm py-2">
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
