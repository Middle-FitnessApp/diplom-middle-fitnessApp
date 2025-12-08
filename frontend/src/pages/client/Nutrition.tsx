import React, { useState } from 'react'
import { Card, Typography, Spin, Alert, Segmented, Tag } from 'antd'
import { useGetClientNutritionPlanQuery } from '../../store/api/nutrition.api'

const { Title, Text } = Typography

type FilterType = 'day' | 'week' | 'month'

const filterLabels: Record<FilterType, string> = {
	day: 'День',
	week: 'Неделя',
	month: 'Месяц',
}

export const Nutrition: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('day')

	const { data, isLoading, isError } = useGetClientNutritionPlanQuery({ period: filter })

	const days = data?.days || []
	const plan = data?.plan

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

	if (!plan || days.length === 0) {
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

	// Форматирование даты
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('ru-RU', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
		})
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card'>
				<div className='section-header flex items-center justify-between gap-4 flex-wrap mb-6'>
					<div>
						<Title level={2} className='section-title m-0'>
							🍽️ План питания
						</Title>
						{plan.subcategory && (
							<Text className='text-gray-500'>
								Программа: {plan.subcategory.name}
							</Text>
						)}
					</div>

					<Segmented<FilterType>
						className='custom-segmented'
						options={[
							{ label: 'День', value: 'day' },
							{ label: 'Неделя', value: 'week' },
							{ label: 'Месяц', value: 'month' },
						]}
						value={filter}
						onChange={(value) => setFilter(value)}
					/>
				</div>

				<div className='text-center mb-8'>
					<Text className='text-xl text-gray-700'>
						Ваш план питания на: <span className='font-bold text-primary'>{filterLabels[filter].toLowerCase()}</span>
					</Text>
				</div>

				<div className='space-y-6'>
					{days.map((day) => (
						<Card
							key={day.id}
							className='nutrition-day-card card-hover'
							title={
								<div className='flex items-center justify-between'>
									<span className='text-lg font-semibold text-gray-800'>
										{day.dayTitle}
									</span>
									<div className='flex items-center gap-2'>
										<Text className='text-sm text-gray-500'>
											{formatDate(day.date)}
										</Text>
										{day.isToday && (
											<Tag color='green'>Сегодня</Tag>
										)}
									</div>
								</div>
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
