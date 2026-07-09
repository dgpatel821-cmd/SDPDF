import { forwardRef } from 'react'
import sdLogo from '../assets/logo.png'

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

const DEFAULT_IMPORTANT_NOTES = [
  'The above package can be customized per the customer requirement.',
  'Check-in and Check-out Time is 12:00 Noon as per Hotel Policies.',
  'Meals Timings will be as per Hotel Rules.',
  'We are not responsible for any flight/train delay.',
  'Any cost arising due to natural calamities, landslides, road blocks etc. to be borne by client.',
  'Children between 5-12 years old and adults (Above 12 years old) would cost extra according to the company\'s policies.',
]

const DEFAULT_BOOKING_POLICY = [
  '20% advance payment required to confirm the package.',
  'Balance payment to be paid on arrival to the tour manager.',
  'Booking confirmation voucher will be shared post receipt of advance payment.',
]

const DEFAULT_CANCELLATION = [
  'No contract exists between us until we receive your deposit.',
  '50% cancellation fee of the advance payment if cancelled within 15 days of departure.',
  '100% cancellation fee of the advance payment if cancelled within 7 days of departure.',
]

function DayBlock({ day }) {
  const lines = (day.description || '').split('\n').filter(Boolean)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        background: '#E05A2B', color: '#fff', padding: '6px 14px', borderRadius: 4,
        fontWeight: 800, fontSize: 13, marginBottom: 8, display: 'flex', justifyContent: 'space-between',
      }}>
        <span>DAY {day.dayNo}{day.title ? ' — ' + day.title : ''}</span>
        {day.date && <span style={{ fontWeight: 400, fontSize: 12 }}>{day.date}</span>}
      </div>
      <ul style={{ paddingLeft: 20, margin: 0 }}>
        {lines.length > 0 ? lines.map((l, i) => (
          <li key={i} style={{ fontSize: 12, lineHeight: 1.8, color: '#333' }}>{l}</li>
        )) : (
          <li style={{ color: '#aaa', fontStyle: 'italic', fontSize: 12 }}>No activities added.</li>
        )}
      </ul>
    </div>
  )
}

const PageS = {
  width: 794, minHeight: 1123, background: '#fff',
  fontFamily: 'Arial, Helvetica, sans-serif', color: '#1a1a1a',
  position: 'relative', overflow: 'hidden', pageBreakAfter: 'always', marginBottom: 2,
}

// Logo Header with single line "SAURASHTRA" & "DARSHAN" (Orange box)
function LogoHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px', borderBottom: '3px solid #E05A2B' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src={sdLogo} alt="Logo" style={{ width: 56, height: 56, objectFit: 'contain' }}
          onError={e => e.target.style.display='none'} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#000', letterSpacing: 1 }}>SAURASHTRA</span>
            <span style={{ background: '#E05A2B', color: '#fff', fontWeight: 800, fontSize: 24, padding: '2px 10px', borderRadius: 4, letterSpacing: 1 }}>DARSHAN</span>
          </div>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: 2.5, marginTop: 2 }}>TOUR & TRAVELS</div>
        </div>
      </div>
    </div>
  )
}

