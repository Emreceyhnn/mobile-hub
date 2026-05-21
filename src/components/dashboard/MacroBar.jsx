const MACROS = [
  { key: 'protein', label: 'Protein',     unit: 'g',   color: '#3B82F6', emoji: '💪' },
  { key: 'carbs',   label: 'Karbonhidrat', unit: 'g',  color: '#F59E0B', emoji: '🌾' },
  { key: 'fat',     label: 'Yağ',         unit: 'g',   color: '#8B5CF6', emoji: '🥑' },
  { key: 'fiber',   label: 'Lif',         unit: 'g',   color: '#10B981', emoji: '🥦' },
]

const GOALS = { protein: 120, carbs: 250, fat: 65, fiber: 30 }

export default function MacroBar({ totals }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {MACROS.map(m => {
        const val = totals[m.key] || 0
        const goal = GOALS[m.key]
        const pct = Math.min(100, Math.round((val / goal) * 100))
        return (
          <div key={m.key}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{m.emoji}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {val}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{m.unit} / {goal}{m.unit}</span>
              </span>
            </div>
            <div className="macro-bar-track">
              <div
                className="macro-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${m.color}cc, ${m.color})`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
