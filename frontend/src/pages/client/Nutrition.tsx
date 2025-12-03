import React, { useMemo, useState } from 'react'
import { Card, Typography, Spin, Alert, Segmented } from 'antd'
import { useGetClientNutritionPlanQuery } from '../../store/api/nutrition.api'
import type { ProgramDay } from '../../store/types/nutrition.types'

const { Title, Text } = Typography

type FilterType = 'день' | 'неделю' | 'месяц'

export const Nutrition: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('день')

	const { data: days, isLoading, isError } = useGetClientNutritionPlanQuery()

	const filteredDays: ProgramDay[] = useMemo(() => {
		if (!days || days.length === 0) return []

		switch (filter) {
			case 'день':
				return [days[0]]
			case 'неделю':
				return days.slice(0, 7)
			case 'месяц':
			default:
				return days
		}
	}, [days, filter])

	if (isLoading) {
		return (
			<div className='page-container gradient-bg flex items-center justify-center min-h-[60vh]'>
				<Spin size='large' />
			</div>
		)
	}

	if (isError) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<Alert
						type='error'
						message='Не удалось загрузить план питания'
						description='Попробуйте обновить страницу позже.'
						showIcon
					/>
				</div>
			</div>
		)
	}

	if (!days || days.length === 0) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<Title level={2} className='section-title'>
						🍽️ План питания
					</Title>
					<Alert
						type='info'
						message='План питания ещё не назначен'
						description='Обратитесь к своему тренеру, чтобы он назначил вам программу питания.'
						showIcon
					/>
				</div>
			</div>
		)
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card'>
				<div className='section-header flex items-center justify-between gap-4 flex-wrap'>
					<Title level={2} className='section-title m-0'>
						🍽️ План питания
					</Title>

					<Segmented<FilterType>
						className='custom-segmented'
						options={[
							{ label: 'День', value: 'день' },
							{ label: 'Неделя', value: 'неделю' },
							{ label: 'Месяц', value: 'месяц' },
						]}
						value={filter}
						onChange={(value) => setFilter(value as FilterType)}
					/>
				</div>

				<div className='text-center mb-8'>
					<Text className='text-xl text-gray-700'>
						Ваш план питания на: <span className='font-bold text-primary'>{filter}</span>
					</Text>
				</div>

				<div className='space-y-6'>
					{filteredDays.map((day) => (
						<Card
							key={day.id}
							className='nutrition-day-card card-hover'
							title={
								<div className='text-lg font-semibold text-gray-800'>{day.day_title}</div>
							}
						>
							<div className='space-y-4'>
								{day.meals.map((meal) => (
									<div key={meal.id} className='border-l-4 border-primary pl-4'>
										<div className='font-semibold text-gray-800 mb-2 text-lg'>
											{meal.name}:
										</div>

										{meal.items && meal.items.length > 0 ? (
											<ul className='list-disc ml-6 text-gray-700 space-y-2'>
												{meal.items.map((item, idx) => (
													<li key={idx} className='text-base'>
														{item}
													</li>
												))}
											</ul>
										) : (
											<div className='text-gray-500 italic text-base'>
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
