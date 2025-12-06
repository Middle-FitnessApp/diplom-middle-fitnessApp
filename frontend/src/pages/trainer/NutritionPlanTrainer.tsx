import React, { useState } from 'react'
import { Typography, Button, Empty, Modal, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import type { NutritionDay } from '../../types/nutritions'
import { mockNutritionDays } from '../../mocks/mockProgramDays'
import { DayCard } from '../../components/Admin/DayCard'
import { CreateDayForm } from '../../components/Admin/CreateDayForm'

const { Title } = Typography

export const NutritionPlanTrainer = () => {
	const { categoryId, subcategoryId } = useParams() // переименовал для ясности
	const [openedDayId, setOpenedDayId] = useState<string | null>(null)
	const [isDayFormVisible, setIsDayFormVisible] = useState(false)
	const [editingDay, setEditingDay] = useState<NutritionDay | null>(null)

	// Фильтруем дни по subcategoryId и сортируем по dayOrder
	const nutritionDays: NutritionDay[] = mockNutritionDays
		.filter((day) => day.subcatId === subcategoryId)
		.sort((a, b) => a.dayOrder - b.dayOrder)

	const handleAddDay = () => {
		setEditingDay(null)
		setIsDayFormVisible(true)
	}

	const handleEditDay = (day: NutritionDay, e: React.MouseEvent) => {
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

	const handleDayFormSubmit = (
		dayData:
			| Omit<NutritionDay, 'id' | 'subcatId' | 'createdAt' | 'updatedAt'>
			| NutritionDay,
	) => {
		console.log('Сохранение дня:', dayData)

		// Если редактируем существующий день, dayData будет NutritionDay
		// Если создаем новый, dayData будет без id и subcatId
		if ('id' in dayData) {
			console.log('Обновление дня с ID:', dayData.id)
			// Здесь будет вызов API для обновления
		} else {
			console.log('Создание нового дня для подкатегории:', subcategoryId)
			// Здесь будет вызов API для создания
		}

		setIsDayFormVisible(false)
		setEditingDay(null)
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						🍽️ Дни питания
					</Title>
					<div className='mt-2 text-gray-600'>
						Подкатегория: {subcategoryId}
						{categoryId && ` • Категория: ${categoryId}`}
					</div>
				</div>

				<div className='flex justify-between items-center mb-8'>
					<div className='text-lg text-gray-700'>
						Количество дней: <span className='font-semibold'>{nutritionDays.length}</span>
					</div>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={handleAddDay}
						className='!rounded-lg !h-10'
					>
						Добавить день
					</Button>
				</div>

				{nutritionDays.length > 0 ? (
					<div className='space-y-4'>
						{nutritionDays.map((day) => (
							<Card key={day.id} className='card-hover'>
								<DayCard
									day={day}
									openedDayId={openedDayId}
									onDayClick={handleDayClick}
									onEditDay={handleEditDay}
								/>
							</Card>
						))}
					</div>
				) : (
					<Card className='text-center py-12'>
						<Empty
							description='В этой подкатегории пока нет дней'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button type='primary' onClick={handleAddDay} className='!rounded-lg !mt-4'>
								Создать первый день
							</Button>
						</Empty>
					</Card>
				)}

				<Modal
					title={editingDay ? 'Редактирование дня' : 'Добавление нового дня'}
					open={isDayFormVisible}
					onCancel={handleDayFormCancel}
					footer={null}
					width={800}
					className='[&_.ant-modal-content]:rounded-xl'
				>
					<CreateDayForm
						day={editingDay}
						onSubmit={handleDayFormSubmit}
						onCancel={handleDayFormCancel}
						existingDays={nutritionDays}
					/>
				</Modal>
			</div>
		</div>
	)
}
