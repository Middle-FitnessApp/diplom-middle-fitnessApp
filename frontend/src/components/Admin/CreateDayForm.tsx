import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Select } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { NutritionMeal, NutritionDay, MealType } from '../../types/nutritions'
import { mealTypes } from '../../constants/mealTypes'
import { useThemeClasses } from '../../hooks/useThemeClasses'

interface CreateDayFormProps {
	day?: NutritionDay | null
	existingDays?: NutritionDay[]
	onSubmit: (
		dayData:
			| Omit<NutritionDay, 'id' | 'subcatId' | 'createdAt' | 'updatedAt'>
			| NutritionDay,
	) => void
	onCancel: () => void
}

export const CreateDayForm = ({
	day,
	existingDays = [],
	onSubmit,
	onCancel,
}: CreateDayFormProps) => {
	const [form] = Form.useForm()
	const [meals, setMeals] = useState<NutritionMeal[]>([])
	const classes = useThemeClasses()

	// Инициализация meals при монтировании или изменении day
	useEffect(() => {
		if (day?.meals && day.meals.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setMeals(day.meals)
		} else {
			// Создаем завтрак по умолчанию
			const defaultMeal: NutritionMeal = {
				id: `meal_temp_${Date.now()}`,
				dayId: day?.id || '',
				type: 'BREAKFAST',
				name: 'Завтрак',
				mealOrder: 1,
				items: [''],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			setMeals([defaultMeal])
		}
	}, [day])

	// Вычисляем порядковый номер дня
	const calculateDayOrder = () => {
		if (day) return day.dayOrder

		if (existingDays.length > 0) {
			return Math.max(...existingDays.map((d) => d.dayOrder)) + 1
		}

		return 1
	}

	const handleAddMeal = () => {
		const newMeal: NutritionMeal = {
			id: `meal_temp_${Date.now()}_${meals.length}`,
			dayId: day?.id || '',
			type: 'SNACK',
			name: 'Перекус',
			mealOrder: meals.length + 1,
			items: [''],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
		setMeals([...meals, newMeal])
	}

	const handleRemoveMeal = (mealId: string) => {
		if (meals.length > 1) {
			const updatedMeals = meals
				.filter((meal) => meal.id !== mealId)
				.map((meal, index) => ({
					...meal,
					mealOrder: index + 1,
				}))
			setMeals(updatedMeals)
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
							items: meal.items.filter((_, index) => index !== itemIndex),
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
							items: meal.items.map((item, index) =>
								index === itemIndex ? value : item,
							),
					  }
					: meal,
			),
		)
	}

	const handleMealTypeChange = (mealId: string, value: MealType) => {
		const mealType = mealTypes.find((type) => type.value === value)
		setMeals(
			meals.map((meal) =>
				meal.id === mealId
					? {
							...meal,
							type: value,
							name: mealType?.label || value,
					  }
					: meal,
			),
		)
	}

	const handleSubmit = (values: { dayTitle: string }) => {
		// Подготавливаем данные дня
		const dayData = {
			dayTitle: values.dayTitle,
			dayOrder: calculateDayOrder(),
			meals: meals.map((meal, index) => ({
				...meal,
				mealOrder: index + 1,
				dayId: day?.id || '',
				items: meal.items.filter((item) => item.trim() !== ''), // убираем пустые строки
			})),
		}

		if (day) {
			// Редактирование существующего дня
			const updatedDay: NutritionDay = {
				...day,
				...dayData,
				meals: dayData.meals,
				updatedAt: new Date().toISOString(),
			}
			onSubmit(updatedDay)
		} else {
			// Создание нового дня
			onSubmit(dayData)
		}
	}

	return (
		<Form
			form={form}
			layout='vertical'
			onFinish={handleSubmit}
			initialValues={{ dayTitle: day?.dayTitle || `День ${calculateDayOrder()}` }}
		>
			<Form.Item
				name='dayTitle'
				label='Название дня'
				rules={[{ required: true, message: 'Введите название дня' }]}
			>
				<Input placeholder='Например: День 1, Понедельник...' />
			</Form.Item>

			<div className='space-y-4!'>
				{meals.map((meal) => (
					<Card
						key={meal.id}
						size='small'
						title={
							<div className='flex items-center gap-2 mt-3 mb-3'>
								<Select
									value={meal.type}
									onChange={(value) => handleMealTypeChange(meal.id, value as MealType)}
									options={mealTypes}
									className='w-32'
								/>
								<span className='text-gray-500'>#{String(meal.mealOrder)}</span>
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
							{meal.items.map((item, itemIndex) => (
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

			<Form.Item className={`mt-4! mb-0! pt-4! border-t ${classes.border}`}>
				<div className='flex justify-end gap-3'>
					<Button onClick={onCancel} size='large'>
						Отмена
					</Button>
					<Button type='primary' htmlType='submit' size='large'>
						{day ? 'Сохранить изменения' : 'Создать день'}
					</Button>
				</div>
			</Form.Item>
		</Form>
	)
}
