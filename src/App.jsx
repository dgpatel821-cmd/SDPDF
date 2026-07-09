import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import StaffHome from './components/StaffHome'
import StaffDashboard from './components/StaffDashboard'
import './index.css'

export default function App() {
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)
  // staffView: 'home' | 'create' | 'edit'
  const [staffView, setStaffView]   = useState('home')
  const [editRecord, setEditRecord] = useState(null) // full pdf_record row

  useEffect(() => {
    const stored = sessionStorage.getItem('sd_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    sessionStorage.setItem('sd_user', JSON.stringify(userData))
    setUser(userData)
    setStaffView('home')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('sd_user')
    setUser(null)
    setStaffView('home')
    setEditRecord(null)
  }

  const handleCreateNew = () => {
    setEditRecord(null)
    setStaffView('create')
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    setStaffView('edit')
  }

  const handleBackToHome = () => {
    setEditRecord(null)
    setStaffView('home')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 40, height: 40, border: '3px solid #333', borderTopColor: '#E05A2B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!user) return <Login onLogin={handleLogin} />
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />

  // Staff routing
  if (staffView === 'home') {
    return <StaffHome user={user} onLogout={handleLogout} onCreateNew={handleCreateNew} onEdit={handleEdit} />
  }
  return (
    <StaffDashboard
      user={user}
      onLogout={handleLogout}
      onBack={handleBackToHome}
      editRecord={editRecord}
      isEdit={staffView === 'edit'}
    />
  )
}
