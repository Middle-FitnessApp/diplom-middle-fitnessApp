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
		<div className='text-black max-w-3xl mx-auto bg-white rounded shadow py-10 px-4 mt-8 mb-16'>
			<div className='flex space-x-4 mb-8'>
				{(['день', 'неделю', 'месяц'] as FilterType[]).map((option) => (
					<button
						key={option}
						className={`text-lg font-semibold border-b-2 pb-1 px-2 ${
							filter === option
								? 'border-blue-600 text-blue-700'
								: 'border-transparent text-gray-700 hover:text-blue-500'
						}`}
						onClick={() => setFilter(option)}>
						{option}
					</button>
				))}
			</div>

			<h2 className='text-center text-2xl font-medium mb-4'>
				Ваш план питания на: <span className='font-bold'>{filter}</span>
			</h2>

			{(filter === 'день'
				? [nutritionPlan[0]]
				: filter === 'неделю'
				? nutritionPlan.slice(0, 7)
				: nutritionPlan
			).map((day) => (
				<div
					key={day.dayTitle}
					className='mb-8'>
					<h3 className='text-xl font-semibold text-center mb-2'>
						{day.dayTitle}
					</h3>
					{day.meals.map((meal, idx) => (
						<div
							key={idx}
							className='mb-4'>
							<div className='font-medium'>{meal.name}:</div>
							<ul className='list-disc ml-6 text-gray-800'>
								{meal.items.map((item, i) => (
									<li key={i}>{item}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			))}
		</div>
	)
}
