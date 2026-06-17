const WIN_GRADES = new Set(['A+', 'A', 'B+', 'B'])
const LOSS_GRADES = new Set(['C+', 'C', 'D', 'F'])

function fmt(val, prefix = true) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const abs = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (!prefix) return `$${abs}`
  return val >= 0 ? `+$${abs}` : `-$${abs}`
}

function pnlColor(val) {
  if (val > 0) return '#22c55e'
  if (val < 0) return '#ef4444'
  return '#f1f5f9'
}

export default function StatsBar({ entries }) {
  if (!entries.length) return null

  const totalPnl = entries.reduce((s, e) => s + (e.pnl || 0), 0)

  // Day W/R — grade-based, denominator is wins + losses only
  const wins = entries.filter(e => WIN_GRADES.has(e.grade))
  const losses = entries.filter(e => LOSS_GRADES.has(e.grade))
  const dayWrDenom = wins.length + losses.length
  const dayWinRate = dayWrDenom > 0 ? ((wins.length / dayWrDenom) * 100).toFixed(1) : null

  // Trade W/R — individual trade PNLs, breakeven excluded
  const allTrades = entries.flatMap(e => e.trades || [])
  const tradeWins = allTrades.filter(t => Number(t.pnl) > 0).length
  const tradeLosses = allTrades.filter(t => Number(t.pnl) < 0).length
  const tradeWrDenom = tradeWins + tradeLosses
  const tradeWinRate = tradeWrDenom > 0 ? ((tradeWins / tradeWrDenom) * 100).toFixed(1) : null

  // Best / worst by PNL value
  const bestDay = entries.length ? Math.max(...entries.map(e => e.pnl || 0)) : null
  const worstDay = entries.length ? Math.min(...entries.map(e => e.pnl || 0)) : null

  const positiveDays = entries.filter(e => e.pnl > 0)
  const negativeDays = entries.filter(e => e.pnl < 0)
  const avgWin = positiveDays.length ? positiveDays.reduce((s, e) => s + e.pnl, 0) / positiveDays.length : null
  const avgLoss = negativeDays.length ? negativeDays.reduce((s, e) => s + e.pnl, 0) / negativeDays.length : null

  const stats = [
    { label: 'Total PNL',  value: fmt(totalPnl),                                      color: pnlColor(totalPnl) },
    { label: 'Day W/R',    value: dayWinRate   !== null ? `${dayWinRate}%`   : '—',   color: '#f1f5f9' },
    { label: 'Trade W/R',  value: tradeWinRate !== null ? `${tradeWinRate}%` : '—',   color: '#f1f5f9' },
    { label: 'Avg Win',    value: avgWin   !== null ? fmt(avgWin)   : '—',             color: '#22c55e' },
    { label: 'Avg Loss',   value: avgLoss  !== null ? fmt(avgLoss)  : '—',             color: '#ef4444' },
    { label: 'Best Day',   value: bestDay  !== null ? fmt(bestDay)  : '—',             color: '#22c55e' },
    { label: 'Worst Day',  value: worstDay !== null ? fmt(worstDay) : '—',             color: '#ef4444' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="rounded-lg px-4 py-3 flex flex-col gap-1"
          style={{ background: '#111827', border: '1px solid #1e2a3a' }}
        >
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}
          >
            {stat.label}
          </span>
          <span
            className="text-lg font-bold leading-tight"
            style={{ color: stat.color, fontFamily: '"JetBrains Mono", monospace' }}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}
