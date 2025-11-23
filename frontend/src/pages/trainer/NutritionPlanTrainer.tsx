import React, { useState } from 'react'
import { Layout, Typography, Button, Empty, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import type { ProgramDay } from '../../types/nutritions'
import { mockProgramDays } from '../../mockData(удалим потом)/mockProgramDays'
import { CreateDayForm } from './components/CreateDayForm'
import { DayCard } from './components/DayCard'

const { Title } = Typography

export const NutritionPlanTrainer = () => {
	const { category, subcategory } = useParams()
	const [openedDayId, setOpenedDayId] = useState<string | null>(null)
	const [isDayFormVisible, setIsDayFormVisible] = useState(false)
	const [editingDay, setEditingDay] = useState<ProgramDay | null>(null)

	// тут будет запрос за днями программы
	console.log(category, subcategory)
	const programDays: ProgramDay[] = mockProgramDays
		.filter((day) => day.program_id === subcategory)
		.sort((a, b) => a.day_order - b.day_order)

	const handleAddDay = () => {
		setEditingDay(null)
		setIsDayFormVisible(true)
	}

	const handleEditDay = (day: ProgramDay, e: React.MouseEvent) => {
		e.stopPropagation()
		setEditingDay(day)
		setIsDayFormVisible(true)
	}

	const handleDayClick = (dayId: string) => {
		if (openedDayId === dayId) {
			setOpenedDayId(null)
		} else {
			setOpenedDayId(dayId)
		}
	}

	const handleDayFormCancel = () => {
		setIsDayFormVisible(false)
		setEditingDay(null)
	}

	const handleDayFormSubmit = (dayData: ProgramDay) => {
		// тут будет запрос на сохранение дня
		//изменения данных в сторе
		console.log('Сохранение дня:', dayData)
		setIsDayFormVisible(false)
		setEditingDay(null)
	}

	return (
		<Layout className='min-h-screen'>
			<Layout.Content className='p-6'>
				<div className='max-w-4xl mx-auto'>
					<div className='flex justify-between items-center mb-6'>
						<Title level={3} className='text-custom m-0'>
							Программа питания
						</Title>
						<Button type='primary' icon={<PlusOutlined />} onClick={handleAddDay}>
							Добавить день
						</Button>
					</div>

					{programDays.length > 0 ? (
						<div className='space-y-3'>
							{programDays.map((day) => (
								<DayCard
									key={day.id}
									day={day}
									openedDayId={openedDayId}
									onDayClick={handleDayClick}
									onEditDay={handleEditDay}
								/>
							))}
						</div>
					) : (
						<Empty
							description='В этой программе пока нет дней'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button type='primary' onClick={handleAddDay}>
								Создать первый день
							</Button>
						</Empty>
					)}

					<Modal
						title={editingDay ? 'Редактирование дня' : 'Добавление нового дня'}
						open={isDayFormVisible}
						onCancel={handleDayFormCancel}
						footer={null}
						width={800}
					>
						<CreateDayForm
							day={editingDay}
							onSubmit={handleDayFormSubmit}
							onCancel={handleDayFormCancel}
							programDays={programDays}
						/>
					</Modal>
				</div>
			</Layout.Content>
		</Layout>
	)
}
