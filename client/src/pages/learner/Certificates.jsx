import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PageLoader, EmptyState } from '../../components/common'
import api from '../../services/api'

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/certificates/${user._id}`)
      .then(({ data }) => setCerts(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const downloadCert = (cert) => {
    if (!cert.certificateUrl) return alert('Certificate not available for download yet.')
    const link = document.createElement('a')
    link.href = cert.certificateUrl
    link.download = `certificate-${cert.certificateId || cert._id}.pdf`
    link.click()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-dark">My Certificates</h1>
        <p className="text-gray-400 text-sm mt-1">Your earned certificates of completion</p>
      </div>

      {certs.length === 0 ? (
        <EmptyState
          icon="fa-trophy"
          title="No certificates yet"
          description="Complete a course to earn your first certificate"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <div key={cert._id} className="card border border-yellow-100 hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-trophy text-yellow-500 text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-dark">{cert.courseId?.title || 'Course'}</h3>
                  <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-tag text-xs" /> {cert.courseId?.category}
                  </div>
                  <div className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-calendar text-xs" />
                    Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  {cert.certificateId && (
                    <div className="text-xs text-gray-300 font-mono mt-0.5 flex items-center gap-1">
                      <i className="fa-solid fa-fingerprint text-xs" /> {cert.certificateId}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => downloadCert(cert)} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                  <i className="fa-solid fa-download" /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
