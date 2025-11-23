// DayCard.tsx
import React from 'react'
import { Card, Button, Typography } from 'antd'
import { EditOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import type { ProgramDay } from '../../../types/nutritions'

const { Title } = Typography

interface DayCardProps {
	day: ProgramDay
	openedDayId: string | null
	onDayClick: (dayId: string) => void
	onEditDay: (day: ProgramDay, e: React.MouseEvent) => void
}

export const DayCard = ({ day, openedDayId, onDayClick, onEditDay }: DayCardProps) => {
	const getDayIcon = (dayId: string) => {
		return openedDayId === dayId ? <DownOutlined /> : <RightOutlined />
	}

	return (
		<Card
			className='background-light border-muted cursor-pointer'
			onClick={() => onDayClick(day.id)}
		>
			<div className='flex justify-between items-center'>
				<div className='flex items-center gap-3'>
					<span className='text-lg'>{getDayIcon(day.id)}</span>
					<Title level={4} className='text-custom m-0'>
						{day.day_title}
					</Title>
					<Button
						type='text'
						icon={<EditOutlined />}
						onClick={(e) => onEditDay(day, e)}
						className='text-primary hover:text-info'
					/>
				</div>
			</div>

			{openedDayId === day.id && (
				<div className='mt-4 space-y-4'>
					{day.meals.map((meal) => (
						<div key={meal.id} className='border-l-4 border-primary pl-4'>
							<Title level={5} className='text-custom mb-2'>
								{meal.name}
							</Title>
							{meal.items.length > 0 ? (
								<ul className='list-disc ml-6 text-custom'>
									{meal.items.map((item, index) => (
										<li key={index} className='mb-2'>
											{item}
										</li>
									))}
								</ul>
							) : (
								<p className='text-muted'>Нет данных</p>
							)}
						</div>
					))}
				</div>
			)}
		</Card>
	)
}
