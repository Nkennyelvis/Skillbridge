// Spinner
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return <div className={`${sizes[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  )
}

export function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-primary/10 text-primary',
    green: 'bg-accent/10 text-accent',
    orange: 'bg-orange-100 text-orange-500',
    purple: 'bg-purple-100 text-purple-500',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${colors[color]}`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <div className="text-2xl font-heading font-bold text-dark">{value}</div>
        <div className="text-sm font-body text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export function CourseCard({ course, onClick }) {
  const levelColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  }
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 p-0 overflow-hidden group"
    >
      <div className="h-40 bg-gradient-to-br from-primary/80 to-blue-600 relative flex items-center justify-center">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <i className="fa-solid fa-book-open text-white/70 text-5xl" />
        )}
        <div className="absolute top-3 left-3">
          <span className={`badge ${levelColors[course.level] || 'bg-gray-100 text-gray-600'}`}>{course.level}</span>
        </div>
        {course.price === 0 && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-accent text-white">Free</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="text-xs text-primary font-semibold font-heading uppercase tracking-wide mb-1">{course.category}</div>
        <h3 className="font-heading font-bold text-dark text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <div className="text-sm text-gray-400 mb-3 font-body">
          by {course.tutorName || course.tutorId?.name || 'Instructor'}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <i className="fa-solid fa-star text-yellow-400 text-xs" />
            <span className="font-semibold text-dark">{course.rating?.toFixed(1) || '4.5'}</span>
            <span className="text-gray-400">({course.totalStudents || 0})</span>
          </div>
          <div className="font-heading font-bold text-primary text-lg">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProgressBar({ value, color = 'bg-primary' }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full progress-bar ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export function EmptyState({ icon = 'fa-inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <i className={`fa-solid ${icon} text-gray-400 text-2xl`} />
      </div>
      <h3 className="font-heading font-bold text-dark text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-5">{description}</p>
      {action}
    </div>
  )
}

export function Alert({ type = 'error', message }) {
  if (!message) return null
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }
  const icons = {
    error: 'fa-circle-xmark',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
  }
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-body ${styles[type]}`}>
      <i className={`fa-solid ${icons[type]}`} />
      {message}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-heading font-bold text-dark text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-dark w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
