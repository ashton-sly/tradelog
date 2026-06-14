import { useState, useRef, useCallback } from 'react'

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']

function gradeColor(grade) {
  if (!grade) return '#64748b'
  if (grade.startsWith('A')) return '#22c55e'
  if (grade.startsWith('B')) return '#eab308'
  if (grade.startsWith('C')) return '#f97316'
  return '#ef4444'
}

function today() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function fmtBytes(b) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function NewEntryForm({ initialEntry, onSave, onCancel }) {
  const [date, setDate] = useState(initialEntry?.date || today())
  const [pnl, setPnl] = useState(initialEntry?.pnl !== undefined ? String(initialEntry.pnl) : '')
  const [grade, setGrade] = useState(initialEntry?.grade || '')
  const [journalText, setJournalText] = useState(initialEntry?.journalText || '')
  const [screenshots, setScreenshots] = useState(
    initialEntry?.screenshots
      ? initialEntry.screenshots.map((src, i) => ({ src, name: `Screenshot ${i + 1}`, size: null }))
      : []
  )
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef()

  const addFiles = useCallback(async (files) => {
    const remaining = 2 - screenshots.length
    if (remaining <= 0) return
    const toProcess = Array.from(files).slice(0, remaining).filter(f => f.type.startsWith('image/'))
    for (const file of toProcess) {
      const src = await fileToBase64(file)
      setScreenshots(prev => [...prev, { src, name: file.name, size: file.size }])
    }
  }, [screenshots.length])

  function removeScreenshot(idx) {
    setScreenshots(prev => prev.filter((_, i) => i !== idx))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function handleFileInput(e) {
    addFiles(e.target.files)
    e.target.value = ''
  }

  function validate() {
    const errs = {}
    if (!date) errs.date = 'Date is required'
    if (pnl === '' || isNaN(Number(pnl))) errs.pnl = 'Enter a valid number (e.g. 820 or -340)'
    if (!grade) errs.grade = 'Select a grade'
    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const entry = {
      id: initialEntry?.id || crypto.randomUUID(),
      date,
      pnl: Number(pnl),
      grade,
      journalText,
      screenshots: screenshots.map(s => s.src),
    }
    onSave(entry)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="rounded-2xl p-6 md:p-8 flex flex-col gap-6"
        style={{ background: '#111827', border: '1px solid #1e2a3a' }}
      >

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest" style={{ color: '#64748b', fontFamily: 'Inter' }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: '#0a0e1a',
              border: `1px solid ${errors.date ? '#ef4444' : '#1e2a3a'}`,
              color: '#f1f5f9',
              fontFamily: '"JetBrains Mono", monospace',
              colorScheme: 'dark',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#38bdf8'}
            onBlur={e => e.currentTarget.style.borderColor = errors.date ? '#ef4444' : '#1e2a3a'}
          />
          {errors.date && <span className="text-xs" style={{ color: '#ef4444' }}>{errors.date}</span>}
        </div>

        {/* PNL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest" style={{ color: '#64748b', fontFamily: 'Inter' }}>
            Daily PNL ($)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="820 or -340"
            value={pnl}
            onChange={e => setPnl(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: '#0a0e1a',
              border: `1px solid ${errors.pnl ? '#ef4444' : '#1e2a3a'}`,
              color: Number(pnl) >= 0 && pnl !== '' ? '#22c55e' : pnl !== '' ? '#ef4444' : '#f1f5f9',
              fontFamily: '"JetBrains Mono", monospace',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#38bdf8'}
            onBlur={e => e.currentTarget.style.borderColor = errors.pnl ? '#ef4444' : '#1e2a3a'}
          />
          {errors.pnl && <span className="text-xs" style={{ color: '#ef4444' }}>{errors.pnl}</span>}
        </div>

        {/* Grade */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest" style={{ color: '#64748b', fontFamily: 'Inter' }}>
            Daily Grade
          </label>
          <div className="flex flex-wrap gap-2">
            {GRADES.map(g => {
              const selected = grade === g
              const gc = gradeColor(g)
              return (
                <button
                  key={g}
                  onClick={() => { setGrade(g); setErrors(p => ({ ...p, grade: undefined })) }}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    background: selected ? `${gc}22` : '#0a0e1a',
                    color: selected ? gc : '#64748b',
                    border: `1px solid ${selected ? gc : '#1e2a3a'}`,
                    transform: selected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {g}
                </button>
              )
            })}
          </div>
          {errors.grade && <span className="text-xs" style={{ color: '#ef4444' }}>{errors.grade}</span>}
        </div>

        {/* Screenshots */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-widest" style={{ color: '#64748b', fontFamily: 'Inter' }}>
              Screenshots
            </label>
            <span className="text-xs" style={{ color: '#64748b' }}>{screenshots.length}/2</span>
          </div>

          {screenshots.length < 2 && (
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-150"
              style={{
                height: 120,
                border: `2px dashed ${dragOver ? '#38bdf8' : '#1e2a3a'}`,
                background: dragOver ? 'rgba(56,189,248,0.05)' : '#0a0e1a',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragOver ? '#38bdf8' : '#64748b'} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div className="text-center">
                <p className="text-sm" style={{ color: dragOver ? '#38bdf8' : '#64748b', fontFamily: 'Inter' }}>
                  Drop image here or <span style={{ color: '#38bdf8' }}>browse</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>JPG or PNG · max 2 images</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {screenshots.length > 0 && (
            <div className="flex flex-col gap-3 mt-1">
              {screenshots.map((shot, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg overflow-hidden"
                  style={{ background: '#0a0e1a', border: '1px solid #1e2a3a' }}
                >
                  <img
                    src={shot.src}
                    alt={shot.name}
                    style={{ width: 72, height: 52, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div className="flex-1 min-w-0 py-2">
                    <p className="text-xs truncate" style={{ color: '#f1f5f9', fontFamily: '"JetBrains Mono", monospace' }}>
                      {shot.name}
                    </p>
                    {shot.size && (
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{fmtBytes(shot.size)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeScreenshot(i)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-2 rounded-lg transition-colors"
                    style={{ color: '#64748b' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Journal */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest" style={{ color: '#64748b', fontFamily: 'Inter' }}>
            Journal Entry
          </label>
          <textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            placeholder="Paste your journal entry here..."
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all resize-y"
            rows={14}
            style={{
              background: '#0a0e1a',
              border: '1px solid #1e2a3a',
              color: '#f1f5f9',
              fontFamily: '"JetBrains Mono", monospace',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.7',
              minHeight: 400,
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#38bdf8'}
            onBlur={e => e.currentTarget.style.borderColor = '#1e2a3a'}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-150"
            style={{ background: '#38bdf8', color: '#0a0e1a', fontFamily: 'Inter' }}
            onMouseEnter={e => e.currentTarget.style.background = '#7dd3fc'}
            onMouseLeave={e => e.currentTarget.style.background = '#38bdf8'}
          >
            Save Entry
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl text-sm transition-colors"
            style={{ background: 'transparent', color: '#64748b', border: '1px solid #1e2a3a', fontFamily: 'Inter' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e2a3a'; e.currentTarget.style.color = '#f1f5f9' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}
