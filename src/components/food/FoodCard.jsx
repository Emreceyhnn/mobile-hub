import { formatTime } from '../../utils/nutrition'

export default function FoodCard({ food, onRemove }) {
  return (
    <div className="food-card">
      <div className="food-card-emoji">🍔</div>
      <div className="food-card-info">
        <h4 className="food-card-name">{food.name}</h4>
        <p className="food-card-meta">
          {food.servingSize} · {formatTime(food.time)}
          {food.protein !== undefined && (
            <span style={{ marginLeft: 8 }}>
              P: {food.protein}g · K: {food.carbs}g · Y: {food.fat}g
            </span>
          )}
        </p>
      </div>
      <div className="food-card-cal">{food.calories} kcal</div>
      {onRemove && (
        <button
          className="food-card-delete"
          onClick={() => onRemove(food.id)}
          aria-label="Sil"
        >
          🗑️
        </button>
      )}
    </div>
  )
}
