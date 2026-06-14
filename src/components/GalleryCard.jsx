import { useState } from 'react'

function gradeColor(grade) {
  if (!grade) return '#64748b'
  if (grade.startsWith('A')) return '#22c55e'
  if (grade.startsWith('B')) return '#eab308'
  if (grade.startsWith('C')) return '#f97316'
  return '#ef4444'
}

function fmtPnl(val) {
  if (val === undefined || val === null) return '—'
  const abs = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return val >= 0 ? `+$${abs}` : `-$${abs}`
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function previewLines(text, n = 2) {
  if (!text) return ''
  return text.split('\n').filter(l => l.trim()).slice(0, n).join('\n')
}

export default function GalleryCard({ entry, onClick }) {
  const [hovered, setHovered] = useState(false)
  const pnlColor = entry.pnl > 0 ? '#22c55e' : entry.pnl < 0 ? '#ef4444' : '#f1f5f9'
  const thumb = entry.screenshots?.[0]

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: '#111827',
        border: '1px solid #1e2a3a',
        boxShadow: hovered ? '0 0 0 1px #38bdf8, 0 4px 24px rgba(56,189,248,0.08)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{ height: 180 }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt="Trade screenshot"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: '#0d1422' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e2a3a" strokeWidth="1.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span style={{ color: '#1e2a3a', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>No screenshot</span>
          </div>
        )}

        {/* Date + Grade overlay */}
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2"
          style={{
            background: thumb
              ? 'linear-gradient(to bottom, rgba(10,14,26,0.85) 0%, transparent 100%)'
              : 'transparent',
          }}
        >
          <span
            className="text-xs font-medium"
            style={{
              color: thumb ? '#f1f5f9' : '#64748b',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {fmtDate(entry.date)}
          </span>
          {entry.grade && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                color: gradeColor(entry.grade),
                background: 'rgba(10,14,26,0.7)',
                fontFamily: '"JetBrains Mono", monospace',
                border: `1px solid ${gradeColor(entry.grade)}40`,
              }}
            >
              {entry.grade}
            </span>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <span
          className="text-base font-bold"
          style={{ color: pnlColor, fontFamily: '"JetBrains Mono", monospace' }}
        >
          {fmtPnl(entry.pnl)}
        </span>
        {entry.journalText && (
          <p
            className="text-xs leading-relaxed"
            style={{
              color: '#64748b',
              fontFamily: 'Inter, sans-serif',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
            }}
          >
            {previewLines(entry.journalText)}
          </p>
        )}
      </div>
    </div>
  )
}
