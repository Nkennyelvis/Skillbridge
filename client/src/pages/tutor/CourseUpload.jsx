import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../../components/common'
import api from '../../services/api'

const CATEGORIES = ['Development', 'Design', 'Data Science', 'Business', 'Marketing', 'AI & ML', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const STEPS = [
  { label: 'Course Info', icon: 'fa-circle-info' },
  { label: 'Lessons', icon: 'fa-list' },
  { label: 'Quiz', icon: 'fa-clipboard-question' },
  { label: 'Review', icon: 'fa-magnifying-glass' },
]

export default function CourseUpload() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [courseData, setCourseData] = useState({
    title: '', description: '', price: '', category: '', level: 'Beginner', thumbnail: '',
  })
  const [lessons, setLessons] = useState([{ title: '', videoUrl: '', duration: '', order: 1 }])
  const [quizTitle, setQuizTitle] = useState('')
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
  ])

  const updateCourse = (e) => setCourseData({ ...courseData, [e.target.name]: e.target.value })
  const addLesson = () => setLessons([...lessons, { title: '', videoUrl: '', duration: '', order: lessons.length + 1 }])
  const updateLesson = (i, field, val) => { const u = [...lessons]; u[i][field] = val; setLessons(u) }
  const removeLesson = (i) => setLessons(lessons.filter((_, idx) => idx !== i))
  const addQuestion = () => setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }])
  const updateQuestion = (qi, field, val) => { const u = [...questions]; u[qi][field] = val; setQuestions(u) }
  const updateOption = (qi, oi, val) => { const u = [...questions]; u[qi].options[oi] = val; setQuestions(u) }
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const { data: course } = await api.post('/courses', { ...courseData, price: parseFloat(courseData.price) || 0 })
      await Promise.all(lessons.filter((l) => l.title.trim()).map((l, i) =>
        api.post('/lessons', { ...l, courseId: course._id, order: i + 1 })
      ))
      const validQs = questions.filter((q) => q.question.trim())
      if (quizTitle && validQs.length > 0) {
        await api.post('/quizzes', { courseId: course._id, title: quizTitle, questions: validQs })
      }
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card max-w-md w-full text-center py-12 space-y-6">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <i className="fa-solid fa-circle-check text-accent text-5xl" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-dark mb-2">Course Submitted!</h2>
            <p className="text-gray-400 text-sm">Your course has been submitted for admin review. It will go live once approved.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/tutor')} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <i className="fa-solid fa-house" /> Back to Dashboard
            </button>
            <button onClick={() => { setSuccess(false); setStep(0); setCourseData({ title: '', description: '', price: '', category: '', level: 'Beginner', thumbnail: '' }); setLessons([{ title: '', videoUrl: '', duration: '', order: 1 }]) }}
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-plus" /> Create Another Course
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-dark">Create New Course</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in the details to publish your course</p>
      </div>

      {/* Stepper */}
      <div className="card py-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                  i < step ? 'bg-accent text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <i className="fa-solid fa-check text-xs" /> : <i className={`fa-solid ${s.icon} text-xs`} />}
                </div>
                <span className={`text-xs mt-1 font-heading font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-accent' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>
      </div>

      <Alert type="error" message={error} />

      {/* Step 0: Course Info */}
      {step === 0 && (
        <div className="card space-y-5">
          <h2 className="font-heading font-bold text-lg text-dark flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-primary" /> Course Information
          </h2>
          <div>
            <label className="label">Course Title *</label>
            <input name="title" className="input" placeholder="e.g. Complete React Development Bootcamp"
              value={courseData.title} onChange={updateCourse} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea name="description" rows={4} className="input resize-none"
              placeholder="What will students learn in this course?"
              value={courseData.description} onChange={updateCourse} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select name="category" className="input" value={courseData.category} onChange={updateCourse}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level *</label>
              <select name="level" className="input" value={courseData.level} onChange={updateCourse}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-dollar-sign text-sm" />
                </span>
                <input name="price" type="number" min="0" step="0.01" className="input pl-9"
                  placeholder="0 for free" value={courseData.price} onChange={updateCourse} />
              </div>
            </div>
            <div>
              <label className="label">Thumbnail URL</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-image text-sm" />
                </span>
                <input name="thumbnail" className="input pl-9" placeholder="https://..."
                  value={courseData.thumbnail} onChange={updateCourse} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Lessons */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-heading font-bold text-lg text-dark flex items-center gap-2 mb-1">
              <i className="fa-solid fa-list text-primary" /> Course Lessons
            </h2>
            <p className="text-sm text-gray-400">Add the lessons that make up your course. Use YouTube embed URLs for videos.</p>
          </div>
          {lessons.map((lesson, i) => (
            <div key={i} className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-dark text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  Lesson {i + 1}
                </h3>
                {lessons.length > 1 && (
                  <button onClick={() => removeLesson(i)} className="text-danger text-xs hover:underline flex items-center gap-1">
                    <i className="fa-solid fa-trash text-xs" /> Remove
                  </button>
                )}
              </div>
              <div>
                <label className="label">Lesson Title *</label>
                <input className="input" placeholder="e.g. Introduction to React Hooks"
                  value={lesson.title} onChange={(e) => updateLesson(i, 'title', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Video URL</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fa-brands fa-youtube text-sm" />
                    </span>
                    <input className="input pl-9" placeholder="https://youtube.com/embed/..."
                      value={lesson.videoUrl} onChange={(e) => updateLesson(i, 'videoUrl', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fa-regular fa-clock text-sm" />
                    </span>
                    <input className="input pl-9" placeholder="e.g. 12:30"
                      value={lesson.duration} onChange={(e) => updateLesson(i, 'duration', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addLesson} className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2">
            <i className="fa-solid fa-circle-plus" /> Add Another Lesson
          </button>
        </div>
      )}

      {/* Step 2: Quiz */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-heading font-bold text-lg text-dark flex items-center gap-2">
              <i className="fa-solid fa-clipboard-question text-primary" /> Course Quiz
            </h2>
            <p className="text-sm text-gray-400">Optional — add a quiz to test your students knowledge.</p>
            <div>
              <label className="label">Quiz Title</label>
              <input className="input" placeholder="e.g. Final Assessment"
                value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
            </div>
          </div>
          {questions.map((q, qi) => (
            <div key={qi} className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-dark text-sm flex items-center gap-2">
                  <i className="fa-solid fa-circle-question text-primary" /> Question {qi + 1}
                </h3>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qi)} className="text-danger text-xs hover:underline flex items-center gap-1">
                    <i className="fa-solid fa-trash text-xs" /> Remove
                  </button>
                )}
              </div>
              <div>
                <label className="label">Question</label>
                <input className="input" placeholder="Enter your question"
                  value={q.question} onChange={(e) => updateQuestion(qi, 'question', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="label">Options (select the correct answer)</label>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-3">
                    <input type="radio" name={`correct-${qi}`}
                      checked={q.correctAnswer === oi}
                      onChange={() => updateQuestion(qi, 'correctAnswer', oi)}
                      className="accent-primary" />
                    <input className="input" placeholder={`Option ${oi + 1}`}
                      value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} />
                  </div>
                ))}
              </div>
              <div>
                <label className="label">Explanation (optional)</label>
                <input className="input" placeholder="Why is this the correct answer?"
                  value={q.explanation} onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)} />
              </div>
            </div>
          ))}
          <button onClick={addQuestion} className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2">
            <i className="fa-solid fa-circle-plus" /> Add Question
          </button>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="card space-y-6">
          <h2 className="font-heading font-bold text-lg text-dark flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass text-primary" /> Review & Submit
          </h2>
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-surface space-y-2">
              <div className="font-heading font-semibold text-dark text-base">{courseData.title}</div>
              <div className="text-gray-400">{courseData.description}</div>
              <div className="flex gap-2 flex-wrap mt-2">
                <span className="badge bg-primary/10 text-primary">{courseData.category}</span>
                <span className="badge bg-gray-100 text-gray-500">{courseData.level}</span>
                <span className="badge bg-accent/10 text-accent">
                  {courseData.price === '0' || !courseData.price ? 'Free' : `$${courseData.price}`}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 flex items-center gap-2"><i className="fa-solid fa-list text-gray-300" /> Lessons</span>
              <span className="font-semibold text-dark">{lessons.filter((l) => l.title).length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 flex items-center gap-2"><i className="fa-solid fa-clipboard-question text-gray-300" /> Quiz questions</span>
              <span className="font-semibold text-dark">{quizTitle ? questions.filter((q) => q.question).length : 'None'}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
              <i className="fa-solid fa-triangle-exclamation mt-0.5" />
              After submission, your course will be reviewed by an admin before going live.
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2">
            <i className="fa-solid fa-arrow-left" /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => {
            if (step === 0 && (!courseData.title || !courseData.description || !courseData.category)) {
              setError('Please fill in all required course fields.'); return
            }
            setError(''); setStep(step + 1)
          }} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            Next <i className="fa-solid fa-arrow-right" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-3 text-base flex items-center justify-center gap-2">
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Submitting...</> : <><i className="fa-solid fa-paper-plane" /> Submit Course</>}
          </button>
        )}
      </div>
    </div>
  )
}
