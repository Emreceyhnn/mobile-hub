import { useState } from 'react'
import { useNutrition } from '../context/NutritionContext'
import { useAuth } from '../context/AuthContext'
import DailyRing from '../components/dashboard/DailyRing'
import MacroBar from '../components/dashboard/MacroBar'
import MealSection from '../components/food/MealSection'
import Modal from '../components/ui/Modal'
import AddFoodModal from '../components/food/AddFoodModal'
import { getTodayKey, getDateKey } from '../services/firestore'

export default function Dashboard() {
  const { profile } = useAuth()
  const { meals, totals, selectedDate, addFood, removeFood, changeDate } = useNutrition()
  const [modalMeal, setModalMeal] = useState(null) // 'breakfast' | 'lunch' | 'dinner' | 'snack' | null

  const dailyGoal = profile?.dailyGoal || 2000

  // Quick date selector - last 5 days
  const today = new Date()
  const dateOptions = []
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dateOptions.push(d)
  }

  const handleAddFoodClick = (meal) => {
    setModalMeal(meal)
  }

  const handleAddFoodSave = async (foodData) => {
    if (modalMeal) {
      await addFood(modalMeal, foodData)
    }
  }

  return (
    <>
      <div className="page-content slide-up">
        {/* Calendar Strip */}
        <div className="calendar-strip mb-16">
          {dateOptions.map((date) => {
            const key = getDateKey(date)
            const isActive = selectedDate === key
            const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' })
            const dayNum = date.getDate()
            return (
              <div
                key={key}
                className={`cal-day ${isActive ? 'active' : ''}`}
                onClick={() => changeDate(key)}
              >
                <span className="cal-day-name">{dayName}</span>
                <span className="cal-day-num">{dayNum}</span>
                <div className="cal-day-dot" />
              </div>
            )
          })}
        </div>

        {/* Main Overview */}
        <div className="card mb-16" style={{ padding: '24px 16px' }}>
          <DailyRing consumed={totals.calories} goal={dailyGoal} />
        </div>

        {/* Macro details */}
        <div className="card mb-16">
          <h3 className="section-title">Bugünkü Makrolar</h3>
          <MacroBar totals={totals} />
        </div>

        {/* Meals list */}
        <div className="flex flex-col gap-12">
          <h3 className="section-title">Öğünler</h3>
          <MealSection
            type="breakfast"
            items={meals.breakfast || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
          <MealSection
            type="lunch"
            items={meals.lunch || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
          <MealSection
            type="dinner"
            items={meals.dinner || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
          <MealSection
            type="snack"
            items={meals.snack || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
        </div>
      </div>

      {/* Food Entry Bottom Sheet Modal */}
      <Modal
        isOpen={modalMeal !== null}
        onClose={() => setModalMeal(null)}
        title={
          modalMeal === 'breakfast' ? '🌅 Kahvaltıya Ekle' :
          modalMeal === 'lunch' ? '☀️ Öğle Yemeğine Ekle' :
          modalMeal === 'dinner' ? '🌙 Akşam Yemeğine Ekle' : '🍎 Atıştırmalığa Ekle'
        }
      >
        <AddFoodModal
          mealType={modalMeal}
          onClose={() => setModalMeal(null)}
          onAdd={handleAddFoodSave}
        />
      </Modal>
    </>
  )
}
