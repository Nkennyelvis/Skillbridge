// This page is no longer needed — payments are handled instantly inline on CourseDetail.
// Kept as a placeholder to avoid import errors. Redirects to dashboard.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
export default function PaymentSuccess() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/dashboard') }, [])
  return null
}
