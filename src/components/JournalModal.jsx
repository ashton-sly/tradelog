import { useState, useEffect, useCallback } from 'react'

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
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function JournalModal({ entry, onClose, onEdit, onDelete }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const shots = entry.screenshots || []
  const pnlColor = entry.pnl > 0 ? '#22c55e' : entry.pnl < 0 ? '#ef4444' : '#f1f5f9'

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight' && shots.length > 1) setImgIdx(i => (i + 1) % shots.length)
    if (e.key === 'ArrowLeft' && shots.length > 1) setImgIdx(i => (i - 1 + shots.length) % shots.length)
  }, [onClose, shots.length])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden my-auto"
        style={{ background: '#111827', border: '1px solid #1e2a3a' }}
      >
        {/* Modal header */}
        <div
          className="flex items-start justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #1e2a3a' }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: '#64748b', fontFamily: 'Inter' }}>
              {fmtDate(entry.date)}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span
                className="text-2xl font-bold"
                style={{ color: pnlColor, fontFamily: '"JetBrains Mono", monospace' }}
              >
                {fmtPnl(entry.pnl)}
              </span>
              {entry.grade && (
                <span
                  className="text-sm font-bold px-2 py-1 rounded"
                  style={{
                    color: gradeColor(entry.grade),
                    background: `${gradeColor(entry.grade)}18`,
                    border: `1px solid ${gradeColor(entry.grade)}40`,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {entry.grade}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: '#64748b', background: '#0a0e1a' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Screenshots carousel */}
        {shots.length > 0 && (
          <div className="relative" style={{ background: '#0a0e1a' }}>
            <img
              src={shots[imgIdx]}
              alt={`Screenshot ${imgIdx + 1}`}
              style={{
                width: '100%',
                maxHeight: 420,
                objectFit: 'contain',
                display: 'block',
              }}
            />
            {shots.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + shots.length) % shots.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(10,14,26,0.8)', color: '#f1f5f9', border: '1px solid #1e2a3a' }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % shots.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(10,14,26,0.8)', color: '#f1f5f9', border: '1px solid #1e2a3a' }}
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {shots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className="rounded-full transition-all"
                      style={{
                        width: i === imgIdx ? 20 : 6,
                        height: 6,
                        background: i === imgIdx ? '#38bdf8' : '#1e2a3a',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Journal text */}
        {entry.journalText && (
          <div className="px-6 py-5" style={{ borderTop: shots.length ? '1px solid #1e2a3a' : 'none' }}>
            <span className="text-xs uppercase tracking-widest block mb-3" style={{ color: '#64748b' }}>
              Journal
            </span>
            <div
              className="rounded-lg p-4 overflow-y-auto text-sm leading-relaxed"
              style={{
                background: '#0a0e1a',
                color: '#f1f5f9',
                fontFamily: '"JetBrains Mono", monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: 320,
                border: '1px solid #1e2a3a',
              }}
            >
              {entry.journalText}
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid #1e2a3a' }}
        >
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: '#ef4444', background: '#ef444418', border: '1px solid #ef444430' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ef444430'}
                onMouseLeave={e => e.currentTarget.style.background = '#ef444418'}
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: '#64748b' }}>Are you sure?</span>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ color: '#f1f5f9', background: '#ef4444' }}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ color: '#64748b', background: '#1e2a3a' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onEdit(entry)}
            className="text-sm px-5 py-2 rounded-lg font-medium transition-colors"
            style={{ background: '#38bdf8', color: '#0a0e1a' }}
            onMouseEnter={e => e.currentTarget.style.background = '#7dd3fc'}
            onMouseLeave={e => e.currentTarget.style.background = '#38bdf8'}
          >
            Edit Entry
          </button>
        </div>
      </div>
    </div>
  )
}
