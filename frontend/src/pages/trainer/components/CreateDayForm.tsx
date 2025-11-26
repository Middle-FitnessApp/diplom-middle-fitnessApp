import { useState } from 'react'
import { Form, Input, Button, Card, Space, Select } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import type { ProgramDay, Meal } from '../../../types/nutritions'
import { mealTypes } from '../../../constants/mealTypes'

interface CreateDayFormProps {
	day?: ProgramDay | null
	programDays?: ProgramDay[]
	onSubmit: (dayData: ProgramDay) => void
	onCancel: () => void
}

export const CreateDayForm = ({
	day,
	programDays = [],
	onSubmit,
	onCancel,
}: CreateDayFormProps) => {
	const [form] = Form.useForm()
	const { subcategory } = useParams()
	const [meals, setMeals] = useState<Meal[]>(
		day?.meals || [
			{
				id: 'meal-1',
				day_id: day?.id || '',
				type: 'breakfast',
				name: 'Завтрак',
				meal_order: 1,
				items: [],
			},
		],
	)

	// Вычисляем порядковый номер дня
	const calculateDayOrder = () => {
		if (day) return day.day_order
		return programDays.length > 0
			? Math.max(...programDays.map((d) => d.day_order)) + 1
			: 1
	}

	const handleAddMeal = () => {
		const newMeal: Meal = {
			id: `meal-${Date.now()}`,
			day_id: day?.id || '',
			type: 'snack',
			name: 'Перекус',
			meal_order: meals.length + 1,
			items: [],
		}
		setMeals([...meals, newMeal])
	}

	const handleRemoveMeal = (mealId: string) => {
		if (meals.length > 1) {
			setMeals(meals.filter((meal) => meal.id !== mealId))
		}
	}

	const handleAddMealItem = (mealId: string) => {
		setMeals(
			meals.map((meal) =>
				meal.id === mealId ? { ...meal, items: [...meal.items, ''] } : meal,
			),
		)
	}

	const handleRemoveMealItem = (mealId: string, itemIndex: number) => {
		setMeals(
			meals.map((meal) =>
				meal.id === mealId
					? {
							...meal,
							items: meal.items.filter((_, index: number) => index !== itemIndex),
					  }
					: meal,
			),
		)
	}

	const handleItemChange = (mealId: string, itemIndex: number, value: string) => {
		setMeals(
			meals.map((meal) =>
				meal.id === mealId
					? {
							...meal,
							items: meal.items.map((item: string, index: number) =>
								index === itemIndex ? value : item,
							),
					  }
					: meal,
			),
		)
	}

	const handleMealTypeChange = (mealId: string, value: string) => {
		const mealType = mealTypes.find((type) => type.value === value)
		setMeals(
			meals.map((meal) =>
				meal.id === mealId
					? {
							...meal,
							type: value as 'breakfast' | 'snack' | 'lunch' | 'dinner',
							name: mealType?.label || value,
					  }
					: meal,
			),
		)
	}

	const handleSubmit = (values: { day_title: string }) => {
		const dayData: ProgramDay = {
			id: day?.id || `day-${Date.now()}`,
			program_id: subcategory || day?.program_id || '',
			day_title: values.day_title,
			day_order: calculateDayOrder(),
			meals: meals.map((meal, index) => ({
				...meal,
				meal_order: index + 1,
				day_id: day?.id || `day-${Date.now()}`,
			})),
		}
		onSubmit(dayData)
	}

	return (
		<Form
			form={form}
			layout='vertical'
			onFinish={handleSubmit}
			initialValues={{ day_title: day?.day_title }}
		>
			<Form.Item
				name='day_title'
				label='Название дня'
				rules={[{ required: true, message: 'Введите название дня' }]}
			>
				<Input placeholder='Например: День 1, Понедельник...' />
			</Form.Item>

			<div className='space-y-4'>
				{meals.map((meal, index) => (
					<Card
						key={meal.id}
						size='small'
						title={
							<div className='flex items-center gap-2'>
								<Select
									value={meal.type}
									onChange={(value) => handleMealTypeChange(meal.id, value)}
									options={mealTypes}
									className='w-32'
								/>
								<span className='text-gray-500'>#{index + 1}</span>
							</div>
						}
						extra={
							meals.length > 1 && (
								<Button
									type='text'
									danger
									icon={<DeleteOutlined />}
									onClick={() => handleRemoveMeal(meal.id)}
								/>
							)
						}
					>
						<div className='space-y-2'>
							{meal.items.map((item: string, itemIndex: number) => (
								<div key={itemIndex} className='flex gap-2 items-start'>
									<Input
										placeholder='Описание блюда/продукта'
										value={item}
										onChange={(e) => handleItemChange(meal.id, itemIndex, e.target.value)}
										className='flex-1'
									/>
									<Button
										type='text'
										danger
										icon={<DeleteOutlined />}
										onClick={() => handleRemoveMealItem(meal.id, itemIndex)}
									/>
								</div>
							))}
							<Button
								type='dashed'
								icon={<PlusOutlined />}
								onClick={() => handleAddMealItem(meal.id)}
								className='w-full'
							>
								Добавить пункт
							</Button>
						</div>
					</Card>
				))}
			</div>

			<Button
				type='dashed'
				icon={<PlusOutlined />}
				onClick={handleAddMeal}
				className='w-full mt-4'
			>
				Добавить прием пищи
			</Button>

			<Form.Item className='mt-6 mb-0'>
				<Space>
					<Button onClick={onCancel}>Отмена</Button>
					<Button type='primary' htmlType='submit'>
						{day ? 'Сохранить изменения' : 'Создать день'}
					</Button>
				</Space>
			</Form.Item>
		</Form>
	)
}
