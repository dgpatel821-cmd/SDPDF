import { useState, useRef, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import sdLogo from '../assets/logo.png'
import ItineraryTemplate from './ItineraryTemplate'
import ModernTemplate from './ModernTemplate'
import MinimalTemplate from './MinimalTemplate'
import { logActivity } from '../supabase'

const DEFAULT_INCLUSIONS = [
  'AC Hotel Accommodation',
  'Daily Breakfast',
  'Daily Dinner',
  'AC Vehicle (Tempo / Bus)',
  'All Sightseeing',
  'Experienced Driver',
  'Parking & Toll Charges',
  'Tour Manager / Guide',
]

const DEFAULT_IMPORTANT_NOTES = `• Rates are valid for the mentioned dates only.
• GST extra as applicable.
• Rates may change without prior notice.
• Package cost does not include any personal expenses.
• Any entry tickets not mentioned are on actuals.
• Hotel rooms subject to availability at time of booking.`

const DEFAULT_BOOKING_POLICY = `• 30% advance at time of booking confirmation.
• Remaining balance to be paid before departure.
• Booking confirmed only after receiving advance payment.
• Advance is non-refundable if cancelled within 7 days.`

const DEFAULT_CANCELLATION = `• 30+ days before departure: 10% cancellation charge.
• 15-29 days before departure: 25% cancellation charge.
• 7-14 days before departure: 50% cancellation charge.
• Less than 7 days / No show: 100% cancellation charge (No Refund).`

const STEPS = [
  { id: 1, label: 'Tour Info' },
  { id: 2, label: 'Guest Info' },
  { id: 3, label: 'Reach By' },
  { id: 4, label: 'Itinerary' },
  { id: 5, label: 'Meals' },
  { id: 6, label: 'Inclusions' },
  { id: 7, label: 'Pricing' },
  { id: 8, label: 'Terms' },
]

function newDay(n) {
  return { dayNo: n, title: '', date: '', description: '' }
}

function newPricingRow() {
  return { occupancy: '', details: '', price: '' }
}

export default function StaffDashboard({ user, onLogout, onBack, editRecord, isEdit }) {
  const [step, setStep]           = useState(1)
  const [generating, setGenerating] = useState(false)
  const [theme, setTheme]         = useState('classic')
  const [whatsappNum, setWhatsappNum] = useState('')
  const [showWhatsapp, setShowWhatsapp] = useState(false)
  const [editRecordId, setEditRecordId] = useState(null)
  const templateRef   = useRef(null)
  const previewBodyRef = useRef(null)

  const STEP_SECTION_MAP = {
    1: 'pdf-sect-1',
    2: 'pdf-sect-2',
    3: 'pdf-sect-3',
    4: 'pdf-sect-4',
    5: 'pdf-sect-5',
    6: 'pdf-sect-5',
    7: 'pdf-sect-5',
    8: 'pdf-sect-8',
  }

  const scrollToSection = useCallback((targetStep) => {
    const sectionId = STEP_SECTION_MAP[targetStep]
    if (!sectionId || !previewBodyRef.current) return
    // Small delay so React can re-render before we measure
    setTimeout(() => {
      const previewBody = previewBodyRef.current
      const el = document.getElementById(sectionId)
      if (!previewBody || !el) return

      const previewRect = previewBody.getBoundingClientRect()
      const elRect      = el.getBoundingClientRect()

      // Center the section vertically in the preview panel
      const elMid      = elRect.top + elRect.height / 2
      const previewMid = previewRect.top + previewRect.height / 2
      const scrollDelta = elMid - previewMid

      previewBody.scrollBy({ top: scrollDelta, behavior: 'smooth' })
    }, 80)
  }, [])

  const [tourName, setTourName] = useState('')
  const [duration, setDuration] = useState('')
  const [tourCode, setTourCode] = useState('')
  const [greetings, setGreetings] = useState('Dear Guest, Thank you for choosing Saurashtra Darshan Tour. We are delighted to present your personalised tour itinerary.')

  const [guestName, setGuestName] = useState('')
  const [mobile, setMobile] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [pax, setPax] = useState('')

  const [reachFrom, setReachFrom] = useState('')
  const [reachTo, setReachTo] = useState('')
  const [reachDate, setReachDate] = useState('')
  const [reachTime, setReachTime] = useState('')
  const [flightTrain, setFlightTrain] = useState('')
  const [dropPoint, setDropPoint] = useState('')
  const [dropDate, setDropDate] = useState('')

  const [days, setDays] = useState([newDay(1), newDay(2), newDay(3)])

  const [breakfast, setBreakfast] = useState('Included at hotel - served as per tour schedule.')
  const [dinner, setDinner] = useState('Included at hotel - served as per tour schedule.')

  const [inclusions, setInclusions] = useState(DEFAULT_INCLUSIONS.map(i => ({ label: i, checked: true })))
  const [customInclusion, setCustomInclusion] = useState('')

  const [pricingRows, setPricingRows] = useState([
    { occupancy: 'Double Sharing', details: '', price: '' },
    { occupancy: 'Triple Sharing', details: '', price: '' },
    { occupancy: 'Quad Sharing', details: '', price: '' },
  ])
  const [extraPersonCost, setExtraPersonCost] = useState('')

  const [importantNotes, setImportantNotes] = useState(DEFAULT_IMPORTANT_NOTES)
  const [bookingPolicy, setBookingPolicy] = useState(DEFAULT_BOOKING_POLICY)
  const [cancellationPolicy, setCancellationPolicy] = useState(DEFAULT_CANCELLATION)
  const [branches, setBranches] = useState('Rajkot | Gondal | Jetpur | Porbandar')
  const [contactNumber, setContactNumber] = useState('')

  // Format date from YYYY-MM-DD to "15 July 2026" for PDF display
  const formatDate = (d) => {
    if (!d) return ''
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getPdfData = () => ({
    tourName, duration, tourCode, greetings,
    guestName, mobile,
    travelDate: formatDate(travelDate),
    travelDateRaw: travelDate,
    pax: Number(pax),
    reachFrom, reachTo, reachDate, reachTime, flightTrain, dropPoint, dropDate,
    days,
    breakfast, dinner,
    inclusions: inclusions.filter(i => i.checked).map(i => i.label),
    rawInclusions: inclusions,
    pricingRows,
    extraPersonCost,
    importantNotes, bookingPolicy, cancellationPolicy,
    branches, contactNumber,
  })

  // Save or update record in Supabase
  const saveRecord = async () => {
    const { supabase: sb } = await import('../supabase')
    const payload = {
      staff_username: user.username,
      guest_name: guestName || 'Unknown',
      tour_name:  tourName  || 'Untitled',
      theme:      theme,
      pdf_data:   getPdfData(),
      updated_at: new Date().toISOString(),
    }
    try {
      if (editRecordId) {
        const { error } = await sb.from('pdf_records').update(payload).eq('id', editRecordId)
        if (error) throw error
        console.log("PDF record updated successfully!")
      } else {
        const { data, error } = await sb.from('pdf_records').insert([payload]).select('id').single()
        if (error) throw error
        if (data) {
          console.log("PDF record inserted successfully! ID:", data.id)
          setEditRecordId(data.id)
        }
      }
    } catch (err) {
      console.error("Supabase Save Error:", err)
      alert("Database Error: Could not save PDF record. Details: " + (err.message || err.details || JSON.stringify(err)))
    }
  }

  const addDay = () => setDays(d => [...d, newDay(d.length + 1)])
  const removeDay = (idx) => setDays(d => d.filter((_, i) => i !== idx).map((d, i) => ({ ...d, dayNo: i + 1 })))
  const updateDay = (idx, field, val) => setDays(d => d.map((day, i) => i === idx ? { ...day, [field]: val } : day))

  const addPricingRow = () => setPricingRows(r => [...r, newPricingRow()])
  const removePricingRow = (idx) => setPricingRows(r => r.filter((_, i) => i !== idx))
  const updatePricingRow = (idx, field, val) => setPricingRows(r => r.map((row, i) => i === idx ? { ...row, [field]: val } : row))

  const toggleInclusion = (idx) => setInclusions(items => items.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item))
  const addCustomInclusion = () => {
    if (!customInclusion.trim()) return
    setInclusions(i => [...i, { label: customInclusion.trim(), checked: true }])
    setCustomInclusion('')
  }

  // PDF Download - theme aware
  const handleDownload = async () => {
    setGenerating(true)
    try {
      const A4_W = 794
      const A4_H = 1123

      const container = document.createElement('div')
      Object.assign(container.style, {
        position: 'fixed', top: '-99999px', left: '-99999px',
        width: A4_W + 'px', background: 'white', zIndex: '-1',
        fontFamily: 'Arial, Helvetica, sans-serif',
      })
      document.body.appendChild(container)

      const reactDom = await import('react-dom/client')
      const React    = (await import('react')).default

      // Select template based on theme
      let Template
      if (theme === 'modern')  Template = (await import('./ModernTemplate')).default
      else if (theme === 'minimal') Template = (await import('./MinimalTemplate')).default
      else Template = (await import('./ItineraryTemplate')).default

      const root = reactDom.createRoot(container)
      root.render(React.createElement(Template, { data: getPdfData() }))

      await new Promise(r => setTimeout(r, 900))

      const canvas = await html2canvas(container, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: '#ffffff', logging: false,
        width: A4_W, windowWidth: A4_W,
      })

      const pdf         = new jsPDF({ orientation: 'portrait', unit: 'px', format: [A4_W, A4_H] })
      const pdfW        = pdf.internal.pageSize.getWidth()
      const pdfH        = pdf.internal.pageSize.getHeight()
      const pageHCanvas = A4_H * 2
      const totalPages  = Math.ceil(canvas.height / pageHCanvas)

      for (let i = 0; i < totalPages; i++) {
        const srcY   = i * pageHCanvas
        const srcH   = Math.min(pageHCanvas, canvas.height - srcY)
        const pg     = document.createElement('canvas')
        pg.width     = canvas.width
        pg.height    = pageHCanvas
        const ctx    = pg.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, pg.width, pg.height)
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)
        if (i > 0) pdf.addPage()
        pdf.addImage(pg.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH)
      }

      const name = ((guestName || 'Guest') + '_' + (tourName || 'Itinerary') + '_SaurashtraDarshan.pdf')
        .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '')
      pdf.save(name)

      // Save to Supabase pdf_records
      await saveRecord()

      // Log activity
      await logActivity(user.username, 'PDF_GENERATED', 'Guest: ' + (guestName || 'Unknown') + ' | Tour: ' + (tourName || 'Unknown') + ' | Theme: ' + theme)

      // Show WhatsApp share option
      if (mobile) setWhatsappNum(mobile)
      setShowWhatsapp(true)

      root.unmount()
      document.body.removeChild(container)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="form-section-title">Tour Information</div>
            <div className="form-group dark">
              <label>Tour / Package Name *</label>
              <input type="text" placeholder="e.g. Saurashtra Darshan 7 Days" value={tourName} onChange={e => setTourName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group dark">
                <label>Duration</label>
                <input type="text" placeholder="e.g. 6 Nights / 7 Days" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <div className="form-group dark">
                <label>Tour Code (Optional)</label>
                <input type="text" placeholder="e.g. SD-001" value={tourCode} onChange={e => setTourCode(e.target.value)} />
              </div>
            </div>
            <div className="form-group dark">
              <label>Contact Number (for PDF footer)</label>
              <input type="text" placeholder="e.g. 98250 XXXXX" value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
            </div>
            <div className="form-group dark">
              <label>Branch Offices</label>
              <input type="text" placeholder="e.g. Rajkot | Gondal | Jetpur" value={branches} onChange={e => setBranches(e.target.value)} />
            </div>
            <div className="form-group dark">
              <label>Greeting Message</label>
              <textarea rows={3} value={greetings} onChange={e => setGreetings(e.target.value)} />
            </div>
          </div>
        )

      case 2:
        return (
          <div>
            <div className="form-section-title">Guest Details</div>
            <div className="form-group dark">
              <label>Guest / Customer Name *</label>
              <input type="text" placeholder="Full name of the customer" value={guestName} onChange={e => setGuestName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group dark">
                <label>Mobile Number</label>
                <input type="text" placeholder="10-digit mobile" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
              <div className="form-group dark">
                <label>No. of Persons (Pax)</label>
                <input type="number" placeholder="e.g. 4" value={pax} onChange={e => setPax(e.target.value)} min={1} />
              </div>
            </div>
            <div className="form-group dark">
              <label>Travel Date</label>
              <input
                type="date"
                value={travelDate}
                onChange={e => setTravelDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div>
            <div className="form-section-title">Reach By Details</div>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 18, lineHeight: 1.6 }}>
              From where the guest travels & where/when to report for the tour.
            </p>
            <div className="form-row">
              <div className="form-group dark">
                <label>From City</label>
                <input type="text" placeholder="e.g. Ahmedabad" value={reachFrom} onChange={e => setReachFrom(e.target.value)} />
              </div>
              <div className="form-group dark">
                <label>Reach Destination</label>
                <input type="text" placeholder="e.g. Somnath Temple" value={reachTo} onChange={e => setReachTo(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group dark">
                <label>Reporting Date</label>
                <input type="text" placeholder="e.g. 15 July 2025" value={reachDate} onChange={e => setReachDate(e.target.value)} />
              </div>
              <div className="form-group dark">
                <label>Reporting Time</label>
                <input type="text" placeholder="e.g. 08:00 AM" value={reachTime} onChange={e => setReachTime(e.target.value)} />
              </div>
            </div>
            <div className="form-group dark">
              <label>Flight / Train Number (Optional)</label>
              <input type="text" placeholder="e.g. 12479 Somnath Express" value={flightTrain} onChange={e => setFlightTrain(e.target.value)} />
            </div>
            <div style={{ height: 1, background: '#2a2a2a', margin: '12px 0' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa', marginBottom: 12 }}>Drop / Return Details</div>
            <div className="form-row">
              <div className="form-group dark">
                <label>Drop Point / Return City</label>
                <input type="text" placeholder="e.g. Ahmedabad Railway Station" value={dropPoint} onChange={e => setDropPoint(e.target.value)} />
              </div>
              <div className="form-group dark">
                <label>Drop Date &amp; Time</label>
                <input type="text" placeholder="e.g. 11 June 2026 Evening 8-9 PM" value={dropDate} onChange={e => setDropDate(e.target.value)} />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <div className="form-section-title">Day-wise Itinerary</div>
            {days.map((day, idx) => (
              <div className="day-card" key={idx}>
                <div className="day-card-header">
                  <span className="day-number-badge">Day {day.dayNo}</span>
                  {days.length > 1 && (
                    <button className="btn-remove-day" onClick={() => removeDay(idx)}>â✓✓'✓"- Remove</button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group dark">
                    <label>Destination / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Somnath - Dwarka"
                      value={day.title}
                      onChange={e => updateDay(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group dark">
                    <label>Date (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 15 July 2025"
                      value={day.date}
                      onChange={e => updateDay(idx, 'date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group dark">
                  <label>Activities / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the day's activities, sightseeing, hotel, etc."
                    value={day.description}
                    onChange={e => updateDay(idx, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button className="btn-add-day" onClick={addDay}>+ Add Day</button>
          </div>
        )

      case 5:
        return (
          <div>
            <div className="form-section-title">Meals Included</div>
            <div className="form-group dark">
              <label>🌅 Breakfast Details</label>
              <textarea
                rows={3}
                placeholder="e.g. Included at hotel - served as per tour schedule."
                value={breakfast}
                onChange={e => setBreakfast(e.target.value)}
              />
            </div>
            <div className="form-group dark">
              <label>🌙 Dinner Details</label>
              <textarea
                rows={3}
                placeholder="e.g. Included at hotel - Gujarati thali served"
                value={dinner}
                onChange={e => setDinner(e.target.value)}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div>
            <div className="form-section-title">Package Inclusions</div>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Select what's included in this package:</p>
            <div className="inclusion-grid">
              {inclusions.map((item, idx) => (
                <div
                  key={idx}
                  className={`inclusion-item ${item.checked ? 'checked' : ''}`}
                  onClick={() => toggleInclusion(idx)}
                >
                  <div className="inclusion-check">{item.checked ? '✓' : ''}</div>
                  <span className="inclusion-label">{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <div className="form-group dark" style={{ flex: 1, marginBottom: 0 }}>
                <input
                  type="text"
                  placeholder="Add custom inclusion..."
                  value={customInclusion}
                  onChange={e => setCustomInclusion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomInclusion()}
                />
              </div>
              <button className="btn-add-row" style={{ marginTop: 0 }} onClick={addCustomInclusion}>+ Add</button>
            </div>
          </div>
        )

      case 7:
        return (
          <div>
            <div className="form-section-title">Package Pricing</div>
            {pricingRows.map((row, idx) => (
              <div className="pricing-row" key={idx}>
                <div className="form-group dark" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 10 }}>Occupancy</label>
                  <input
                    type="text"
                    placeholder="e.g. Double Sharing"
                    value={row.occupancy}
                    onChange={e => updatePricingRow(idx, 'occupancy', e.target.value)}
                  />
                </div>
                <div className="form-group dark" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 10 }}>Hotel / Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Star Hotels"
                    value={row.details}
                    onChange={e => updatePricingRow(idx, 'details', e.target.value)}
                  />
                </div>
                <div className="form-group dark" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 10 }}>Price / Person (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. 12999"
                    value={row.price}
                    onChange={e => updatePricingRow(idx, 'price', e.target.value)}
                  />
                </div>
                <button className="btn-remove-row" onClick={() => removePricingRow(idx)}>✕</button>
              </div>
            ))}
            <button className="btn-add-row" onClick={addPricingRow}>+ Add Price Row</button>
            <div style={{ height: 1, background: '#2a2a2a', margin: '20px 0' }} />
            <div className="form-group dark">
              <label>Extra Person Cost (₹) — Child / Extra Bed</label>
              <input
                type="text"
                placeholder="e.g. 8500"
                value={extraPersonCost}
                onChange={e => setExtraPersonCost(e.target.value)}
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div>
            <div className="form-section-title">Terms & Policies</div>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
              Pre-filled with standard terms. Edit if needed for this package.
            </p>
            <div className="form-group dark">
              <label>Ã¢Å¡Â  Important Notes</label>
              <textarea rows={5} value={importantNotes} onChange={e => setImportantNotes(e.target.value)} />
            </div>
            <div className="form-group dark">
              <label>Booking Policy</label>
              <textarea rows={4} value={bookingPolicy} onChange={e => setBookingPolicy(e.target.value)} />
            </div>
            <div className="form-group dark">
              <label>Cancellation & Refund Policy</label>
              <textarea rows={5} value={cancellationPolicy} onChange={e => setCancellationPolicy(e.target.value)} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <button onClick={onBack} style={{
            background: '#2a2a2a', border: '1px solid #555', color: '#ccc',
            borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13,
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
            marginRight: 14, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='#E05A2B22'; e.currentTarget.style.borderColor='#E05A2B'; e.currentTarget.style.color='#E05A2B' }}
            onMouseLeave={e => { e.currentTarget.style.background='#2a2a2a'; e.currentTarget.style.borderColor='#555'; e.currentTarget.style.color='#ccc' }}
          >
            ← Back
          </button>
          <img src={sdLogo} alt="SD" onError={e => e.target.style.display='none'} style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div className="header-brand-text">
            <h2>{isEdit ? 'Edit PDF' : 'Create New PDF'}</h2>
            <span>Saurashtra Darshan</span>
          </div>
        </div>
        <div className="header-right">
          <span style={{ fontSize: 12, color: '#E05A2B', fontWeight: 700, padding: '4px 12px', background: '#E05A2B11', borderRadius: 20, border: '1px solid #E05A2B33' }}>
            {isEdit ? '✏️ Editing' : '🆕 New PDF'}
          </span>
        </div>
      </header>

      <div className="staff-layout">
        {/* LEFT: FORM */}
        <div className="form-panel">
          <div className="form-panel-header">
            <h3>Create New Itinerary PDF</h3>
            <p>Fill the details — live preview updates on the right</p>
          </div>

          {/* Step Tabs */}
          <div className="step-tabs">
            {STEPS.map(s => (
              <button
                key={s.id}
                className={`step-tab ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}
                onClick={() => {
                  setStep(s.id)
                  scrollToSection(s.id)
                }}
              >
                {step > s.id ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>

          {/* Form Body */}
          <div className="form-body">
            {renderStep()}
          </div>

          {/* Form Navigation Footer */}
          <div className="form-nav">
            <button
              className="btn-prev"
              onClick={() => {
                const prev = Math.max(1, step - 1)
                setStep(prev)
                scrollToSection(prev)
              }}
              disabled={step === 1}
            >
              ← Back
            </button>
            {step < STEPS.length ? (
              <button className="btn-next" onClick={() => {
                const next = Math.min(STEPS.length, step + 1)
                setStep(next)
                scrollToSection(next)
              }}>
                Next →
              </button>
            ) : (
              <button className="btn-next" style={{ background: 'linear-gradient(135deg, #27ae60, #1e8449)' }} onClick={handleDownload} disabled={generating}>
                {generating ? 'Generating...' : '⬇ Download PDF'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="preview-panel">
          <div className="preview-header">
            <h3>Live Preview</h3>
            {/* THEME SELECTOR */}
            <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
              {[
                { id: 'classic', label: '🏛 Classic', color: '#E05A2B' },
                { id: 'modern',  label: '✨ Modern',  color: '#00897b' },
                { id: 'minimal', label: '📄 Minimal', color: '#333' },
              ].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} style={{
                  padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 20, cursor: 'pointer',
                  background: theme === t.id ? t.color : 'transparent',
                  color: theme === t.id ? '#fff' : '#666',
                  border: '1.5px solid ' + (theme === t.id ? t.color : '#333'),
                  transition: 'all 0.2s',
                }}>
                  {t.label}
                </button>
              ))}
            </div>
            <button className="btn-download" onClick={handleDownload} disabled={generating}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {generating ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
          <div className="preview-body" ref={previewBodyRef}>
            <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', width: 794, marginBottom: -280 }}>
              {theme === 'modern'  ? <ModernTemplate  ref={templateRef} data={getPdfData()} /> :
               theme === 'minimal' ? <MinimalTemplate ref={templateRef} data={getPdfData()} /> :
               <ItineraryTemplate ref={templateRef} data={getPdfData()} />}
            </div>
          </div>
        </div>
      </div>

      {/* Generating Overlay */}
      {generating && (
        <div className="generating-overlay">
          <div className="generating-card">
            <div className="spinner" />
            <p>Generating your <strong>PDF</strong>...</p>
            <p style={{ fontSize: 12, marginTop: 8, color: '#666' }}>Please wait a moment</p>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {showWhatsapp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 16, padding: 32, minWidth: 340, maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e0e0e0', marginBottom: 6 }}>PDF Downloaded!</div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 18, lineHeight: '1.6' }}>
              PDF has been downloaded successfully! <br/>
              <span style={{ color: '#E05A2B', fontWeight: 'bold' }}>Note:</span> Open the chat below, then simply <strong>attach (paperclip icon) or drag-and-drop</strong> the downloaded PDF to send it.
            </div>
            <div className="form-group dark" style={{ textAlign: 'left', marginBottom: 16 }}>
              <label>Customer Mobile Number</label>
              <input
                type="tel"
                placeholder="e.g. 9825012345"
                value={whatsappNum}
                onChange={e => setWhatsappNum(e.target.value)}
                style={{ fontSize: 16 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href={'https://wa.me/91' + whatsappNum.replace(/\D/g,'')}
                target="_blank" rel="noopener noreferrer"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', background: '#25D366', color: '#fff',
                  border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.561 4.122 1.532 5.854L.057 23.75a.75.75 0 00.916.916l5.9-1.474A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.98 0-3.82-.558-5.387-1.521l-.385-.23-3.997.998 1.016-3.91-.253-.404A9.938 9.938 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Share on WhatsApp
              </a>
              <button onClick={() => setShowWhatsapp(false)} style={{
                flex: 0.6, padding: '12px', background: '#2a2a3a', color: '#888',
                border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
