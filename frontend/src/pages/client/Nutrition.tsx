import React, { useState } from 'react'
import { Typography, Spin, Alert, Segmented } from 'antd'
import { NutritionDayCard } from '../../components/Common'
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

	// Форматирование даты больше не нужен - теперь в компоненте
	// const formatDate = (dateStr: string) => {
	// 	const date = new Date(dateStr)
	// 	return date.toLocaleDateString('ru-RU', {
	// 		weekday: 'short',
	// 		day: 'numeric',
	// 		month: 'short',
	// 	})
	// }

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card'>
				<div className='section-header flex items-center justify-between gap-4 flex-wrap mb-6'>
					<div className='flex flex-col'>
						<Title level={2} className='section-title m-0 text-left'>
							🍽️ План питания
						</Title>
						{plan.subcategory && (
							<Text className='text-gray-500'>Программа: {plan.subcategory.name}</Text>
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
						Ваш план питания на:{' '}
						<span className='font-bold text-primary'>
							{filterLabels[filter].toLowerCase()}
						</span>
					</Text>
				</div>

				<div className='space-y-6 nutrition-days-container'>
					{days.map((day) => (
						<NutritionDayCard
							key={day.id}
							day={day}
							variant='client'
							date={day.date}
							isToday={day.isToday}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
