import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/common'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'tutor') navigate('/tutor')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // const fillDemo = (role) => {
  //   const demos = {
  //     learner: { email: 'learner@demo.com', password: 'password123' },
  //     tutor: { email: 'tutor@demo.com', password: 'password123' },
  //     admin: { email: 'admin@demo.com', password: 'password123' },
  //   }
  //   setForm(demos[role])
  // }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <i className="fa-solid fa-graduation-cap text-xl" />
          </div>
          <span className="text-white font-heading font-bold text-xl">SkillBridge</span>
        </div>
        <div>
          <h1 className="text-white font-heading font-bold text-4xl leading-tight mb-4">
            Learn skills.<br />Earn certificates.<br />Get internships.
          </h1>
          <p className="text-blue-100 text-lg font-body">
            Join thousands of learners building their careers with SkillBridge LMS.
          </p>
        </div>
        <div className="flex gap-8 text-white">
          {[['10k+', 'Learners'], ['500+', 'Courses'], ['200+', 'Internships']].map(([val, label]) => (
            <div key={label}>
              <div className="font-heading font-bold text-2xl">{val}</div>
              <div className="text-blue-200 text-sm">{label}</div>
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
            <h2 className="font-heading font-bold text-3xl text-dark mb-2">Welcome back</h2>
            <p className="text-gray-400 font-body">Sign in to continue learning</p>
          </div>

          {/* <div className="mb-6">
            <p className="text-xs text-gray-400 font-heading font-semibold uppercase tracking-wide mb-2">Quick demo login</p>
            <div className="flex gap-2">
              {['learner', 'tutor', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-heading font-semibold text-gray-500 hover:border-primary hover:text-primary transition-colors capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div> */}

          <form onSubmit={submit} className="space-y-4">
            <Alert type="error" message={error} />

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-envelope text-sm" />
                </span>
                <input name="email" type="email" required className="input pl-10"
                  placeholder="you@example.com" value={form.email} onChange={handle} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-lock text-sm" />
                </span>
                <input name="password" type={showPass ? 'text' : 'password'} required
                  className="input pl-10 pr-10" placeholder="Enter your password"
                  value={form.password} onChange={handle} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> Signing in...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket" /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6 font-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
