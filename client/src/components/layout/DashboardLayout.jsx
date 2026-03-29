import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navByRole = {
  learner: [
    { label: 'Dashboard', icon: 'fa-house', path: '/dashboard' },
    { label: 'Courses', icon: 'fa-book-open', path: '/courses' },
    { label: 'Certificates', icon: 'fa-trophy', path: '/certificates' },
    { label: 'Internships', icon: 'fa-briefcase', path: '/internships' },
  ],
  tutor: [
    { label: 'Dashboard', icon: 'fa-house', path: '/tutor' },
    { label: 'Create Course', icon: 'fa-circle-plus', path: '/tutor/create-course' },
  ],
  admin: [
    { label: 'Dashboard', icon: 'fa-house', path: '/admin' },
  ],
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = navByRole[user?.role] || []

  const handleLogout = () => { logout(); navigate('/login') }

  const roleColors = {
    learner: 'bg-primary/10 text-primary',
    tutor: 'bg-accent/10 text-accent',
    admin: 'bg-orange-100 text-orange-600',
  }
  const roleLabel = { learner: 'Learner', tutor: 'Tutor', admin: 'Admin' }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <div>
              <div className="font-heading font-bold text-dark text-lg leading-none">SkillBridge</div>
              <div className="text-xs text-gray-400 font-body">Learning Platform</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-widest px-4 mb-3">Menu</div>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false) }}
              className={`sidebar-link w-full text-left ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon} w-4 text-center`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-semibold text-sm text-dark truncate">{user?.name}</div>
              <span className={`badge text-xs ${roleColors[user?.role]}`}>{roleLabel[user?.role]}</span>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-gray-400 hover:text-danger transition-colors">
              <i className="fa-solid fa-arrow-right-from-bracket" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-primary text-xl" onClick={() => setSidebarOpen(true)}>
            <i className="fa-solid fa-bars" />
          </button>
          <div className="hidden lg:block">
            <div className="text-sm text-gray-400 font-body">
              Welcome back, <span className="font-semibold text-dark">{user?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className={`badge px-3 py-1 ${roleColors[user?.role]} font-heading`}>{roleLabel[user?.role]}</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
