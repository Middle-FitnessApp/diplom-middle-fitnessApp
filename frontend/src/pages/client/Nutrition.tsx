import { Card } from 'antd'
import Title from 'antd/es/skeleton/Title'
import React, { useState } from 'react'

interface Meal {
	type: 'breakfast' | 'snack' | 'lunch' | 'dinner'
	name: string
	items: string[]
}

interface DayPlan {
	dayTitle: string
	meals: Meal[]
}

const nutritionPlan: DayPlan[] = [
	{
		dayTitle: 'День 1',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [
					'яичница из двух яиц',
					'огурец свежий и болгарский перец',
					'бутерброд из бородинского хлеба с сыром тильзитер',
					'банан яблоко',
					'чай чёрный',
				],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [
					'яичница из двух яиц',
					'огурец свежий и болгарский перец',
					'бутерброд из бородинского хлеба с сыром тильзитер',
					'банан яблоко',
					'чай чёрный',
				],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [
					'яичница из двух яиц',
					'огурец свежий и болгарский перец',
					'бутерброд из бородинского хлеба с сыром тильзитер',
					'банан яблоко',
					'чай чёрный',
				],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [
					'яичница из двух яиц',
					'огурец свежий и болгарский перец',
					'бутерброд из бородинского хлеба с сыром тильзитер',
					'банан яблоко',
					'чай чёрный',
				],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [
					'яичница из двух яиц',
					'огурец свежий и болгарский перец',
					'бутерброд из бородинского хлеба с сыром тильзитер',
					'банан яблоко',
					'чай чёрный',
				],
			},
		],
	},
	{
		dayTitle: 'День 2',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
		],
	},
	{
		dayTitle: 'День 3',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
		],
	},
	{
		dayTitle: 'День 4',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
		],
	},
	{
		dayTitle: 'День 5',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
		],
	},
	{
		dayTitle: 'День 6',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
		],
	},
	{
		dayTitle: 'День 7',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
		],
	},
	{
		dayTitle: 'День 8',
		meals: [
			{
				type: 'breakfast',
				name: 'Завтрак',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
			{
				type: 'lunch',
				name: 'Обед',
				items: [],
			},
			{
				type: 'dinner',
				name: 'Ужин',
				items: [],
			},
			{
				type: 'snack',
				name: 'Перекус',
				items: [],
			},
		],
	},
]

type FilterType = 'день' | 'неделю' | 'месяц'

export const Nutrition: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('день')

	return (
		<div className="page-container gradient-bg">
      <div className="page-card">
        <div className="section-header">
          <Title level={2} className="section-title">
            🍽️ План питания
          </Title>
        </div>

        <div className="filter-tabs">
          {(['день', 'неделю', 'месяц'] as FilterType[]).map((option) => (
            <div
              key={option}
              className={`filter-tab ${filter === option ? 'active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-700">
            Ваш план питания на: <span className="font-bold text-primary">{filter}</span>
          </h2>
        </div>

        <div className="space-y-6">
          {(filter === 'день'
            ? [nutritionPlan[0]]
            : filter === 'неделю'
            ? nutritionPlan.slice(0, 7)
            : nutritionPlan
          ).map((day) => (
            <Card
              key={day.dayTitle}
              className="nutrition-day-card card-hover"
              title={
                <div className="text-lg font-semibold text-gray-800">
                  {day.dayTitle}
                </div>
              }
            >
              <div className="space-y-4">
                {day.meals.map((meal, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-4">
                    <div className="font-semibold text-gray-800 mb-2 text-lg">
                      {meal.name}:
                    </div>
                    {meal.items.length > 0 ? (
                      <ul className="list-disc ml-6 text-gray-700 space-y-2">
                        {meal.items.map((item, i) => (
                          <li key={i} className="text-base">{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500 italic text-base">
                        Информация отсутствует
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
	)
}
