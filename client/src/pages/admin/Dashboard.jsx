import { useState, useEffect } from 'react'
import { StatCard, PageLoader, Modal } from '../../components/common'
import api from '../../services/api'

const TABS = [
  { label: 'Overview', icon: 'fa-chart-pie' },
  { label: 'Pending Tutors', icon: 'fa-user-clock' },
  { label: 'Pending Courses', icon: 'fa-book-medical' },
  { label: 'Users', icon: 'fa-users' },
  { label: 'Internships', icon: 'fa-briefcase' },
  { label: 'Revenue', icon: 'fa-dollar-sign' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState(0)
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [pendingTutors, setPendingTutors] = useState([])
  const [pendingCourses, setPendingCourses] = useState([])
  const [users, setUsers] = useState([])
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [internModal, setInternModal] = useState(false)
  const [newIntern, setNewIntern] = useState({
    title: '', company: '', location: '', type: 'Remote', skillCategory: '', description: '', applyUrl: ''
  })

  useEffect(() => { loadAll() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadAll = async () => {
    try {
      const [statsRes, tutorsRes, coursesRes, usersRes, internRes, revenueRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-tutors'),
        api.get('/admin/pending-courses'),
        api.get('/admin/users'),
        api.get('/internships'),
        api.get('/payments/admin-revenue'),
      ])
      setStats(statsRes.data)
      setRevenue(revenueRes.data)
      setPendingTutors(tutorsRes.data)
      setPendingCourses(coursesRes.data)
      setUsers(usersRes.data)
      setInternships(internRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const approveTutor = async (id) => {
    try {
      await api.put(`/admin/approve-tutor/${id}`)
      setPendingTutors(pendingTutors.filter((t) => t._id !== id))
      showToast('Tutor approved successfully')
    } catch { showToast('Failed to approve tutor') }
  }

  const approveCourse = async (id) => {
    try {
      await api.put(`/admin/approve-course/${id}`)
      setPendingCourses(pendingCourses.filter((c) => c._id !== id))
      showToast('Course approved and published')
    } catch { showToast('Failed to approve course') }
  }

  const createInternship = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/internships', newIntern)
      setInternships([data, ...internships])
      setInternModal(false)
      setNewIntern({ title: '', company: '', location: '', type: 'Remote', skillCategory: '', description: '', applyUrl: '' })
      showToast('Internship listing created')
    } catch { showToast('Failed to create internship') }
  }

  const deleteInternship = async (id) => {
    if (!confirm('Delete this internship listing?')) return
    try {
      await api.delete(`/internships/${id}`)
      setInternships(internships.filter((i) => i._id !== id))
      showToast('Internship deleted')
    } catch { showToast('Failed to delete') }
  }

  if (loading) return <PageLoader />

  const roleColors = {
    learner: 'bg-blue-50 text-blue-600',
    tutor: 'bg-green-50 text-green-600',
    admin: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-dark text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-heading font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-accent" /> {toast}
        </div>
      )}

      <div>
        <h1 className="font-heading font-bold text-2xl text-dark">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Manage the SkillBridge platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-2xl p-1 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              tab === i ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-dark'
            }`}>
            <i className={`fa-solid ${t.icon} text-xs`} />
            {t.label}
            {i === 1 && pendingTutors.length > 0 && (
              <span className="bg-danger text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingTutors.length}</span>
            )}
            {i === 2 && pendingCourses.length > 0 && (
              <span className="bg-danger text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingCourses.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Overview ── */}
      {tab === 0 && stats && revenue && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="fa-user-graduate" label="Total Learners" value={stats.learners} color="blue" />
            <StatCard icon="fa-chalkboard-user" label="Total Tutors" value={stats.tutors} color="green" />
            <StatCard icon="fa-book-open" label="Total Courses" value={stats.courses} color="orange" />
            <StatCard icon="fa-clipboard-list" label="Enrollments" value={stats.enrollments} color="purple" />
          </div>

          {/* Revenue cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card border-l-4 border-primary">
              <div className="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-globe text-primary" /> Gross Platform Revenue
              </div>
              <div className="text-3xl font-heading font-bold text-dark">${revenue.totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">{revenue.totalTransactions} total transactions</div>
            </div>
            <div className="card border-l-4 border-accent">
              <div className="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-building-columns text-accent" /> Platform Fee (5%)
              </div>
              <div className="text-3xl font-heading font-bold text-accent">${revenue.totalPlatformFee.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">Admin earnings</div>
            </div>
            <div className="card border-l-4 border-yellow-400">
              <div className="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-chalkboard-user text-yellow-500" /> Tutor Payouts (95%)
              </div>
              <div className="text-3xl font-heading font-bold text-yellow-600">${revenue.totalTutorPayout.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">Paid to tutors</div>
            </div>
          </div>

          {/* Action Required */}
          <div className="card">
            <h3 className="font-heading font-semibold text-dark mb-4 flex items-center gap-2">
              <i className="fa-solid fa-bell text-warning" /> Action Required
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setTab(1)}>
                <span className="text-sm font-heading font-semibold text-yellow-700 flex items-center gap-2">
                  <i className="fa-solid fa-user-clock" /> Pending Tutors
                </span>
                <span className="badge bg-yellow-200 text-yellow-700">{pendingTutors.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setTab(2)}>
                <span className="text-sm font-heading font-semibold text-blue-700 flex items-center gap-2">
                  <i className="fa-solid fa-book-medical" /> Pending Courses
                </span>
                <span className="badge bg-blue-100 text-blue-700">{pendingCourses.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 1: Pending Tutors ── */}
      {tab === 1 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-dark">Pending Tutor Applications ({pendingTutors.length})</h2>
          {pendingTutors.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <i className="fa-solid fa-circle-check text-4xl text-accent mb-3 block" />
              <p className="font-heading font-semibold">All caught up! No pending tutor applications.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTutors.map((tutor) => (
                <div key={tutor._id} className="card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {tutor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-dark">{tutor.name}</div>
                    <div className="text-sm text-gray-400 truncate flex items-center gap-1">
                      <i className="fa-solid fa-envelope text-xs" /> {tutor.email}
                    </div>
                    <div className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                      <i className="fa-regular fa-calendar text-xs" /> {new Date(tutor.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={() => approveTutor(tutor._id)} className="btn-accent text-sm py-2 px-4 flex-shrink-0 flex items-center gap-1.5">
                    <i className="fa-solid fa-check" /> Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Pending Courses ── */}
      {tab === 2 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-dark">Courses Pending Review ({pendingCourses.length})</h2>
          {pendingCourses.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <i className="fa-solid fa-circle-check text-4xl text-accent mb-3 block" />
              <p className="font-heading font-semibold">No courses pending review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCourses.map((course) => (
                <div key={course._id} className="card">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/70 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-book-open text-white text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-dark">{course.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2 items-center">
                        <span className="badge bg-primary/10 text-primary">{course.category}</span>
                        <span className="badge bg-gray-100 text-gray-500">{course.level}</span>
                        <span className="badge bg-accent/10 text-accent">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <i className="fa-solid fa-chalkboard-user text-xs" /> {course.tutorId?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => approveCourse(course._id)} className="btn-primary text-sm py-2 px-4 flex-shrink-0 flex items-center gap-1.5">
                      <i className="fa-solid fa-rocket" /> Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Users ── */}
      {tab === 3 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-dark">All Users ({users.length})</h2>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-gray-100">
                    {['User', 'Email', 'Role', 'Status', 'Joined'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-heading font-medium text-sm text-dark">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                      <td className="px-6 py-4"><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                      <td className="px-6 py-4">
                        {u.role === 'tutor'
                          ? u.approved
                            ? <span className="badge bg-accent/10 text-accent flex items-center gap-1 w-fit"><i className="fa-solid fa-circle-check text-xs" /> Approved</span>
                            : <span className="badge bg-yellow-50 text-yellow-600 flex items-center gap-1 w-fit"><i className="fa-solid fa-clock text-xs" /> Pending</span>
                          : <span className="badge bg-gray-100 text-gray-400 w-fit">Active</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Internships ── */}
      {tab === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-dark">Internship Listings ({internships.length})</h2>
            <button onClick={() => setInternModal(true)} className="btn-primary flex items-center gap-2">
              <i className="fa-solid fa-circle-plus" /> Add Listing
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internships.map((item) => (
              <div key={item._id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <i className="fa-solid fa-building text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-dark text-sm">{item.title}</h3>
                      <div className="text-xs text-gray-400">{item.company} · {item.location}</div>
                      <div className="flex gap-2 mt-2">
                        <span className="badge bg-blue-50 text-blue-600 text-xs">{item.type}</span>
                        <span className="badge bg-gray-100 text-gray-500 text-xs">{item.skillCategory}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteInternship(item._id)} className="text-gray-300 hover:text-danger flex-shrink-0 transition-colors">
                    <i className="fa-solid fa-trash text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 5: Revenue ── */}
      {tab === 5 && revenue && (
        <div className="space-y-6">
          <h2 className="font-heading font-bold text-lg text-dark">Platform Revenue</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card border-l-4 border-primary text-center py-6">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-heading font-semibold mb-2 flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-money-bill-wave text-primary" /> Gross Revenue
              </div>
              <div className="text-4xl font-heading font-bold text-dark">${revenue.totalRevenue.toFixed(2)}</div>
            </div>
            <div className="card border-l-4 border-accent text-center py-6">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-heading font-semibold mb-2 flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-building-columns text-accent" /> Admin Earnings (5%)
              </div>
              <div className="text-4xl font-heading font-bold text-accent">${revenue.totalPlatformFee.toFixed(2)}</div>
            </div>
            <div className="card border-l-4 border-yellow-400 text-center py-6">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-heading font-semibold mb-2 flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-chalkboard-user text-yellow-500" /> Tutor Payouts (95%)
              </div>
              <div className="text-4xl font-heading font-bold text-yellow-600">${revenue.totalTutorPayout.toFixed(2)}</div>
            </div>
          </div>

          {/* Recent transactions */}
          {revenue.recentPayments?.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-surface flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-primary" />
                <h3 className="font-heading font-semibold text-dark">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      {['Learner', 'Course', 'Amount', 'Platform Fee (5%)', 'Tutor Payout (95%)', 'Date'].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {revenue.recentPayments.map((p) => (
                      <tr key={p._id} className="hover:bg-surface/50">
                        <td className="px-6 py-4 text-sm font-medium text-dark">{p.userId?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[160px] truncate">{p.courseId?.title || '—'}</td>
                        <td className="px-6 py-4 font-heading font-bold text-dark text-sm">${p.amount?.toFixed(2)}</td>
                        <td className="px-6 py-4 font-heading font-semibold text-accent text-sm">+${p.platformFee?.toFixed(2)}</td>
                        <td className="px-6 py-4 font-heading font-semibold text-yellow-600 text-sm">${p.tutorEarning?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {revenue.recentPayments?.length === 0 && (
            <div className="card text-center py-16 text-gray-400">
              <i className="fa-solid fa-receipt text-4xl mb-3 block" />
              <p className="font-heading font-semibold">No transactions yet</p>
              <p className="text-sm mt-1">Revenue will appear here once learners enroll in paid courses</p>
            </div>
          )}
        </div>
      )}

      {/* Add Internship Modal */}
      <Modal open={internModal} onClose={() => setInternModal(false)} title="Add Internship Listing">
        <form onSubmit={createInternship} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title *</label>
              <input required className="input" placeholder="Frontend Intern"
                value={newIntern.title} onChange={(e) => setNewIntern({ ...newIntern, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Company *</label>
              <input required className="input" placeholder="Acme Corp"
                value={newIntern.company} onChange={(e) => setNewIntern({ ...newIntern, company: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location *</label>
              <input required className="input" placeholder="Kigali, Rwanda"
                value={newIntern.location} onChange={(e) => setNewIntern({ ...newIntern, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={newIntern.type}
                onChange={(e) => setNewIntern({ ...newIntern, type: e.target.value })}>
                {['Remote', 'Onsite', 'Hybrid'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Skill Category *</label>
            <input required className="input" placeholder="e.g. Development, Design"
              value={newIntern.skillCategory} onChange={(e) => setNewIntern({ ...newIntern, skillCategory: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input resize-none" placeholder="Brief description"
              value={newIntern.description} onChange={(e) => setNewIntern({ ...newIntern, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Apply URL</label>
            <input className="input" placeholder="https://..."
              value={newIntern.applyUrl} onChange={(e) => setNewIntern({ ...newIntern, applyUrl: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <i className="fa-solid fa-circle-plus" /> Create Listing
          </button>
        </form>
      </Modal>
    </div>
  )
}
