import GalleryCard from './GalleryCard'

export default function GalleryGrid({ entries, onSelect }) {
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: '#111827', border: '1px solid #1e2a3a' }}
        >
          <span style={{ fontSize: 28, color: '#38bdf8' }}>+</span>
        </div>
        <p className="text-base" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
          No entries yet. Add your first trade day.
        </p>
      </div>
    )
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      }}
    >
      {entries.map(entry => (
        <GalleryCard key={entry.id} entry={entry} onClick={() => onSelect(entry)} />
      ))}
    </div>
  )
}
