import { forwardRef } from 'react'
import sdLogo from '../assets/logo.png'

// Brand Colors - matching logo
const ORANGE  = '#E05A2B'
const ORANGE2 = '#c04820'
const DARK    = '#1a1a1a'
const CHARCOAL= '#2d2d2d'
const CREAM   = '#fdf8f5'

function parseLines(text, defaults) {
  if (!text || !text.trim()) return defaults
  return text.split('\n').map(l => l.replace(/^[*\-]\s*/, '').trim()).filter(Boolean)
}

const DEFAULT_EXCL = [
  'Any Adventure Activity, River Rafting, Skiing, Paragliding.',
  'Any Personal Expenses - Laundry, Shopping, Tip etc.',
  'Airfare / Train fare / Bus Fare.',
  'Zoo Ticket, Ride cost, Monument or Fort entrance fee.',
]

function DayBlock({ day }) {
  const lines = (day.description || '').split('\n').filter(Boolean)
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        background: 'linear-gradient(90deg, ' + ORANGE + ' 0%, ' + ORANGE2 + ' 100%)',
        color: '#fff', padding: '9px 20px', borderRadius: 6,
        fontWeight: 800, fontSize: 13, marginBottom: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>DAY {day.dayNo}{day.title ? '  —  ' + day.title : ''}</span>
        {day.date && <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.85 }}>{day.date}</span>}
      </div>
      <ul style={{ paddingLeft: 20, margin: 0 }}>
        {lines.length > 0 ? lines.map((l, i) => (
          <li key={i} style={{ fontSize: 12, lineHeight: 1.85, color: '#333', marginBottom: 1 }}>{l}</li>
        )) : (
          <li style={{ color: '#bbb', fontStyle: 'italic', fontSize: 12 }}>No activities added.</li>
        )}
      </ul>
    </div>
  )
}

const PageS = {
  width: 794, minHeight: 1123,
  background: CREAM,
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: DARK,
  position: 'relative',
  overflow: 'hidden',
  pageBreakAfter: 'always',
  marginBottom: 2,
}

// Compact header for inner pages
function CompactHeader({ data }) {
  return (
    <div style={{
      background: DARK, padding: '12px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: ORANGE, borderRadius: 6, padding: '4px 6px', display: 'flex', alignItems: 'center' }}>
          <img src={sdLogo} alt="SD" style={{ width: 28, height: 28, objectFit: 'contain' }}
            onError={e => e.target.style.display='none'} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: 0.5 }}>
            SAURASHTRA <span style={{ color: ORANGE }}>DARSHAN</span>
          </div>
          <div style={{ color: '#888', fontSize: 9, letterSpacing: 1.5 }}>TOUR & TRAVELS</div>
        </div>
      </div>
      {data.tourName && (
        <div style={{ color: '#aaa', fontSize: 11 }}>{data.tourName}</div>
      )}
    </div>
  )
}