const ItineraryTemplate = forwardRef(function ItineraryTemplate({ data }, ref) {
  const days = data.days || []
  const inclusions = (data.inclusions || []).filter(Boolean)
  const pricingRows = (data.pricingRows || []).filter(r => r.occupancy || r.price)

  return (
    <div ref={ref} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* PAGE 1 */}
      <div style={PageS}>
        <LogoHeader />
        <div style={{ padding: '24px 48px' }}>
          {/* Guest Details Panel */}
          <div style={{ background: '#fcfcfc', border: '1px solid #eee', borderRadius: 8, padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 20 }}>
            {data.guestName && <div><span style={{ color: '#666', fontSize: 11 }}>GUEST NAME:</span><div style={{ fontWeight: 800, fontSize: 14 }}>{data.guestName}</div></div>}
            {data.mobile    && <div><span style={{ color: '#666', fontSize: 11 }}>MOBILE NO:</span><div style={{ fontWeight: 800, fontSize: 14 }}>{data.mobile}</div></div>}
            {data.pax       && <div><span style={{ color: '#666', fontSize: 11 }}>TOTAL PAX:</span><div style={{ fontWeight: 800, fontSize: 14 }}>{data.pax} Person(s)</div></div>}
            {data.travelDate && <div><span style={{ color: '#666', fontSize: 11 }}>TRAVEL DATE:</span><div style={{ fontWeight: 800, fontSize: 14 }}>{data.travelDate}</div></div>}
          </div>

          {/* Tour Title Banner */}
          {data.tourName && (
            <div style={{ background: '#E05A2B10', borderLeft: '4px solid #E05A2B', padding: '14px 20px', borderRadius: '0 8px 8px 0', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#E05A2B', fontWeight: 800, letterSpacing: 0.5 }}>PROPOSED ITINERARY</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#000', margin: '4px 0 0' }}>{data.tourName.toUpperCase()}</h2>
              {data.duration && <div style={{ fontSize: 12, color: '#444', marginTop: 2, fontWeight: 700 }}>Duration: {data.duration}</div>}
            </div>
          )}

          {/* Greeting */}
          <div style={{ background: '#fcfcfc', borderRadius: 8, padding: '16px 20px', marginBottom: 20, border: '1px solid #eee' }}>
            <p style={{ fontSize: 12, color: '#444', lineHeight: 1.75, margin: 0 }}>
              {data.greetings || 'Dear Guest, Thank you for choosing Saurashtra Darshan Tour. We are delighted to present your personalised tour itinerary.'}
            </p>
          </div>

          {/* Reach By */}
          {(data.reachTo || data.reachDate) && (
            <div style={{ background: '#fdf3ef', border: '1px solid #fadcd0', borderRadius: 8, padding: '14px 20px', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: '#E05A2B', fontSize: 13 }}>REACH BY {data.reachTo ? data.reachTo.toUpperCase() : ''} ON YOUR OWN</div>
              {(data.reachDate || data.reachTime) && (
                <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>
                  {[data.reachDate, data.reachTime].filter(Boolean).join(' at ')}
                  {data.flightTrain && ` (${data.flightTrain})`}
                </div>
              )}
            </div>
          )}

          {/* Day 1 */}
          {days[0] && <DayBlock day={days[0]} />}
        </div>
      </div>

      {/* DAY PAGES */}
      {Array.from({ length: Math.ceil((days.length - 1) / 5) }, (_, pi) => {
        const pageDays = days.slice(1 + pi * 5, 1 + (pi + 1) * 5)
        return (
          <div key={pi} style={PageS}>
            <LogoHeader />
            <div style={{ padding: '24px 48px' }}>
              {pageDays.map((day, idx) => <DayBlock key={idx} day={day} />)}
              {pi === Math.ceil((days.length - 1) / 5) - 1 && data.dropPoint && (
                <div style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, padding: '14px 20px', marginTop: 10 }}>
                  <div style={{ fontWeight: 800, color: '#333', fontSize: 13 }}>DROP AT {data.dropPoint.toUpperCase()}</div>
                  {data.dropDate && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{data.dropDate}</div>}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* MEALS + PRICING PAGE */}
      <div id="pdf-sect-5" style={PageS}>
        <LogoHeader />
        <div style={{ padding: '24px 48px' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#000', marginBottom: 12, borderBottom: '2px solid #E05A2B', paddingBottom: 4 }}>
            Meals During The Tour
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <tbody>
              {[['Breakfast', data.breakfast || 'Included at hotel - served as per tour schedule.'], ['Dinner', data.dinner || 'Included at hotel - served as per tour schedule.']].map(([meal, detail]) => (
                <tr key={meal}>
                  <td style={{ border: '1px solid #ddd', padding: '10px 14px', fontWeight: 800, width: 120, background: '#fcfcfc', color: '#E05A2B' }}>❖ {meal}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px 14px', fontSize: 12 }}>
                    {detail.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inclusions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 8 }}>Package Inclusions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {inclusions.map((inc, i) => (
                  <div key={i} style={{ background: '#fdfdfd', border: '1px solid #eee', borderRadius: 4, padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#E05A2B', fontWeight: 800 }}>✓</span> {inc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pricingRows.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#000', marginBottom: 8 }}>Pricing</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fcfcfc', borderBottom: '2px solid #E05A2B' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Occupancy</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Details (Veg Food)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Price Per Person</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>{r.occupancy}</td>
                      <td style={{ padding: '8px 12px', fontSize: 12 }}>{r.details}</td>
                      <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>{r.price ? '₹ ' + r.price + '/-' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CONTACT + TERMS PAGE */}
      <div id="pdf-sect-6" style={PageS}>
        <LogoHeader />
        <div style={{ padding: '24px 48px' }}>
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#E05A2B', marginBottom: 16, letterSpacing: 0.5 }}>
            "TOURS END BUT SWEET MEMORIES ALWAYS REMAIN SAME"
          </div>

          {/* Inc/Exc */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr>
                <th style={{ background: '#E05A2B', color: '#fff', padding: '8px 12px', fontSize: 12, fontWeight: 800, width: '50%' }}>INCLUSIONS</th>
                <th style={{ background: '#333', color: '#fff', padding: '8px 12px', fontSize: 12, fontWeight: 800, width: '50%' }}>EXCLUSIONS</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(inclusions.length, DEFAULT_EXCL.length) }, (_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 12px', fontSize: 11, verticalAlign: 'top', lineHeight: 1.6 }}>{inclusions[i] || ''}</td>
                  <td style={{ padding: '6px 12px', fontSize: 11, verticalAlign: 'top', lineHeight: 1.6 }}>{DEFAULT_EXCL[i] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Contact */}
          <div style={{ background: '#fcfcfc', border: '1px solid #eee', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#E05A2B', marginBottom: 8 }}>Thanks & Warm Regards....!!</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, lineHeight: 1.8 }}>
              <div><strong>Mobile:</strong> {data.contactNumber || '99799 22797'}</div>
              <div><strong>Email:</strong> saurashtradarshan2023@gmail.com</div>
              <div><strong>Website:</strong> www.saurashtradarshantour.com</div>
              <div><strong>Branches:</strong> {data.branches || 'Ahmedabad, Kerala, Mysore'}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 40, fontWeight: 900, color: '#E05A2B' }}>THANK YOU !!</div>
        </div>
      </div>

      {/* TERMS PAGE */}
      <div id="pdf-sect-8" style={PageS}>
        <LogoHeader />
        <div style={{ padding: '24px 48px' }}>
          {[
            { title: 'IMPORTANT NOTE', items: parseLines(data.importantNotes, DEFAULT_IMPORTANT_NOTES) },
            { title: 'ADVANCE BOOKING POLICY', items: parseLines(data.bookingPolicy, DEFAULT_BOOKING_POLICY) },
            { title: 'CANCELLATION & REFUND POLICY', items: parseLines(data.cancellationPolicy, DEFAULT_CANCELLATION) },
            { title: 'AMENDMENT POLICY', items: ['Please contact us 7 days before journey date via mail, WhatsApp, or call.'] },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: 18 }}>
              <div style={{ background: '#f5f5f5', borderLeft: '3px solid #E05A2B', color: '#333', padding: '6px 12px', fontWeight: 800, fontSize: 12, marginBottom: 8 }}>
                {section.title}
              </div>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{ fontSize: 11, lineHeight: 1.7, color: '#444' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default ItineraryTemplate
