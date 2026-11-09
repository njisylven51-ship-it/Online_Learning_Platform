import { useState } from 'react'
import type { FormEvent } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')
const TOKEN_KEY = 'learning-platform-access-token'

type User = {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  instructor_status?: 'pending' | 'approved' | 'rejected' | null
  instructor_review_reason?: string | null
}

type ApiError = { detail?: string }
type Dashboard = { courses: number; enrolments: number; pending_submissions: number }

async function responseMessage(response: Response) {
  const body = (await response.json().catch(() => ({}))) as ApiError
  if (!response.ok) throw new Error(body.detail ?? `Request failed (${response.status})`)
  return body
}

function App() {
  const [page, setPage] = useState<'register' | 'login' | 'account'>('register')
  const [registrationType, setRegistrationType] = useState<'student' | 'teacher'>('student')
  const [user, setUser] = useState<User | null>(null)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    const values = new FormData(event.currentTarget)
    const payload: Record<string, string> = {
      full_name: String(values.get('full_name') ?? ''),
      email: String(values.get('email') ?? ''),
      password: String(values.get('password') ?? ''),
    }
    const endpoint = registrationType === 'teacher' ? '/auth/register/teacher' : '/auth/register'
    if (registrationType === 'teacher') {
      payload.bio = String(values.get('bio') ?? '')
      payload.qualifications = String(values.get('qualifications') ?? '')
    }
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await responseMessage(response)
      setNotice(registrationType === 'teacher'
        ? 'Teacher registration received. You can log in now, but course authoring will be available after administrator approval.'
        : 'Student account created successfully. You can now log in.')
      setPage('login')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registration failed.')
    } finally {
      setBusy(false)
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    const values = new FormData(event.currentTarget)
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.get('email'), password: values.get('password') }),
      })
      const tokenData = await responseMessage(response) as { access_token: string }
      sessionStorage.setItem(TOKEN_KEY, tokenData.access_token)
      const accountResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const account = await responseMessage(accountResponse) as User
      setUser(account)
      if (account.role === 'teacher' && account.instructor_status === 'approved') {
        try {
          const dashboardResponse = await fetch(`${API_BASE}/teacher/dashboard`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          })
          if (dashboardResponse.ok) setDashboard(await dashboardResponse.json() as Dashboard)
        } catch {
          setDashboard(null)
        }
      }
      setPage('account')
    } catch (requestError) {
      sessionStorage.removeItem(TOKEN_KEY)
      setError(requestError instanceof Error ? requestError.message : 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setDashboard(null)
    setPage('login')
    setNotice('You have been logged out.')
  }

  return (
    <main className="page-shell">
      <section className="auth-card" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">CS</div>
        <p className="eyebrow">ONLINE LEARNING PLATFORM</p>
        <h1 id="page-title">{page === 'account' ? 'Your learning account' : 'Learn and teach computer science'}</h1>
        <p className="intro">Build practical skills with structured courses and expert instruction.</p>

        {notice && <p className="notice" role="status">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}

        {page === 'register' && (
          <>
            <div className="choice-tabs" role="group" aria-label="Choose account type">
              <button type="button" className={registrationType === 'student' ? 'selected' : ''} onClick={() => setRegistrationType('student')}>Register as Student</button>
              <button type="button" className={registrationType === 'teacher' ? 'selected' : ''} onClick={() => setRegistrationType('teacher')}>Register as Teacher</button>
            </div>
            <form onSubmit={register} className="form-stack">
              <label>Full name<input name="full_name" autoComplete="name" minLength={2} maxLength={160} required /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
              <label>Password<input name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></label>
              {registrationType === 'teacher' && (
                <>
                  <label>Professional biography<textarea name="bio" minLength={20} maxLength={4000} rows={4} required /></label>
                  <label>Qualifications or educational background<textarea name="qualifications" minLength={5} maxLength={2000} rows={3} required /></label>
                  <p className="helper">Your account is available immediately. An administrator must approve your instructor profile before you can create course content.</p>
                </>
              )}
              <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Creating account…' : registrationType === 'teacher' ? 'Submit teacher registration' : 'Create student account'}</button>
            </form>
            <p className="switch-line">Already registered? <button type="button" className="text-button" onClick={() => { setError(''); setNotice(''); setPage('login') }}>Log in</button></p>
          </>
        )}

        {page === 'login' && (
          <>
            <form onSubmit={login} className="form-stack">
              <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
              <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
              <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
            </form>
            <p className="switch-line">New here? <button type="button" className="text-button" onClick={() => { setError(''); setNotice(''); setPage('register') }}>Create an account</button></p>
          </>
        )}

        {page === 'account' && user && (
          <div className="account-panel">
            <p className="welcome">Welcome, {user.full_name}</p>
            <p>{user.email}</p>
            {user.role === 'teacher' && user.instructor_status === 'pending' && (
              <div className="state-box pending"><h2>Awaiting administrator approval</h2><p>You can log in, but course creation and other teacher tools remain locked until your instructor profile is approved.</p></div>
            )}
            {user.role === 'teacher' && user.instructor_status === 'rejected' && (
              <div className="state-box rejected"><h2>Teacher registration not approved</h2><p>{user.instructor_review_reason || 'An administrator did not approve this application.'}</p><p>Contact the platform administrators for next steps.</p></div>
            )}
            {user.role === 'teacher' && user.instructor_status === 'approved' && (
              <div className="state-box approved"><h2>Instructor dashboard</h2><p>Your teacher account is approved and course tools are enabled.</p>{dashboard ? <ul><li>Courses: {dashboard.courses}</li><li>Enrolments: {dashboard.enrolments}</li><li>Submissions awaiting grading: {dashboard.pending_submissions}</li></ul> : <p>Dashboard statistics are currently unavailable.</p>}</div>
            )}
            {user.role === 'student' && <div className="state-box"><h2>Student account</h2><p>Your account is ready. Course browsing and learning pages will appear here.</p></div>}
            {user.role === 'administrator' && <div className="state-box approved"><h2>Administrator account</h2><p>Use the administration tools to review teacher registrations and courses.</p></div>}
            <button type="button" className="secondary-button" onClick={logout}>Log out</button>
          </div>
        )}
        <footer>Secure accounts · Teacher access requires administrator approval</footer>
      </section>
    </main>
  )
}

export default App
