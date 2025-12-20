import React, { useState } from 'react'
import { Typography, Spin, Alert, Segmented } from 'antd'
import { NutritionDayCard } from '../../components/Common'
import { useGetClientNutritionPlanQuery } from '../../store/api/nutrition.api'
import { useAppSelector } from '../../store/hooks'

const { Title, Text } = Typography

type FilterType = 'day' | 'week' | 'month'

const filterLabels: Record<FilterType, string> = {
	day: 'День',
	week: 'Неделя',
	month: 'Месяц',
}

export const Nutrition: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('day')

	const user = useAppSelector((state) => state.auth.user)

	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	const { data, isLoading, isError } = useGetClientNutritionPlanQuery(
		{
			period: filter,
		},
		{
			skip: !user || !user.trainer, // Не делаем запрос, если нет тренера
		},
	)

	const days = data?.days || []
	const plan = data?.plan

	// Если у клиента нет тренера, показываем соответствующее сообщение
	if (!user?.trainer) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
					<Title
						level={2}
						className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'
					>
						🍽️ План питания
					</Title>
					<Alert
						type='info'
						message='У вас пока нет тренера'
						description='Для получения плана питания необходимо выбрать тренера на главной странице.'
						showIcon
					/>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex items-center justify-center'>
				<Spin size='large' />
			</div>
		)
	}

	if (isError) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
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
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
					<Title
						level={2}
						className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'
					>
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
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
				<div className='flex items-center justify-between gap-4 flex-wrap mb-6'>
					<div className='flex flex-col'>
						<Title
							level={2}
							className='text-gray-800 font-semibold m-0 text-left pb-3 border-b-3 border-primary inline-block'
						>
							🍽️ План питания
						</Title>
						{plan.subcategory && (
							<Text className='text-gray-500'>Программа: {plan.subcategory.name}</Text>
						)}
					</div>

					<Segmented<FilterType>
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

				<div className='space-y-6'>
					{days.map((day) => (
						<NutritionDayCard
							key={day.id}
							day={day}
							variant='client'
							date={day.date}
							isToday={day.isToday}
							isDark={isDark}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
