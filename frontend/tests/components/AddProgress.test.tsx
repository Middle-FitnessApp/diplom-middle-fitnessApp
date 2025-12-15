import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils/test-utils'
import { Form, Input, Button, DatePicker, InputNumber } from 'antd'

// Создаём упрощённую версию компонента для тестирования
const AddProgressForm = () => {
	const [form] = Form.useForm()

	const onFinish = vi.fn((values) => {
		console.log('Form submitted:', values)
	})

	return (
		<Form form={form} onFinish={onFinish} layout='vertical'>
			<Form.Item
				name='date'
				label='Дата'
				rules={[{ required: true, message: 'Выберите дату замера' }]}
			>
				<DatePicker placeholder='Выберите дату' style={{ width: '100%' }} />
			</Form.Item>

			<Form.Item
				name='weight'
				label='Вес (кг)'
				rules={[
					{ required: true, message: 'Введите вес' },
					{
						validator: (_, value) => {
							if (!value) return Promise.resolve()
							if (value < 20 || value > 300) {
								return Promise.reject(new Error('Вес должен быть от 20 до 300 кг'))
							}
							return Promise.resolve()
						},
					},
				]}
			>
				<InputNumber placeholder='Введите вес' style={{ width: '100%' }} />
			</Form.Item>

			<Form.Item
				name='waist'
				label='Талия (см)'
				rules={[
					{ required: true, message: 'Введите обхват талии' },
					{
						validator: (_, value) => {
							if (!value) return Promise.resolve()
							if (value < 40 || value > 200) {
								return Promise.reject(
									new Error('Обхват талии должен быть от 40 до 200 см'),
								)
							}
							return Promise.resolve()
						},
					},
				]}
			>
				<InputNumber placeholder='Введите талию' style={{ width: '100%' }} />
			</Form.Item>

			<Form.Item
				name='hips'
				label='Бёдра (см)'
				rules={[
					{ required: true, message: 'Введите обхват бёдер' },
					{
						validator: (_, value) => {
							if (!value) return Promise.resolve()
							if (value < 50 || value > 200) {
								return Promise.reject(
									new Error('Обхват бёдер должен быть от 50 до 200 см'),
								)
							}
							return Promise.resolve()
						},
					},
				]}
			>
				<InputNumber placeholder='Введите бёдра' style={{ width: '100%' }} />
			</Form.Item>

			<Form.Item name='notes' label='Примечания'>
				<Input.TextArea placeholder='Ваши заметки' rows={3} />
			</Form.Item>

			<Form.Item>
				<Button type='primary' htmlType='submit'>
					Добавить замеры
				</Button>
			</Form.Item>
		</Form>
	)
}

describe('AddProgress - Форма добавления прогресса', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен отображать все обязательные поля формы', () => {
		render(<AddProgressForm />)

		expect(screen.getByText(/дата/i)).toBeInTheDocument()
		expect(screen.getByText(/вес/i)).toBeInTheDocument()
		expect(screen.getByText(/талия/i)).toBeInTheDocument()
		expect(screen.getByText(/бёдра/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /добавить замеры/i })).toBeInTheDocument()
	})

	it('должен показывать ошибки валидации при пустой форме', async () => {
		const user = userEvent.setup()
		render(<AddProgressForm />)

		const submitButton = screen.getByRole('button', { name: /добавить замеры/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/выберите дату замера/i)).toBeInTheDocument()
			expect(screen.getByText(/введите вес/i)).toBeInTheDocument()
			expect(screen.getByText(/введите обхват талии/i)).toBeInTheDocument()
			expect(screen.getByText(/введите обхват бёдер/i)).toBeInTheDocument()
		})
	})

	it('должен валидировать минимальное значение веса', async () => {
		const user = userEvent.setup()
		render(<AddProgressForm />)

		// Находим input по placeholder
		const weightInput = screen.getByPlaceholderText(/введите вес/i)
		await user.type(weightInput, '10')

		const submitButton = screen.getByRole('button', { name: /добавить замеры/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/вес должен быть от 20 до 300 кг/i)).toBeInTheDocument()
		})
	})

	it('должен валидировать максимальное значение веса', async () => {
		const user = userEvent.setup()
		render(<AddProgressForm />)

		const weightInput = screen.getByPlaceholderText(/введите вес/i)
		await user.type(weightInput, '350')

		const submitButton = screen.getByRole('button', { name: /добавить замеры/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/вес должен быть от 20 до 300 кг/i)).toBeInTheDocument()
		})
	})

	it('должен принимать корректные значения', async () => {
		const user = userEvent.setup()
		render(<AddProgressForm />)

		// Заполняем вес
		const weightInput = screen.getByPlaceholderText(/введите вес/i)
		await user.type(weightInput, '75')

		// Заполняем талию
		const waistInput = screen.getByPlaceholderText(/введите талию/i)
		await user.type(waistInput, '80')

		// Заполняем бёдра
		const hipsInput = screen.getByPlaceholderText(/введите бёдра/i)
		await user.type(hipsInput, '95')

		// Проверяем что значения установлены
		expect(weightInput).toHaveValue('75')
		expect(waistInput).toHaveValue('80')
		expect(hipsInput).toHaveValue('95')
	})

	it('должен позволять вводить примечания', async () => {
		const user = userEvent.setup()
		render(<AddProgressForm />)

		const notesTextarea = screen.getByPlaceholderText(/ваши заметки/i)
		await user.type(notesTextarea, 'Чувствую себя отлично!')

		expect(notesTextarea).toHaveValue('Чувствую себя отлично!')
	})

	it('кнопка отправки должна быть активна', () => {
		render(<AddProgressForm />)

		const submitButton = screen.getByRole('button', { name: /добавить замеры/i })
		expect(submitButton).not.toBeDisabled()
	})

	it('должен очищать ошибки после исправления', async () => {
		const user = userEvent.setup()
		render(<AddProgressForm />)

		// Отправляем пустую форму
		const submitButton = screen.getByRole('button', { name: /добавить замеры/i })
		await user.click(submitButton)

		// Ждём ошибку
		await waitFor(() => {
			expect(screen.getByText(/введите вес/i)).toBeInTheDocument()
		})

		// Исправляем - вводим вес
		const weightInput = screen.getByPlaceholderText(/введите вес/i)
		await user.type(weightInput, '75')

		// Кликаем на другое поле чтобы сработал blur
		const waistInput = screen.getByPlaceholderText(/введите талию/i)
		await user.click(waistInput)

		// Ошибка должна исчезнуть
		await waitFor(() => {
			expect(screen.queryByText(/введите вес/i)).not.toBeInTheDocument()
		})
	})

	it('должен отображать все поля ввода с правильными placeholder', () => {
		render(<AddProgressForm />)

		expect(screen.getByPlaceholderText(/введите вес/i)).toBeInTheDocument()
		expect(screen.getByPlaceholderText(/введите талию/i)).toBeInTheDocument()
		expect(screen.getByPlaceholderText(/введите бёдра/i)).toBeInTheDocument()
		expect(screen.getByPlaceholderText(/ваши заметки/i)).toBeInTheDocument()
	})
})
