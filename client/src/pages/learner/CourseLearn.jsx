import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader, ProgressBar } from '../../components/common'
import api from '../../services/api'

export default function CourseLearn() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [courseRes, lessonsRes, enrollRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/lessons/${id}`),
        api.get(`/enrollments/${user._id}`),
      ])
      setCourse(courseRes.data)
      setLessons(lessonsRes.data)
      setCurrentLesson(lessonsRes.data[0] || null)
      setEnrollment(enrollRes.data.find((e) => e.courseId?._id === id || e.courseId === id))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const markComplete = async (lessonId) => {
    if (!enrollment) return
    try {
      const { data } = await api.put(`/enrollments/${enrollment._id}/progress`, {
        lessonId, totalLessons: lessons.length,
      })
      setEnrollment(data)
      if (data.completed) alert('Congratulations! You completed the course! Your certificate is being generated.')
    } catch (err) { console.error(err) }
  }

  const loadQuiz = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}`)
      setQuiz(data); setQuizOpen(true); setAnswers({}); setQuizResult(null)
    } catch { alert('No quiz available for this course yet.') }
  }

  const submitQuiz = () => {
    if (!quiz) return
    let correct = 0
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++ })
    setQuizResult({ score: Math.round((correct / quiz.questions.length) * 100), correct, total: quiz.questions.length })
  }

  const isLessonCompleted = (lessonId) => enrollment?.completedLessons?.includes(lessonId)

  if (loading) return <PageLoader />
  if (!course) return <div className="text-center py-20 text-gray-400">Course not found or not enrolled.</div>

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate('/dashboard')} className="hover:text-primary flex items-center gap-1">
            <i className="fa-solid fa-arrow-left text-xs" /> Dashboard
          </button>
          <i className="fa-solid fa-chevron-right text-xs" />
          <span className="text-dark font-medium">{course.title}</span>
        </div>

        <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
          {currentLesson?.videoUrl ? (
            <iframe src={currentLesson.videoUrl} className="w-full h-full" allowFullScreen title={currentLesson.title} />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <i className="fa-solid fa-circle-play text-6xl" />
              <p className="text-sm">{currentLesson ? 'Video coming soon' : 'Select a lesson to start'}</p>
            </div>
          )}
        </div>

        {currentLesson && (
          <div className="card space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-dark">{currentLesson.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{course.title}</p>
              </div>
              <button onClick={() => markComplete(currentLesson._id)}
                disabled={isLessonCompleted(currentLesson._id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all flex items-center gap-2 ${
                  isLessonCompleted(currentLesson._id)
                    ? 'bg-accent/10 text-accent cursor-default'
                    : 'btn-accent'
                }`}>
                <i className={`fa-solid ${isLessonCompleted(currentLesson._id) ? 'fa-circle-check' : 'fa-check'}`} />
                {isLessonCompleted(currentLesson._id) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400 flex items-center gap-1">
                  <i className="fa-solid fa-chart-line text-xs" /> Course Progress
                </span>
                <span className="font-semibold text-dark">{enrollment?.progress || 0}%</span>
              </div>
              <ProgressBar value={enrollment?.progress || 0} />
            </div>

            {currentLesson.resources?.length > 0 && (
              <div>
                <h4 className="font-heading font-semibold text-sm text-dark mb-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-paperclip text-gray-400" /> Resources
                </h4>
                <div className="space-y-1">
                  {currentLesson.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <i className="fa-solid fa-file text-xs" /> {r.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button onClick={loadQuiz} className="btn-secondary text-sm flex items-center gap-2">
              <i className="fa-solid fa-clipboard-question" /> Take Quiz
            </button>
          </div>
        )}
      </div>

      {/* Lesson sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="card h-full">
          <h3 className="font-heading font-bold text-dark mb-2 flex items-center gap-2">
            <i className="fa-solid fa-list-ol text-primary" /> Course Content
          </h3>
          <div className="text-xs text-gray-400 mb-3">
            {enrollment?.completedLessons?.length || 0} / {lessons.length} lessons completed
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[60vh]">
            {lessons.map((lesson, i) => {
              const done = isLessonCompleted(lesson._id)
              const active = currentLesson?._id === lesson._id
              return (
                <button key={lesson._id} onClick={() => setCurrentLesson(lesson)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    active ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface'
                  }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    done ? 'bg-accent text-white' : active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {done ? <i className="fa-solid fa-check text-xs" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-body line-clamp-2 ${active ? 'text-primary font-semibold' : 'text-dark'}`}>
                      {lesson.title}
                    </div>
                    {lesson.duration && <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <i className="fa-regular fa-clock text-xs" /> {lesson.duration}
                    </div>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {quizOpen && quiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-heading font-bold text-dark text-lg flex items-center gap-2">
                <i className="fa-solid fa-clipboard-question text-primary" /> {quiz.title}
              </h2>
              <button onClick={() => setQuizOpen(false)} className="text-gray-400 hover:text-dark w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {quizResult ? (
                <div className="text-center py-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${quizResult.score >= 70 ? 'bg-accent/10 text-accent' : 'bg-red-50 text-red-400'}`}>
                    <i className={`fa-solid ${quizResult.score >= 70 ? 'fa-trophy' : 'fa-rotate-right'}`} />
                  </div>
                  <div className="font-heading font-bold text-3xl text-dark mb-2">{quizResult.score}%</div>
                  <p className="text-gray-500">{quizResult.correct} out of {quizResult.total} correct</p>
                  <p className={`mt-3 font-semibold ${quizResult.score >= 70 ? 'text-accent' : 'text-danger'}`}>
                    {quizResult.score >= 70 ? 'Passed! Great job.' : 'Keep studying and try again.'}
                  </p>
                  <button onClick={() => setQuizOpen(false)} className="btn-primary mt-6">Done</button>
                </div>
              ) : (
                <>
                  {quiz.questions.map((q, i) => (
                    <div key={i} className="space-y-3">
                      <p className="font-heading font-semibold text-dark">{i + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, j) => (
                          <button key={j} onClick={() => setAnswers({ ...answers, [i]: j })}
                            className={`w-full p-3 rounded-xl text-left text-sm border transition-all flex items-center gap-3 ${
                              answers[i] === j ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              answers[i] === j ? 'border-primary' : 'border-gray-300'
                            }`}>
                              {answers[i] === j && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.questions.length}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-paper-plane" /> Submit Quiz
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
