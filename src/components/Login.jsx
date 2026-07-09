import { useState } from 'react'
import { supabase, logActivity } from '../supabase'
import sdLogo from '../assets/logo.png'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: dbErr } = await supabase
        .from('users')
        .select('id, username, role')
        .eq('username', username.trim())
        .eq('password', password.trim())
        .single()

      if (dbErr || !data) {
        setError('Invalid username or password. Please try again.')
        await logActivity(username.trim(), 'LOGIN_FAILED', 'Wrong credentials')
      } else {
        await logActivity(data.username, 'LOGIN', 'Role: ' + data.role)
        onLogin({ id: data.id, username: data.username, role: data.role })
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb" />
      <div className="login-card">
        <div className="login-logo">
          <img src={sdLogo} alt="Saurashtra Darshan" onError={(e) => { e.target.style.display='none' }} />
          <div className="login-logo-text">
            <h1>Saurashtra Darshan</h1>
            <p>Tour &amp; Travels</p>
          </div>
        </div>
        <p className="login-subtitle">Staff Portal - Please sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          {error && <div className="error-msg">{error}</div>}
        </form>
      </div>
    </div>
  )
}
