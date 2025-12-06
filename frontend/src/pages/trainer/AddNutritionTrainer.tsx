import { useState } from 'react'
import { Typography, Button, Select, Card, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { mockCategories } from '../../mocks/mockNutritionCategories'
import { mockNutritionDays } from '../../mocks/mockProgramDays'
import type { NutritionCategory } from '../../types/nutritions'
import type { NutritionDay } from '../../types/nutritions'

const { Title } = Typography
const { Option } = Select

export const AddNutritionTrainer = () => {
	const { id: clientId } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const [selectedCategory, setSelectedCategory] = useState<string>('')
	const [selectedProgram, setSelectedProgram] = useState<string>('')
	const [selectedDay, setSelectedDay] = useState<string>('')

	// Фильтруем программы по выбранной категории
	const programs: NutritionCategory['subcategories'] =
		mockCategories.find((cat: NutritionCategory) => cat.id === selectedCategory)
			?.subcategories || []

	// Фильтруем дни по выбранной программе
	const days: NutritionDay[] = mockNutritionDays
		.filter((day: NutritionDay) => day.subcatId === selectedProgram)
		.sort((a: NutritionDay, b: NutritionDay) => a.dayOrder - b.dayOrder)

	// Получаем данные выбранного дня для предпросмотра
	const selectedDayData: NutritionDay | undefined = days.find(
		(day: NutritionDay) => day.id === selectedDay,
	)

	const handlePublish = (): void => {
		if (!selectedDay) {
			message.error('Выберите день для назначения')
			return
		}

		// тут будет запрос на назначение плана клиенту
		console.log('Назначение плана:', {
			client_id: clientId,
			program_id: selectedProgram,
			day_id: selectedDay,
		})

		message.success('План питания успешно назначен клиенту')
		navigate(`/admin/client/${clientId}`)
	}

	const handleCancel = (): void => {
		navigate(-1)
	}

	const handleCategoryChange = (value: string): void => {
		setSelectedCategory(value)
		setSelectedProgram('')
		setSelectedDay('')
	}

	const handleProgramChange = (value: string): void => {
		setSelectedProgram(value)
		setSelectedDay('')
	}

	const handleDayChange = (value: string): void => {
		setSelectedDay(value)
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card max-w-4xl'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						🍽️ Назначение плана питания
					</Title>
				</div>

				<div className='space-y-6'>
					<Card title='Выбор плана питания' className='card-hover'>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div>
								<label className='block text-sm font-medium mb-2'>Категория</label>
								<Select
									placeholder='Выберите категорию'
									value={selectedCategory}
									onChange={handleCategoryChange}
									className='w-full'
								>
									{mockCategories.map((category: NutritionCategory) => (
										<Option key={category.id} value={category.id}>
											{category.name}
										</Option>
									))}
								</Select>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>Программа</label>
								<Select
									placeholder='Выберите программу'
									value={selectedProgram}
									onChange={handleProgramChange}
									disabled={!selectedCategory}
									className='w-full'
								>
									{programs.map((program) => (
										<Option key={program.id} value={program.id}>
											{program.name}
										</Option>
									))}
								</Select>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>День</label>
								<Select
									placeholder='Выберите день'
									value={selectedDay}
									onChange={handleDayChange}
									disabled={!selectedProgram}
									className='w-full'
								>
									{days.map((day: NutritionDay) => (
										<Option key={day.id} value={day.id}>
											{day.dayTitle}
										</Option>
									))}
								</Select>
							</div>
						</div>
					</Card>

					{selectedDayData && (
						<Card title='Предпросмотр плана' className='card-hover'>
							<div className='space-y-4'>
								<Title level={4} className='text-center'>
									{selectedDayData.dayTitle}
								</Title>

								{selectedDayData.meals.map((meal) => (
									<div key={meal.id} className='border-l-4 border-primary pl-4'>
										<Title level={5} className='mb-2'>
											{meal.name}
										</Title>
										{meal.items.length > 0 ? (
											<ul className='list-disc ml-6'>
												{meal.items.map((item: string, index: number) => (
													<li key={index} className='mb-1'>
														{item}
													</li>
												))}
											</ul>
										) : (
											<p className='text-gray-500'>Нет данных</p>
										)}
									</div>
								))}
							</div>
						</Card>
					)}

					<div className='flex gap-3 justify-end'>
						<Button size='large' onClick={handleCancel}>
							Отмена
						</Button>
						<Button
							type='primary'
							size='large'
							onClick={handlePublish}
							disabled={!selectedDay}
						>
							Назначить план
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
