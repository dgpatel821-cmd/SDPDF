import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import sdLogo from '../assets/logo.png'

// Import templates for preview
import ItineraryTemplate from './ItineraryTemplate'
import ModernTemplate from './ModernTemplate'
import MinimalTemplate from './MinimalTemplate'

const ACTION_ICONS = {
  LOGIN: '🟢',
  LOGIN_FAILED: '🔴',
  PDF_GENERATED: '📄',
  LOGOUT: '🔵',
}

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab]     = useState('staff')
  const [staffList, setStaffList]     = useState([])
  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [msg, setMsg]                 = useState({ type: '', text: '' })

  // Password reset modal
  const [resetModal, setResetModal]   = useState(null) // { id, username }
  const [newPass, setNewPass]         = useState('')
  const [resetMsg, setResetMsg]       = useState('')

  // Staff PDFs list
  const [pdfRecords, setPdfRecords]   = useState([])
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [pdfSearch, setPdfSearch]     = useState('')
  const [previewPdf, setPreviewPdf]   = useState(null) // holds selected pdf_record for preview modal

  // Activity log
  const [logs, setLogs]               = useState([])
  const [logLoading, setLogLoading]   = useState(false)
  const [logFilter, setLogFilter]     = useState('ALL')

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: false })
    if (data) setStaffList(data)
  }

  const fetchLogs = async () => {
    setLogLoading(true)
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setLogs(data)
    setLogLoading(false)
  }

  const fetchAllPDFs = async () => {
    setPdfLoading(true)
    const { data } = await supabase
      .from('pdf_records')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPdfRecords(data)
    setPdfLoading(false)
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs()
    if (activeTab === 'pdfs') fetchAllPDFs()
  }, [activeTab])

  const handleAddStaff = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setMsg({ type: 'error', text: 'Username and password are required.' })
      return
    }
    setLoading(true)
    setMsg({ type: '', text: '' })
    const { error } = await supabase
      .from('users')
      .insert([{ username: username.trim(), password: password.trim(), role: 'staff' }])
    if (error) {
      setMsg({ type: 'error', text: error.code === '23505' ? 'Username already exists.' : 'Error adding staff.' })
    } else {
      setMsg({ type: 'success', text: 'Staff "' + username.trim() + '" added successfully!' })
      setUsername('')
      setPassword('')
      fetchStaff()
    }
    setLoading(false)
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const handleDelete = async (id, uname) => {
    if (uname === 'admin@shreepal.com' || uname === 'admin') return
    if (!window.confirm('Delete staff account "' + uname + '"?')) return
    await supabase.from('users').delete().eq('id', id)
    fetchStaff()
  }

  const handleDeletePDF = async (id, guestName) => {
    if (!window.confirm('Delete PDF record for "' + (guestName || 'this guest') + '"?')) return
    await supabase.from('pdf_records').delete().eq('id', id)
    setPdfRecords(r => r.filter(p => p.id !== id))
  }

  const handleResetPassword = async () => {
    if (!newPass.trim()) { setResetMsg('Enter a new password.'); return }
    const { error } = await supabase
      .from('users')
      .update({ password: newPass.trim() })
      .eq('id', resetModal.id)
    if (error) {
      setResetMsg('Error updating password.')
    } else {
      setResetMsg('Password updated!')
      setTimeout(() => {
        setResetModal(null)
        setNewPass('')
        setResetMsg('')
      }, 1500)
    }
  }

  const filteredLogs = logFilter === 'ALL' ? logs : logs.filter(l => l.action === logFilter)
  
  const filteredPDFs = pdfRecords.filter(p =>
    (p.guest_name || '').toLowerCase().includes(pdfSearch.toLowerCase()) ||
    (p.tour_name || '').toLowerCase().includes(pdfSearch.toLowerCase()) ||
    (p.staff_username || '').toLowerCase().includes(pdfSearch.toLowerCase())
  )

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  // Stats from logs
  const totalPDFs    = logs.filter(l => l.action === 'PDF_GENERATED').length
  const totalLogins  = logs.filter(l => l.action === 'LOGIN').length
  const failedLogins = logs.filter(l => l.action === 'LOGIN_FAILED').length
  const activeStaff  = [...new Set(logs.filter(l => l.action === 'LOGIN').map(l => l.username))].length

  const THEME_LABELS = { classic: '🏛 Classic', modern: '✨ Modern', minimal: '📄 Minimal' }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <img src={sdLogo} alt="SD" onError={e => e.target.style.display='none'} />
          <div className="header-brand-text">
            <h2>Saurashtra Darshan</h2>
            <span>Admin Panel</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-badge"><span>ADMIN</span></div>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="admin-content">
        <h1 className="admin-title">Admin <span>Dashboard</span></h1>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #2a2a2a', paddingBottom: 0 }}>
          {[
            { id: 'staff', label: '👥 Staff Management' },
            { id: 'pdfs',  label: '📋 Staff PDFs' },
            { id: 'logs',  label: '📊 Activity Log' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: activeTab === t.id ? '#E05A2B' : 'transparent',
              color: activeTab === t.id ? '#fff' : '#888',
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === t.id ? '2px solid #E05A2B' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="admin-grid">
            {/* ADD STAFF */}
            <div className="card">
              <div className="card-title">Add New Staff</div>
              <form onSubmit={handleAddStaff}>
                <div className="form-group dark">
                  <label>Username</label>
                  <input type="text" placeholder="e.g. rahul_staff" value={username}
                    onChange={e => setUsername(e.target.value)} autoComplete="off" />
                </div>
                <div className="form-group dark">
                  <label>Password</label>
                  <input type="text" placeholder="Set a password for them" value={password}
                    onChange={e => setPassword(e.target.value)} autoComplete="off" />
                </div>
                <button type="submit" className="btn-add" disabled={loading}>
                  {loading ? 'Adding...' : '+ Add Staff Member'}
                </button>
                {msg.text && (
                  <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginTop: 12 }}>
                    {msg.text}
                  </div>
                )}
              </form>
            </div>

            {/* STAFF LIST */}
            <div className="card">
              <div className="card-title">All Accounts ({staffList.length})</div>
              {staffList.length === 0 ? (
                <div className="empty-state">No accounts found.</div>
              ) : (
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Reset Pass</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map(s => (
                      <tr key={s.id}>
                        <td style={{ color: '#e0e0e0', fontWeight: 600 }}>{s.username}</td>
                        <td><span className={'role-badge ' + s.role}>{s.role}</span></td>
                        <td style={{ fontSize: 12, color: '#666' }}>
                          {new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          {s.role !== 'admin' && (
                            <button onClick={() => { setResetModal(s); setNewPass(''); setResetMsg('') }}
                              style={{ background: '#2a2a3a', color: '#aaa', border: '1px solid #333', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                              🔑 Reset
                            </button>
                          )}
                        </td>
                        <td>
                          {s.role !== 'admin' && (
                            <button className="btn-delete" onClick={() => handleDelete(s.id, s.username)}>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* STAFF PDFs TAB */}
        {activeTab === 'pdfs' && (
          <div>
            {/* Filter & Search */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e0e0e0' }}>
                All Created Itineraries <span style={{ color: '#555', fontWeight: 400 }}>({filteredPDFs.length})</span>
              </div>
              <input
                type="text"
                placeholder="🔍 Search guest, tour or staff..."
                value={pdfSearch}
                onChange={e => setPdfSearch(e.target.value)}
                style={{
                  background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 14px',
                  color: '#e0e0e0', fontSize: 13, outline: 'none', width: 300, maxWidth: '100%',
                }}
              />
            </div>

            {/* PDFs Grid/Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {pdfLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading records...</div>
              ) : filteredPDFs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No PDF records found.</div>
              ) : (
                <table className="staff-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Tour Name</th>
                      <th>Staff Username</th>
                      <th>Theme</th>
                      <th>Created</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPDFs.map(rec => (
                      <tr key={rec.id}>
                        <td style={{ color: '#e0e0e0', fontWeight: 600 }}>{rec.guest_name || '—'}</td>
                        <td style={{ color: '#aaa' }}>{rec.tour_name || '—'}</td>
                        <td>
                          <span style={{ padding: '2px 8px', background: '#333', color: '#ccc', borderRadius: 6, fontSize: 12 }}>
                            👤 {rec.staff_username}
                          </span>
                        </td>
                        <td>{THEME_LABELS[rec.theme] || '🏛 Classic'}</td>
                        <td style={{ fontSize: 12, color: '#666' }}>{formatTime(rec.created_at)}</td>
                        <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => setPreviewPdf(rec)}
                            style={{
                              background: '#E05A2B', color: '#fff', border: 'none',
                              borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 700
                            }}
                          >
                            👁️ View Itinerary
                          </button>
                          <button
                            onClick={() => handleDeletePDF(rec.id, rec.guest_name)}
                            style={{
                              background: '#3a1a1a', color: '#e74c3c', border: '1px solid #e74c3c33',
                              borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 700
                            }}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY LOG TAB */}
        {activeTab === 'logs' && (
          <div>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'PDFs Generated', value: totalPDFs, icon: '📄', color: '#E05A2B' },
                { label: 'Successful Logins', value: totalLogins, icon: '🟢', color: '#27ae60' },
                { label: 'Failed Logins', value: failedLogins, icon: '🔴', color: '#e74c3c' },
                { label: 'Active Staff', value: activeStaff, icon: '👥', color: '#3498db' },
              ].map((stat, i) => (
                <div key={i} style={{ background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: 22 }}>{stat.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginTop: 6 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{stat.label} (30 days)</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {['ALL', 'LOGIN', 'LOGIN_FAILED', 'PDF_GENERATED'].map(f => (
                <button key={f} onClick={() => setLogFilter(f)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  background: logFilter === f ? '#E05A2B' : '#1a1a2e',
                  color: logFilter === f ? '#fff' : '#888',
                  border: '1px solid ' + (logFilter === f ? '#E05A2B' : '#333'),
                  fontWeight: 600, transition: 'all 0.2s',
                }}>
                  {ACTION_ICONS[f] || '📋'} {f.replace('_', ' ')}
                </button>
              ))}
              <button onClick={fetchLogs} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: '#1a1a2e', color: '#888', border: '1px solid #333', fontWeight: 600,
              }}>
                🔄 Refresh
              </button>
            </div>

            {/* Log Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {logLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                  No activity found. Make sure the activity_logs table is created in Supabase.
                </div>
              ) : (
                <table className="staff-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Staff</th>
                      <th>Action</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>
                          {formatTime(log.created_at)}
                        </td>
                        <td style={{ color: '#e0e0e0', fontWeight: 600 }}>{log.username}</td>
                        <td>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: log.action === 'LOGIN' ? '#1a3a1a' :
                                        log.action === 'LOGIN_FAILED' ? '#3a1a1a' :
                                        log.action === 'PDF_GENERATED' ? '#2a2a1a' : '#1a1a2e',
                            color: log.action === 'LOGIN' ? '#27ae60' :
                                   log.action === 'LOGIN_FAILED' ? '#e74c3c' :
                                   log.action === 'PDF_GENERATED' ? '#f39c12' : '#888',
                          }}>
                            {ACTION_ICONS[log.action] || '•'} {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#666' }}>{log.detail || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {resetModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e0e0e0', marginBottom: 8 }}>
              Reset Password
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              Staff: <strong style={{ color: '#E05A2B' }}>{resetModal.username}</strong>
            </div>
            <div className="form-group dark">
              <label>New Password</label>
              <input
                type="text"
                placeholder="Enter new password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                autoFocus
              />
            </div>
            {resetMsg && (
              <div style={{ fontSize: 13, marginBottom: 12, color: resetMsg.includes('updated') ? '#27ae60' : '#e74c3c' }}>
                {resetMsg}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={handleResetPassword} style={{
                flex: 1, padding: '10px', background: '#E05A2B', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}>
                Update Password
              </button>
              <button onClick={() => setResetModal(null)} style={{
                flex: 1, padding: '10px', background: '#2a2a3a', color: '#888',
                border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF View Modal for Admin */}
      {previewPdf && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
        }}>
          {/* Modal Header */}
          <div style={{ background: '#1a1a2e', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a3a' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>
                Viewing PDF: <span style={{ color: '#E05A2B' }}>{previewPdf.guest_name}</span>
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                Tour: {previewPdf.tour_name} | Created by: {previewPdf.staff_username}
              </div>
            </div>
            <button
              onClick={() => setPreviewPdf(null)}
              style={{ background: '#E05A2B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700 }}
            >
              ❌ Close Preview
            </button>
          </div>

          {/* Modal Body - Scrollable Preview */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', justifyContent: 'center', background: '#111' }}>
            <div style={{ width: 794, background: '#fff', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              {previewPdf.theme === 'modern'  ? <ModernTemplate  data={previewPdf.pdf_data} /> :
               previewPdf.theme === 'minimal' ? <MinimalTemplate data={previewPdf.pdf_data} /> :
               <ItineraryTemplate data={previewPdf.pdf_data} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
