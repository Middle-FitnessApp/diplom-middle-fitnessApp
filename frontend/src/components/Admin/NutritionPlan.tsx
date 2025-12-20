import { Card, Typography, Empty, Spin } from 'antd'
import { NutritionDayCard } from '../../components/Common'
import { useGetClientNutritionPlanQuery } from '../../store/api/nutrition.api'

const { Title, Text } = Typography

interface NutritionPlanProps {
	clientId: string
	isDark?: boolean
}

export const NutritionPlan = ({ clientId, isDark = false }: NutritionPlanProps) => {
	const { data, isLoading, isError } = useGetClientNutritionPlanQuery({
		clientId,
		period: 'day',
	})

	const plan = data?.plan
	const days = data?.days || []

	if (isLoading) {
		return (
			<Card className='card-hover h-full'>
				<div className='flex items-center justify-center py-12'>
					<Spin size='large' />
				</div>
			</Card>
		)
	}

	if (isError) {
		return (
			<Card className='card-hover h-full flex flex-col'>
				<Title level={5} className='!text-base !mb-4'>
					План питания
				</Title>
				<div className='flex-1 flex items-center justify-center'>
					<Empty
						description='Ошибка загрузки плана'
						style={{ margin: 'auto' }}
						className='!my-0'
					/>
				</div>
			</Card>
		)
	}

	return (
		<Card className='card-hover h-full flex flex-col overflow-hidden'>
			<div className='mb-8'>
				<Title level={4} className='m-0 mb-4'>
					План питания
				</Title>
			</div>

			{!plan || days.length === 0 ? (
				<div className='flex-1 flex items-center justify-center'>
					<Empty
						description='План питания не назначен'
						style={{ margin: 'auto' }}
						className='!my-0'
					/>
				</div>
			) : (
				<div className='flex flex-col gap-4 flex-1 overflow-y-auto'>
					<div className='mb-2'>
						<Text strong className='text-sm block mb-1'>
							{plan.subcategory.name}
						</Text>
						{plan.subcategory.description && (
							<Text type='secondary' className='text-xs block'>
								{plan.subcategory.description}
							</Text>
						)}
					</div>

					<div className='space-y-3'>
						{days.map((day) => (
							<NutritionDayCard
								key={day.id}
								day={day}
								variant='trainer'
								date={day.date}
								isToday={day.isToday}
								isDark={isDark}
							/>
						))}
					</div>
				</div>
			)}
		</Card>
	)
}
