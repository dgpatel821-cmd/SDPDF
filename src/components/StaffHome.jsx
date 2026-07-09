import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import sdLogo from '../assets/logo.png'

export default function StaffHome({ user, onLogout, onCreateNew, onEdit }) {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [deleting, setDeleting]   = useState(null)
  const [search, setSearch]       = useState('')

  const fetchRecords = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pdf_records')
      .select('id, guest_name, tour_name, theme, created_at, updated_at')
      .eq('staff_username', user.username)
      .order('created_at', { ascending: false })
    if (data) setRecords(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleDelete = async (id, guestName) => {
    if (!window.confirm('Delete PDF record for "' + (guestName || 'this guest') + '"?')) return
    setDeleting(id)
    await supabase.from('pdf_records').delete().eq('id', id)
    setRecords(r => r.filter(rec => rec.id !== id))
    setDeleting(null)
  }

  const handleEdit = async (id) => {
    const { data } = await supabase
      .from('pdf_records')
      .select('*')
      .eq('id', id)
      .single()
    if (data) onEdit(data)
  }

  const handleShare = (rec) => {
    const msg = encodeURIComponent(
      'Hi! Your tour itinerary is ready. Tour: ' + (rec.tour_name || 'Saurashtra Darshan') +
      '. Please contact us for the PDF copy. - Saurashtra Darshan Tour & Travels'
    )
    window.open('https://wa.me/?text=' + msg, '_blank')
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const filtered = records.filter(r =>
    (r.guest_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.tour_name  || '').toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const now       = new Date()
  const thisMonth = records.filter(r => {
    const d = new Date(r.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const thisWeek  = records.filter(r => {
    const d    = new Date(r.created_at)
    const diff = (now - d) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length

  const THEME_COLORS = { classic: '#E05A2B', modern: '#00897b', minimal: '#555' }
  const THEME_LABELS = { classic: '🏛 Classic', modern: '✨ Modern', minimal: '📄 Minimal' }

  return (
    <div style={{ minHeight: '100vh', background: '#111111', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <header style={{
        background: '#1a1a1a', borderBottom: '1px solid #2a2a2a',
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={sdLogo} alt="SD" style={{ width: 40, height: 40, objectFit: 'contain' }}
            onError={e => e.target.style.display='none'} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#e0e0e0', lineHeight: 1.2 }}>Saurashtra Darshan</div>
            <div style={{ fontSize: 11, color: '#E05A2B', fontWeight: 600, letterSpacing: 0.5 }}>PDF GENERATOR</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#E05A2B22', border: '1px solid #E05A2B44', borderRadius: 20,
            padding: '5px 14px', fontSize: 13, fontWeight: 700, color: '#E05A2B',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>👤</span> {user.username.toUpperCase()}
          </div>
          <button onClick={onLogout} style={{
            background: 'transparent', border: '1px solid #444', color: '#888',
            borderRadius: 8, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.borderColor='#E05A2B'; e.target.style.color='#E05A2B' }}
            onMouseLeave={e => { e.target.style.borderColor='#444'; e.target.style.color='#888' }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome + Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#e0e0e0', margin: 0 }}>
              Welcome, <span style={{ color: '#E05A2B' }}>{user.username}</span> 👋
            </h1>
            <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Manage your itinerary PDFs here</p>
          </div>
          <button
            onClick={onCreateNew}
            style={{
              background: 'linear-gradient(135deg, #E05A2B, #c04820)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px',
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(224,90,43,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New PDF
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total PDFs Created', value: records.length, icon: '📄', color: '#E05A2B' },
            { label: 'This Month',         value: thisMonth,       icon: '📅', color: '#3498db' },
            { label: 'This Week',          value: thisWeek,        icon: '📆', color: '#27ae60' },
            { label: 'Latest',             value: records[0] ? new Date(records[0].created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : '—', icon: '🕐', color: '#9b59b6' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 14,
              padding: '20px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 26 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, marginTop: 8, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search + List */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden' }}>
          {/* List Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e0e0e0' }}>
              Your PDFs <span style={{ color: '#555', fontWeight: 400, fontSize: 13 }}>({filtered.length})</span>
            </div>
            <input
              type="text"
              placeholder="🔍 Search by guest or tour name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: '#222', border: '1px solid #333', borderRadius: 8, padding: '8px 14px',
                color: '#e0e0e0', fontSize: 13, outline: 'none', width: 280, maxWidth: '100%',
              }}
            />
          </div>

          {/* PDF List */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ width: 32, height: 32, border: '3px solid #333', borderTopColor: '#E05A2B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ color: '#555', fontSize: 14 }}>Loading your PDFs...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <div style={{ color: '#555', fontSize: 15, fontWeight: 600 }}>
                {search ? 'No PDFs found for your search' : 'No PDFs created yet'}
              </div>
              {!search && (
                <button onClick={onCreateNew} style={{
                  marginTop: 16, background: '#E05A2B', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  Create Your First PDF
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto auto',
                padding: '10px 20px', background: '#161616',
                fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5,
                gap: 12,
              }}>
                <div>Guest Name</div>
                <div>Tour Name</div>
                <div style={{ textAlign: 'center' }}>Theme</div>
                <div style={{ textAlign: 'center' }}>Created</div>
                <div style={{ textAlign: 'center' }}>Actions</div>
                <div></div>
              </div>
              {filtered.map((rec, idx) => (
                <div key={rec.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto auto',
                  padding: '14px 20px', gap: 12, alignItems: 'center',
                  borderTop: idx === 0 ? 'none' : '1px solid #1e1e1e',
                  transition: 'background 0.15s',
                  background: '#1a1a1a',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='#222'}
                  onMouseLeave={e => e.currentTarget.style.background='#1a1a1a'}
                >
                  {/* Guest Name */}
                  <div>
                    <div style={{ fontWeight: 700, color: '#e0e0e0', fontSize: 14 }}>{rec.guest_name || '—'}</div>
                  </div>

                  {/* Tour Name */}
                  <div style={{ color: '#888', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rec.tour_name || '—'}
                  </div>

                  {/* Theme Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: (THEME_COLORS[rec.theme] || '#E05A2B') + '22',
                      color: THEME_COLORS[rec.theme] || '#E05A2B',
                      border: '1px solid ' + (THEME_COLORS[rec.theme] || '#E05A2B') + '44',
                      whiteSpace: 'nowrap',
                    }}>
                      {THEME_LABELS[rec.theme] || '🏛 Classic'}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ color: '#555', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {formatDate(rec.created_at)}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(rec.id)}
                      title="Edit & Re-download"
                      style={{
                        background: '#1a3a2a', color: '#27ae60', border: '1px solid #27ae6044',
                        borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13,
                        fontWeight: 700, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='#27ae6033'}
                      onMouseLeave={e => e.currentTarget.style.background='#1a3a2a'}
                    >
                      ✏️ Edit
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(rec)}
                      title="Share on WhatsApp"
                      style={{
                        background: '#1a3a1a', color: '#25D366', border: '1px solid #25D36644',
                        borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13,
                        fontWeight: 700, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='#25D36622'}
                      onMouseLeave={e => e.currentTarget.style.background='#1a3a1a'}
                    >
                      📤 Share
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(rec.id, rec.guest_name)}
                      title="Delete"
                      disabled={deleting === rec.id}
                      style={{
                        background: '#3a1a1a', color: '#e74c3c', border: '1px solid #e74c3c44',
                        borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13,
                        fontWeight: 700, transition: 'all 0.15s', opacity: deleting === rec.id ? 0.5 : 1,
                      }}
                      onMouseEnter={e => { if (deleting !== rec.id) e.currentTarget.style.background='#e74c3c22' }}
                      onMouseLeave={e => e.currentTarget.style.background='#3a1a1a'}
                    >
                      {deleting === rec.id ? '...' : '🗑 Delete'}
                    </button>
                  </div>
                  <div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
