import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { StatCard, PageLoader, EmptyState, Alert } from '../../components/common'
import api from '../../services/api'

export default function TutorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [coursesRes, earningsRes] = await Promise.all([
        api.get('/courses/tutor/my'),
        api.get('/payments/tutor-earnings'),
      ])
      setCourses(coursesRes.data)
      setEarnings(earningsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    try {
      await api.delete(`/courses/${id}`)
      setCourses(courses.filter((c) => c._id !== id))
    } catch { alert('Failed to delete course.') }
  }

  if (loading) return <PageLoader />

  const approved = courses.filter((c) => c.approved).length
  const pending = courses.filter((c) => !c.approved).length

  const levelColors = {
    Beginner: 'bg-green-50 text-green-700',
    Intermediate: 'bg-yellow-50 text-yellow-700',
    Advanced: 'bg-red-50 text-red-700',
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-dark">Tutor Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your courses and track earnings</p>
        </div>
        <button onClick={() => navigate('/tutor/create-course')} className="btn-primary flex items-center gap-2">
          <i className="fa-solid fa-circle-plus" /> Create Course
        </button>
      </div>

      {!user.approved && (
        <Alert type="warning" message="Your tutor account is pending admin approval. You can create courses but they will not be visible to learners until approved." />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="fa-book-open" label="Total Courses" value={courses.length} color="blue" />
        <StatCard icon="fa-circle-check" label="Approved" value={approved} color="green" />
        <StatCard icon="fa-clock" label="Pending Review" value={pending} color="orange" />
        <StatCard icon="fa-users" label="Total Students" value={courses.reduce((s, c) => s + (c.totalStudents || 0), 0)} color="purple" />
      </div>

      {/* Earnings Summary */}
      {earnings && (
        <div>
          <h2 className="font-heading font-bold text-lg text-dark mb-4 flex items-center gap-2">
            <i className="fa-solid fa-dollar-sign text-accent" /> Earnings Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card border-l-4 border-accent">
              <div className="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-wallet text-accent" /> Total Earnings (95%)
              </div>
              <div className="text-3xl font-heading font-bold text-dark">${earnings.totalEarnings.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">{earnings.totalSales} paid enrollment{earnings.totalSales !== 1 ? 's' : ''}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-chart-bar text-primary" /> Total Sales
              </div>
              <div className="text-3xl font-heading font-bold text-dark">{earnings.totalSales}</div>
              <div className="text-xs text-gray-400 mt-1">Enrollments via payment</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-star text-yellow-500" /> Top Course
              </div>
              <div className="text-base font-heading font-bold text-dark line-clamp-1">
                {earnings.perCourse.sort((a, b) => b.earnings - a.earnings)[0]?.title || '—'}
              </div>
              <div className="text-xs text-accent font-semibold mt-1">
                ${earnings.perCourse.sort((a, b) => b.earnings - a.earnings)[0]?.earnings?.toFixed(2) || '0.00'} earned
              </div>
            </div>
          </div>

          {/* Per-course earnings */}
          {earnings.perCourse.some((c) => c.sales > 0) && (
            <div className="card p-0 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 bg-surface">
                <h3 className="font-heading font-semibold text-dark flex items-center gap-2">
                  <i className="fa-solid fa-table text-primary" /> Earnings per Course
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      {['Course', 'Price', 'Sales', 'Students', 'Your Earnings (95%)'].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {earnings.perCourse.map((c) => (
                      <tr key={c.courseId} className="hover:bg-surface/50">
                        <td className="px-6 py-4 font-body text-sm text-dark font-medium">{c.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{c.sales}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{c.totalStudents}</td>
                        <td className="px-6 py-4">
                          <span className="font-heading font-bold text-accent">${c.earnings.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent payments */}
          {earnings.recentPayments?.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-dark mb-3 flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-primary" /> Recent Enrollments
              </h3>
              <div className="space-y-2">
                {earnings.recentPayments.map((p) => (
                  <div key={p._id} className="card flex items-center gap-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-user text-accent text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-sm text-dark">{p.userId?.name || 'Learner'}</div>
                      <div className="text-xs text-gray-400 truncate">{p.courseId?.title}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-heading font-bold text-accent text-sm">+${(p.tutorEarning || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Courses table */}
      <div>
        <h2 className="font-heading font-bold text-lg text-dark mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <EmptyState
            icon="fa-pen-to-square"
            title="No courses yet"
            description="Create your first course and start teaching"
            action={
              <button onClick={() => navigate('/tutor/create-course')} className="btn-primary flex items-center gap-2">
                <i className="fa-solid fa-circle-plus" /> Create Your First Course
              </button>
            }
          />
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-surface">
                    {['Course', 'Category', 'Level', 'Price', 'Students', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/70 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-book-open text-white text-sm" />
                          </div>
                          <div>
                            <div className="font-heading font-semibold text-sm text-dark line-clamp-1">{course.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <i className="fa-regular fa-calendar text-xs" />
                              {new Date(course.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm text-gray-500">{course.category}</span></td>
                      <td className="px-6 py-4"><span className={`badge ${levelColors[course.level]}`}>{course.level}</span></td>
                      <td className="px-6 py-4">
                        <span className="font-heading font-semibold text-dark text-sm">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <i className="fa-solid fa-user text-xs text-gray-300" /> {course.totalStudents || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {course.approved
                          ? <span className="badge bg-accent/10 text-accent flex items-center gap-1 w-fit"><i className="fa-solid fa-circle-check text-xs" /> Live</span>
                          : <span className="badge bg-yellow-50 text-yellow-600 flex items-center gap-1 w-fit"><i className="fa-solid fa-clock text-xs" /> Pending</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDelete(course._id)} className="text-gray-300 hover:text-danger transition-colors text-sm flex items-center gap-1">
                          <i className="fa-solid fa-trash text-xs" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
