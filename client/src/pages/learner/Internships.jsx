import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PageLoader, EmptyState } from '../../components/common'
import api from '../../services/api'

export default function InternshipsPage() {
  const { user } = useAuth()
  const [internships, setInternships] = useState([])
  const [filtered, setFiltered] = useState([])
  const [completedCategories, setCompletedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = internships
    if (typeFilter !== 'All') result = result.filter((i) => i.type === typeFilter)
    setFiltered(result)
  }, [internships, typeFilter])

  const loadData = async () => {
    try {
      const [internRes, enrollRes] = await Promise.all([
        api.get('/internships'),
        api.get(`/enrollments/${user._id}`),
      ])
      setInternships(internRes.data)
      setFiltered(internRes.data)
      const cats = enrollRes.data
        .filter((e) => e.completed && e.courseId?.category)
        .map((e) => e.courseId.category)
      setCompletedCategories([...new Set(cats)])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const typeColors = {
    Remote: 'bg-blue-50 text-blue-600',
    Onsite: 'bg-purple-50 text-purple-600',
    Hybrid: 'bg-orange-50 text-orange-600',
  }

  const typeIcons = {
    Remote: 'fa-wifi',
    Onsite: 'fa-building',
    Hybrid: 'fa-code-merge',
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-dark">Internship Opportunities</h1>
        <p className="text-gray-400 text-sm mt-1">
          {completedCategories.length > 0
            ? `Showing opportunities matching your skills in: ${completedCategories.join(', ')}`
            : 'Complete courses to get personalized internship recommendations'}
        </p>
      </div>

      {completedCategories.length > 0 && (
        <div className="card bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-bullseye text-primary" />
            </div>
            <div>
              <div className="font-heading font-semibold text-dark text-sm">Personalized for You</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Based on your completed courses in: <span className="text-primary font-semibold">{completedCategories.join(' · ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <i className="fa-solid fa-filter text-xs" /> Filter by Type
        </div>
        <div className="flex gap-2">
          {['All', 'Remote', 'Onsite', 'Hybrid'].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold border transition-all flex items-center gap-1.5 ${
                typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
              }`}>
              {t !== 'All' && <i className={`fa-solid ${typeIcons[t]} text-xs`} />} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-400">
        Showing <span className="font-semibold text-dark">{filtered.length}</span> opportunities
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="fa-briefcase" title="No internships found" description="Check back soon for new opportunities" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isRecommended = completedCategories.some((cat) =>
              item.skillCategory?.toLowerCase().includes(cat.toLowerCase())
            )
            return (
              <div key={item._id} className={`card hover:shadow-card-hover transition-all group ${isRecommended ? 'border-accent/30 border' : ''}`}>
                {isRecommended && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-accent mb-3">
                    <i className="fa-solid fa-star text-xs" /> Recommended for you
                  </div>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <i className="fa-solid fa-building text-gray-400 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-dark text-sm leading-snug">{item.title}</h3>
                    <div className="text-sm text-gray-400 mt-0.5">{item.company}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <i className="fa-solid fa-location-dot text-gray-400 w-4 text-center" /> {item.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <i className="fa-solid fa-tags text-gray-400 w-4 text-center" /> {item.skillCategory}
                  </div>
                  {item.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <i className="fa-solid fa-calendar-day text-gray-400 w-4 text-center" />
                      Deadline: {new Date(item.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`badge flex items-center gap-1 ${typeColors[item.type] || 'bg-gray-100 text-gray-500'}`}>
                    <i className={`fa-solid ${typeIcons[item.type] || 'fa-circle'} text-xs`} /> {item.type}
                  </span>
                </div>

                {item.description && <p className="text-xs text-gray-400 mb-4 line-clamp-2">{item.description}</p>}

                <a href={item.applyUrl || '#'} target="_blank" rel="noreferrer"
                  className="btn-accent w-full text-center block text-sm py-2.5 flex items-center justify-center gap-2">
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs" /> Apply Now
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