// Full logo header for page 1
function LogoHeader({ data }) {
  return (
    <div style={{ background: DARK, padding: '28px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: ORANGE, borderRadius: 12, padding: '8px 10px' }}>
            <img src={sdLogo} alt="SD" style={{ width: 52, height: 52, objectFit: 'contain' }}
              onError={e => e.target.style.display='none'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 30, letterSpacing: 1 }}>SAURASHTRA</span>
              <span style={{ background: ORANGE, color: '#fff', fontWeight: 800, fontSize: 30, letterSpacing: 2, padding: '2px 14px', borderRadius: 4 }}>DARSHAN</span>
            </div>
            <div style={{ color: '#777', fontSize: 11, letterSpacing: 3, marginTop: 2 }}>TOUR & TRAVELS</div>
          </div>
        </div>
        {data.tourCode && (
          <div style={{ background: '#2a2a2a', border: '1px solid #444', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ color: '#777', fontSize: 9, letterSpacing: 1.5 }}>TOUR CODE</div>
            <div style={{ color: ORANGE, fontWeight: 800, fontSize: 14, marginTop: 2 }}>{data.tourCode}</div>
          </div>
        )}
      </div>

      {/* Orange divider line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,' + ORANGE + ',transparent)', borderRadius: 2, marginTop: 20 }} />

      {/* Tour name banner */}
      {data.tourName && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: 1, textTransform: 'uppercase' }}>
            {data.tourName}
          </div>
          {data.duration && (
            <div style={{ color: ORANGE, fontWeight: 600, fontSize: 13, marginTop: 4, letterSpacing: 0.5 }}>
              {data.duration}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ModernTemplate = forwardRef(function ModernTemplate({ data }, ref) {
  const days        = data.days || []
  const inclusions  = (data.inclusions || []).filter(Boolean)
  const pricingRows = (data.pricingRows || []).filter(r => r.occupancy || r.price)

  return (
    <div ref={ref} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* ===== PAGE 1 ===== */}
      <div style={PageS}>
        <LogoHeader data={data} />

        <div style={{ padding: '20px 40px' }}>
          {/* Guest Strip */}
          <div style={{
            background: '#fff', border: '1px solid #e8ddd8',
            borderLeft: '4px solid ' + ORANGE,
            borderRadius: 8, padding: '14px 20px',
            display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 18,
            boxShadow: '0 2px 12px rgba(224,90,43,0.06)',
          }}>
            {[
              { label: 'GUEST', val: data.guestName },
              { label: 'MOBILE', val: data.mobile },
              { label: 'PAX', val: data.pax },
              { label: 'TRAVEL DATE', val: data.travelDate },
            ].filter(f => f.val).map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 9, fontWeight: 800, color: ORANGE, letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.label}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: DARK, marginTop: 2 }}>{f.val}</div>
              </div>
            ))}
          </div>

          {/* Greeting */}
          <div style={{ marginBottom: 16, padding: '14px 18px', background: '#fff', borderRadius: 8, border: '1px solid #ede5e0' }}>
            {data.guestName && (
              <div style={{ color: ORANGE, fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                Dear {data.guestName},
              </div>
            )}
            <p style={{ fontSize: 12, color: '#444', lineHeight: 1.75, margin: 0 }}>
              {data.greetings || 'Greetings from "Saurashtra Darshan Tours"! We are delighted to present your personalised tour itinerary.'}
            </p>
          </div>

          {/* Reach By */}
          {(data.reachTo || data.reachDate) && (
            <div style={{
              background: CHARCOAL, color: '#fff', borderRadius: 8,
              padding: '14px 20px', marginBottom: 18,
              borderLeft: '4px solid ' + ORANGE,
            }}>
              <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 0.5, color: ORANGE }}>
                REACH BY {(data.reachTo || '').toUpperCase()} ON YOUR OWN
              </div>
              {(data.reachDate || data.reachTime) && (
                <div style={{ fontWeight: 500, fontSize: 12, marginTop: 5, color: '#ccc' }}>
                  {[data.reachDate, data.reachTime, data.flightTrain].filter(Boolean).join('  |  ')}
                </div>
              )}
            </div>
          )}

          {/* Day 1 */}
          {days[0] && <DayBlock day={days[0]} />}
        </div>
      </div>

      {/* ===== DAY PAGES ===== */}
      {Array.from({ length: Math.ceil((days.length - 1) / 5) }, (_, pi) => {
        const pageDays = days.slice(1 + pi * 5, 1 + (pi + 1) * 5)
        const isLast   = pi === Math.ceil((days.length - 1) / 5) - 1
        return (
          <div key={pi} style={PageS}>
            <CompactHeader data={data} />
            <div style={{ padding: '20px 40px' }}>
              {pageDays.map((day, idx) => <DayBlock key={idx} day={day} />)}
              {isLast && data.dropPoint && (
                <div style={{
                  background: CHARCOAL, color: '#fff', borderRadius: 8,
                  padding: '14px 20px', borderLeft: '4px solid ' + ORANGE, marginTop: 10,
                }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: ORANGE }}>
                    DROP AT {data.dropPoint.toUpperCase()}
                  </div>
                  {data.dropDate && (
                    <div style={{ fontSize: 12, color: '#ccc', marginTop: 4 }}>{data.dropDate}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* ===== MEALS + INCLUSIONS + PRICING ===== */}
      <div id="pdf-sect-5" style={PageS}>
        <CompactHeader data={data} />
        <div style={{ padding: '20px 40px' }}>
          <div style={{
            background: ORANGE, color: '#fff',
            padding: '8px 16px', borderRadius: 6, fontWeight: 900,
            fontSize: 14, letterSpacing: 0.5, marginBottom: 16, display: 'inline-block',
          }}>
            Meals During The Tour
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 22 }}>
            <tbody>
              {[['Breakfast', data.breakfast || 'Included at hotel — served as per tour schedule.'],
                ['Dinner',    data.dinner    || 'Included at hotel — served as per tour schedule.']].map(([meal, detail]) => (
                <tr key={meal}>
                  <td style={{ border: '1px solid #ddd', padding: '10px 14px', fontWeight: 800, width: 120, background: '#fff', color: ORANGE }}>
                    ❖ {meal}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '10px 14px', fontSize: 12, background: '#fff' }}>
                    {detail.split('\n').map((l, i) => <div key={i}><strong>{l}</strong></div>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inclusions.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{
                background: CHARCOAL, color: '#fff',
                padding: '8px 16px', borderRadius: 6, fontWeight: 900,
                fontSize: 13, marginBottom: 12, display: 'inline-block',
              }}>
                TOUR OF {data.duration || ''} — Package Includes
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {inclusions.map((inc, i) => (
                  <div key={i} style={{
                    background: '#fff', border: '1px solid #ede5e0',
                    borderLeft: '3px solid ' + ORANGE,
                    borderRadius: 6, padding: '7px 12px',
                    fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, color: DARK,
                  }}>
                    <span style={{ color: ORANGE, fontWeight: 800, fontSize: 14 }}>•</span> {inc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pricingRows.length > 0 && (
            <div>
              <div style={{
                background: ORANGE, color: '#fff',
                padding: '8px 16px', borderRadius: 6, fontWeight: 900,
                fontSize: 13, marginBottom: 12, display: 'inline-block',
              }}>
                Package Pricing
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: CHARCOAL }}>
                    {['Occupancy', 'Details (Veg Food)', 'Price Per Person'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', color: '#fff', fontWeight: 700, textAlign: 'left', fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fdf3ef' }}>
                      <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, color: ORANGE, border: '1px solid #ede5e0' }}>{r.occupancy}</td>
                      <td style={{ padding: '9px 14px', fontSize: 12, border: '1px solid #ede5e0' }}>{r.details}</td>
                      <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 800, border: '1px solid #ede5e0' }}>{r.price ? '₹ ' + r.price + '/-' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== INCLUSIONS/EXCLUSIONS + CONTACT ===== */}
      <div id="pdf-sect-6" style={PageS}>
        <CompactHeader data={data} />
        <div style={{ padding: '20px 40px' }}>
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: ORANGE, marginBottom: 16, letterSpacing: 0.5 }}>
            "TOURS END BUT SWEET MEMORIES ALWAYS REMAIN SAME"
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 22 }}>
            <thead>
              <tr>
                <th style={{ background: ORANGE, color: '#fff', padding: '10px 14px', fontSize: 12, fontWeight: 800, width: '50%' }}>PACKAGE INCLUSIONS</th>
                <th style={{ background: CHARCOAL, color: '#fff', padding: '10px 14px', fontSize: 12, fontWeight: 800, width: '50%' }}>PACKAGE EXCLUSIONS</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(inclusions.length, DEFAULT_EXCL.length) }, (_, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fdf8f5' }}>
                  <td style={{ padding: '8px 14px', fontSize: 11, verticalAlign: 'top', lineHeight: 1.65, border: '1px solid #ede5e0' }}>{inclusions[i] || ''}</td>
                  <td style={{ padding: '8px 14px', fontSize: 11, verticalAlign: 'top', lineHeight: 1.65, border: '1px solid #ede5e0' }}>{DEFAULT_EXCL[i] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Contact */}
          <div style={{ background: DARK, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Thanks & Warm Regards....!! 🙏
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, lineHeight: 2 }}>
              {[
                ['📞 Mobile', data.contactNumber || '99799 22797'],
                ['📧 Email', 'saurashtradarshan2023@gmail.com'],
                ['🌐 Website', 'www.saurashtradarshantour.com'],
                ['🏢 Branches', data.branches || 'Rajkot | Gondal | Jetpur | Porbandar'],
              ].map(([label, val]) => (
                <div key={label} style={{ color: '#ccc' }}>
                  <span style={{ color: ORANGE, fontWeight: 700 }}>{label}:</span> {val}
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 40, fontWeight: 900, color: ORANGE }}>THANK YOU !!</div>
        </div>
      </div>

      {/* ===== TERMS PAGE ===== */}
      <div id="pdf-sect-8" style={PageS}>
        <CompactHeader data={data} />
        <div style={{ padding: '20px 40px' }}>
          {[
            { title: 'IMPORTANT NOTE', items: parseLines(data.importantNotes, ['Rates are valid for the mentioned dates only.', 'GST extra as applicable.', 'Package cost does not include any personal expenses.']) },
            { title: 'ADVANCE BOOKING POLICY', items: parseLines(data.bookingPolicy, ['20% advance required to confirm the package.', 'Balance to be paid before departure.']) },
            { title: 'CANCELLATION & REFUND POLICY', items: parseLines(data.cancellationPolicy, ['30+ days: 10% charge.', '15-29 days: 25% charge.', '7-14 days: 50% charge.', 'Less than 7 days / No show: 100% charge.']) },
            { title: 'AMENDMENT POLICY', items: ['Please contact 7 days before journey via mail, WhatsApp, or call.'] },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: 20 }}>
              <div style={{
                background: 'linear-gradient(90deg,' + ORANGE + ',' + ORANGE2 + ')',
                color: '#fff', padding: '8px 16px', borderRadius: 6,
                fontWeight: 800, fontSize: 12, marginBottom: 10, letterSpacing: 0.5,
              }}>
                {section.title}
              </div>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{ fontSize: 12, lineHeight: 1.8, color: '#333', marginBottom: 2 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default ModernTemplate
