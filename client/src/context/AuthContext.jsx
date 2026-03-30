import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sb_token')
    if (!token) {
      setLoading(false)
      return
    }

    const stored = localStorage.getItem('sb_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    const fetchCurrentUser = async () => {
      try {
        const { data } = await api.get('/auth/me')
        if (data?.user) {
          setUser(data.user)
          localStorage.setItem('sb_user', JSON.stringify(data.user))
        }
      } catch (err) {
        console.error('Failed to refresh current user:', err?.response?.data?.message || err.message)
        localStorage.removeItem('sb_token')
        localStorage.removeItem('sb_user')
        setUser(null)
        delete api.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sb_token', data.token)
    localStorage.setItem('sb_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role })
    localStorage.setItem('sb_token', data.token)
    localStorage.setItem('sb_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('sb_token')
    localStorage.removeItem('sb_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
