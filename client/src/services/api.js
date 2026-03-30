import axios from 'axios'

// In production VITE_API_URL is set on Vercel
// In development it falls back to the Vite proxy at /api
const baseURL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout — needed for Render free tier wake-up
})

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sb_token')
      localStorage.removeItem('sb_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
