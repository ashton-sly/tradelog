import { useState, useEffect } from 'react'
import StatsBar from './components/StatsBar'
import GalleryGrid from './components/GalleryGrid'
import JournalModal from './components/JournalModal'
import NewEntryForm from './components/NewEntryForm'

const STORAGE_KEY = 'tradelog_entries'

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export default function App() {
  const [view, setView] = useState('gallery') // 'gallery' | 'new' | 'edit'
  const [entries, setEntries] = useState(loadEntries)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)

  // Persist on every change
  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))

  function handleSave(entry) {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e))
      setEditingEntry(null)
    } else {
      setEntries(prev => [...prev, entry])
    }
    setView('gallery')
  }

  function handleDelete(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
    setSelectedEntry(null)
  }

  function handleEdit(entry) {
    setEditingEntry(entry)
    setSelectedEntry(null)
    setView('edit')
  }

  function handleCancel() {
    setEditingEntry(null)
    setView('gallery')
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-4"
        style={{
          background: 'rgba(10, 14, 26, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1e2a3a',
        }}
      >
        <div>
          <h1
            className="text-xl md:text-2xl font-bold tracking-tight"
            style={{ fontFamily: '"JetBrains Mono", monospace', color: '#38bdf8' }}
          >
            TradeLog
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
            by Ashton
          </p>
        </div>

        {view === 'gallery' && (
          <button
            onClick={() => { setEditingEntry(null); setView('new') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150"
            style={{
              background: '#38bdf8',
              color: '#0a0e1a',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#7dd3fc'}
            onMouseLeave={e => e.currentTarget.style.background = '#38bdf8'}
          >
            <span className="text-lg leading-none">+</span>
            New Entry
          </button>
        )}

        {(view === 'new' || view === 'edit') && (
          <span
            className="text-sm font-medium"
            style={{ color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}
          >
            {view === 'edit' ? 'Editing Entry' : 'New Entry'}
          </span>
        )}
      </header>

      {/* Main content */}
      <main className="px-4 md:px-8 py-6">
        {view === 'gallery' && (
          <>
            <StatsBar entries={entries} />
            <GalleryGrid
              entries={sortedEntries}
              onSelect={setSelectedEntry}
            />
          </>
        )}

        {(view === 'new' || view === 'edit') && (
          <NewEntryForm
            initialEntry={editingEntry}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>

      {/* Modal */}
      {selectedEntry && (
        <JournalModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
