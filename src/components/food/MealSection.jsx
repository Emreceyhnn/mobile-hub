import FoodCard from './FoodCard'
import { MEAL_LABELS } from '../../utils/nutrition'

export default function MealSection({ type, items, onAddFood, onRemoveFood }) {
  const meta = MEAL_LABELS[type]
  const totalCal = items.reduce((sum, item) => sum + (item.calories || 0), 0)

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-8">
          <span style={{ fontSize: 20 }}>{meta.emoji}</span>
          <div>
            <h3 className="text-base fw-700" style={{ color: 'var(--text-primary)' }}>
              {meta.label}
            </h3>
            <span className="text-xs text-muted">
              {items.length} besin eklenmiş
            </span>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <span className="text-base fw-800" style={{ color: meta.color }}>
            {totalCal} kcal
          </span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onAddFood(type)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
            aria-label={`${meta.label} Ekle`}
          >
            ＋
          </button>
        </div>
      </div>

      <div className="divider" style={{ margin: '8px 0' }} />

      {items.length === 0 ? (
        <p className="text-sm text-muted text-center" style={{ padding: '12px 0' }}>
          Henüz besin eklenmedi.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map(item => (
            <FoodCard
              key={item.id}
              food={item}
              onRemove={onRemoveFood ? (id) => onRemoveFood(type, id) : null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
