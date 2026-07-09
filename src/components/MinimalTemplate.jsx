import { forwardRef } from 'react'
import sdLogo from '../assets/logo.png'

const GRY = '#555'
const BLK = '#111'

function parseLines(text, defaults) {
  if (!text || !text.trim()) return defaults
  return text.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
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
    <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #eee' }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: BLK, marginBottom: 6, display: 'flex', gap: 12 }}>
        <span>DAY {day.dayNo}{day.title ? ' — ' + day.title : ''}</span>
        {day.date && <span style={{ fontWeight: 400, color: GRY, fontSize: 12 }}>{day.date}</span>}
      </div>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {lines.length > 0 ? lines.map((l, i) => (
          <li key={i} style={{ fontSize: 12, lineHeight: 1.8, color: '#444' }}>{l}</li>
        )) : (
          <li style={{ color: '#bbb', fontStyle: 'italic', fontSize: 12 }}>No activities.</li>
        )}
      </ul>
    </div>
  )
}

const PageS = {
  width: 794, minHeight: 1123, background: '#ffffff',
  fontFamily: '"Georgia", serif', color: BLK,
  position: 'relative', overflow: 'hidden', pageBreakAfter: 'always', marginBottom: 2,
}

function Header({ data, isFirst }) {
  if (isFirst) return null
  return (
    <div style={{ borderBottom: '2px solid ' + BLK, padding: '12px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: BLK }}>Saurashtra Darshan</div>
      {data.tourName && <div style={{ fontSize: 11, color: GRY }}>{data.tourName}</div>}
    </div>
  )
}

const MinimalTemplate = forwardRef(function MinimalTemplate({ data }, ref) {
  const days = data.days || []
  const inclusions = (data.inclusions || []).filter(Boolean)
  const pricingRows = (data.pricingRows || []).filter(r => r.occupancy || r.price)

  return (
    <div ref={ref} style={{ fontFamily: '"Georgia", serif' }}>

      {/* PAGE 1 */}
      <div style={PageS}>
        <div style={{ padding: '48px 56px 0' }}>
          {/* Minimal Logo Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 24, borderBottom: '3px solid ' + BLK }}>
            <img src={sdLogo} alt="SD" style={{ width: 56, height: 56, objectFit: 'contain' }}
              onError={e => e.target.style.display='none'} />
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, color: BLK, fontFamily: 'Arial, sans-serif' }}>
                SAURASHTRA DARSHAN
              </div>
              <div style={{ fontSize: 11, color: GRY, letterSpacing: 3, textTransform: 'uppercase' }}>Tour & Travels</div>
            </div>
          </div>

          {/* Tour Title */}
          {data.tourName && (
            <div style={{ textAlign: 'center', padding: '24px 0 0', fontSize: 22, fontWeight: 900, letterSpacing: 1, color: BLK }}>
              {data.tourName.toUpperCase()}
              {data.duration && <div style={{ fontSize: 13, fontWeight: 400, color: GRY, marginTop: 4, letterSpacing: 0 }}>{data.duration}</div>}
            </div>
          )}

          {/* Guest Info Line */}
          {(data.guestName || data.travelDate) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '16px 0', fontSize: 12, color: GRY }}>
              {data.guestName    && <span>Guest: <strong style={{ color: BLK }}>{data.guestName}</strong></span>}
              {data.mobile       && <span>Mobile: <strong style={{ color: BLK }}>{data.mobile}</strong></span>}
              {data.pax          && <span>Pax: <strong style={{ color: BLK }}>{data.pax}</strong></span>}
              {data.travelDate   && <span>Date: <strong style={{ color: BLK }}>{data.travelDate}</strong></span>}
            </div>
          )}

          <div style={{ borderTop: '1px solid #ddd', marginTop: 8, paddingTop: 20 }}>
            {data.guestName && <p style={{ fontSize: 13, fontStyle: 'italic', color: BLK, marginBottom: 8 }}>Dear {data.guestName},</p>}
            <p style={{ fontSize: 12, lineHeight: 1.8, color: '#444', marginBottom: 16 }}>
              {data.greetings || 'Greetings from "Saurashtra Darshan Tours"! We are delighted to present your personalised tour itinerary.'}
            </p>
          </div>

          {(data.reachTo || data.reachDate) && (
            <div style={{ borderLeft: '3px solid ' + BLK, paddingLeft: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Reach By {data.reachTo || ''} on your own
              </div>
              {(data.reachDate || data.reachTime) && (
                <div style={{ fontSize: 12, color: GRY, marginTop: 2 }}>
                  {[data.reachDate, data.reachTime].filter(Boolean).join(' ')}
                </div>
              )}
            </div>
          )}

          {days[0] && <DayBlock day={days[0]} />}
        </div>
      </div>

      {/* DAY PAGES */}
      {Array.from({ length: Math.ceil((days.length - 1) / 5) }, (_, pi) => {
        const pageDays = days.slice(1 + pi * 5, 1 + (pi + 1) * 5)
        return (
          <div key={pi} style={PageS}>
            <Header data={data} />
            <div style={{ padding: '24px 56px' }}>
              {pageDays.map((day, idx) => <DayBlock key={idx} day={day} />)}
              {pi === Math.ceil((days.length - 1) / 5) - 1 && data.dropPoint && (
                <div style={{ borderLeft: '3px solid ' + BLK, paddingLeft: 16, marginTop: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase' }}>
                    Drop at {data.dropPoint}
                  </div>
                  {data.dropDate && <div style={{ fontSize: 12, color: GRY }}>{data.dropDate}</div>}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* MEALS + PRICING */}
      <div id="pdf-sect-5" style={PageS}>
        <Header data={data} />
        <div style={{ padding: '24px 56px' }}>
          <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.5, marginBottom: 16, paddingBottom: 6, borderBottom: '1px solid #ddd' }}>
            Meals During The Tour
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <tbody>
              {[['Breakfast', data.breakfast || 'Included at hotel - served as per tour schedule.'], ['Dinner', data.dinner || 'Included at hotel - served as per tour schedule.']].map(([meal, detail]) => (
                <tr key={meal}>
                  <td style={{ border: '1px solid #ddd', padding: '10px 14px', fontWeight: 800, width: 120 }}>{meal}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px 14px', fontSize: 12 }}>
                    {detail.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inclusions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>Package Includes</div>
              <ul style={{ columns: 2, paddingLeft: 20, margin: 0 }}>
                {inclusions.map((inc, i) => (
                  <li key={i} style={{ fontSize: 12, lineHeight: 1.8 }}>{inc}</li>
                ))}
              </ul>
            </div>
          )}

          {pricingRows.length > 0 && (
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>Pricing</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid ' + BLK }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Occupancy</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Details</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Price/Person</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>{r.occupancy}</td>
                      <td style={{ padding: '8px 12px', fontSize: 12 }}>{r.details}</td>
                      <td style={{ padding: '8px 12px', fontSize: 12 }}>{r.price ? '₹ ' + r.price + '/-' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CONTACT + TERMS */}
      <div id="pdf-sect-6" style={PageS}>
        <Header data={data} />
        <div style={{ padding: '24px 56px' }}>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid #ddd' }}>
            Package Inclusions & Exclusions
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + BLK }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, width: '50%' }}>Inclusions</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, width: '50%' }}>Exclusions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(inclusions.length, DEFAULT_EXCL.length) }, (_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '7px 12px', fontSize: 11.5, verticalAlign: 'top', lineHeight: 1.6 }}>{inclusions[i] || ''}</td>
                  <td style={{ padding: '7px 12px', fontSize: 11.5, verticalAlign: 'top', lineHeight: 1.6 }}>{DEFAULT_EXCL[i] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '2px solid ' + BLK, paddingTop: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 10 }}>Contact Us</div>
            <div style={{ fontSize: 12, lineHeight: 2.2 }}>
              <div><strong>Mobile:</strong> {data.contactNumber || '99799 22797'}</div>
              <div><strong>Email:</strong> saurashtradarshan2023@gmail.com</div>
              <div><strong>Website:</strong> www.saurashtradarshantour.com</div>
              <div><strong>Office:</strong> "Saurashtra Darshan Tour", 2nd Floor, Opp. Indian Petrol Pump, Veraval (362 265), Gujarat</div>
              <div><strong>Branches:</strong> {data.branches || 'Ahmedabad, Kerala, Mysore, Rajasthan'}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, letterSpacing: 2, borderTop: '2px solid ' + BLK, paddingTop: 20 }}>
            THANK YOU
          </div>
        </div>
      </div>

      {/* TERMS */}
      <div id="pdf-sect-8" style={PageS}>
        <Header data={data} />
        <div style={{ padding: '24px 56px' }}>
          {[
            { title: 'Important Note', items: parseLines(data.importantNotes, ['The package can be customized.', 'Check-in/out at 12:00 Noon.', 'Meal timings as per hotel schedule.']) },
            { title: 'Advance Booking Policy', items: parseLines(data.bookingPolicy, ['20% advance to confirm booking.', 'Balance payable on arrival.']) },
            { title: 'Cancellation & Refund Policy', items: parseLines(data.cancellationPolicy, ['No contract until deposit received.', '50% non-refundable within 15 days.']) },
            { title: 'Amendment Policy (Prepone & Postpone)', items: ['Kindly contact 7 days before journey via mail, WhatsApp, or call.'] },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #ddd' }}>
                {section.title}
              </div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{ fontSize: 11.5, lineHeight: 1.8, color: '#333' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default MinimalTemplate
