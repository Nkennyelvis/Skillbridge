import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CourseCard, PageLoader, EmptyState } from '../../components/common'
import api from '../../services/api'

const CATEGORIES = ['All', 'Development', 'Design', 'Data Science', 'Business', 'Marketing', 'AI & ML']
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function CoursesMarketplace() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')

  useEffect(() => { loadCourses() }, [])

  useEffect(() => {
    let result = courses
    if (search) result = result.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All') result = result.filter((c) => c.category === category)
    if (level !== 'All') result = result.filter((c) => c.level === level)
    setFiltered(result)
  }, [courses, search, category, level])

  const loadCourses = async () => {
    try {
      const { data } = await api.get('/courses')
      setCourses(data)
      setFiltered(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-dark">Course Marketplace</h1>
        <p className="text-gray-400 text-sm mt-1">Explore {courses.length} courses taught by experts</p>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <i className="fa-solid fa-magnifying-glass text-sm" />
        </span>
        <input className="input pl-11" placeholder="Search courses by title, topic, or skill…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-filter text-xs" /> Category
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold border transition-all ${
                  category === cat ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-layer-group text-xs" /> Level
          </div>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold border transition-all ${
                  level === l ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400 font-body">
        Showing <span className="font-semibold text-dark">{filtered.length}</span> courses
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="fa-magnifying-glass" title="No courses found" description="Try a different search term or filter" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard key={course._id} course={course} onClick={() => navigate(`/courses/${course._id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
