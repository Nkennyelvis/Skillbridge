import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/common'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'learner' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password, form.role)
      if (user.role === 'tutor') navigate('/tutor')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent to-green-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <i className="fa-solid fa-graduation-cap text-xl" />
          </div>
          <span className="text-white font-heading font-bold text-xl">SkillBridge</span>
        </div>
        <div>
          <h1 className="text-white font-heading font-bold text-4xl leading-tight mb-4">
            Start your<br />learning journey<br />today.
          </h1>
          <p className="text-green-100 text-lg font-body">
            Create your free account and access hundreds of courses taught by industry experts.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: 'fa-certificate', text: 'Earn verified certificates' },
            { icon: 'fa-briefcase', text: 'Get internship recommendations' },
            { icon: 'fa-play-circle', text: 'Learn at your own pace' },
            { icon: 'fa-chart-line', text: 'Track your progress' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-white text-sm">
              <i className={`fa-solid ${icon} w-4`} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <span className="font-heading font-bold text-dark text-xl">SkillBridge</span>
          </div>

          <div className="mb-8">
            <h2 className="font-heading font-bold text-3xl text-dark mb-2">Create your account</h2>
            <p className="text-gray-400 font-body">Join SkillBridge for free</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Alert type="error" message={error} />

            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-user text-sm" />
                </span>
                <input name="name" required className="input pl-10" placeholder="Alex Johnson"
                  value={form.name} onChange={handle} />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-envelope text-sm" />
                </span>
                <input name="email" type="email" required className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={handle} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-lock text-sm" />
                </span>
                <input name="password" type="password" required className="input pl-10"
                  placeholder="Min. 6 characters" value={form.password} onChange={handle} />
              </div>
            </div>

            <div>
              <label className="label">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'learner', icon: 'fa-user-graduate', label: 'Learner', desc: 'Take courses & earn certificates' },
                  { value: 'tutor', icon: 'fa-chalkboard-user', label: 'Tutor', desc: 'Create & sell courses' },
                ].map((opt) => (
                  <button type="button" key={opt.value}
                    onClick={() => setForm({ ...form, role: opt.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.role === opt.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className={`fa-solid ${opt.icon} text-xl mb-2 block ${form.role === opt.value ? 'text-primary' : 'text-gray-400'}`} />
                    <div className={`font-heading font-semibold text-sm ${form.role === opt.value ? 'text-primary' : 'text-dark'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
              {form.role === 'tutor' && (
                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mt-2">
                  <i className="fa-solid fa-triangle-exclamation mt-0.5" />
                  Tutor accounts require admin approval before you can publish courses.
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> Creating account...</>
              ) : (
                <><i className="fa-solid fa-user-plus" /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
