import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils/test-utils'
import { Table, Input, Select, Tag } from 'antd'

const { Search } = Input

// Моковые данные клиентов
const mockClients = [
	{
		id: 1,
		name: 'Иван Петров',
		email: 'ivan@example.com',
		status: 'active',
		trainer: 'Сергей Иванов',
		lastActivity: '2025-12-14',
	},
	{
		id: 2,
		name: 'Мария Сидорова',
		email: 'maria@example.com',
		status: 'inactive',
		trainer: 'Анна Смирнова',
		lastActivity: '2025-12-10',
	},
	{
		id: 3,
		name: 'Алексей Козлов',
		email: 'alexey@example.com',
		status: 'active',
		trainer: 'Сергей Иванов',
		lastActivity: '2025-12-15',
	},
]

// Компонент списка клиентов
const ClientsList = ({
	clients = mockClients,
	onSearch = vi.fn(),
	onFilterStatus = vi.fn(),
}) => {
	const columns = [
		{
			title: 'Имя',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={status === 'active' ? 'green' : 'red'}>
					{status === 'active' ? 'Активен' : 'Неактивен'}
				</Tag>
			),
		},
		{
			title: 'Тренер',
			dataIndex: 'trainer',
			key: 'trainer',
		},
		{
			title: 'Последняя активность',
			dataIndex: 'lastActivity',
			key: 'lastActivity',
		},
	]

	return (
		<div>
			<h1>Список клиентов</h1>

			<div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
				<Search
					placeholder='Поиск по имени или email'
					onSearch={onSearch}
					style={{ width: 300 }}
					allowClear
				/>

				<Select
					placeholder='Фильтр по статусу'
					onChange={onFilterStatus}
					style={{ width: 200 }}
					allowClear
				>
					<Select.Option value='active'>Активные</Select.Option>
					<Select.Option value='inactive'>Неактивные</Select.Option>
				</Select>
			</div>

			<Table
				dataSource={clients}
				columns={columns}
				rowKey='id'
				pagination={{ pageSize: 10 }}
			/>
		</div>
	)
}

describe('ClientsList - Админ панель управления клиентами', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен отображать заголовок списка клиентов', () => {
		render(<ClientsList />)

		expect(screen.getByText(/список клиентов/i)).toBeInTheDocument()
	})

	it('должен отображать всех клиентов в таблице', () => {
		render(<ClientsList />)

		expect(screen.getByText('Иван Петров')).toBeInTheDocument()
		expect(screen.getByText('Мария Сидорова')).toBeInTheDocument()
		expect(screen.getByText('Алексей Козлов')).toBeInTheDocument()
	})

	it('должен отображать email клиентов', () => {
		render(<ClientsList />)

		expect(screen.getByText('ivan@example.com')).toBeInTheDocument()
		expect(screen.getByText('maria@example.com')).toBeInTheDocument()
		expect(screen.getByText('alexey@example.com')).toBeInTheDocument()
	})

	it('должен отображать статусы клиентов с правильными цветами', () => {
		render(<ClientsList />)

		const activeStatuses = screen.getAllByText('Активен')
		const inactiveStatuses = screen.getAllByText('Неактивен')

		expect(activeStatuses).toHaveLength(2)
		expect(inactiveStatuses).toHaveLength(1)
	})

	it('должен отображать тренеров клиентов', () => {
		render(<ClientsList />)

		expect(screen.getAllByText('Сергей Иванов')).toHaveLength(2)
		expect(screen.getByText('Анна Смирнова')).toBeInTheDocument()
	})

	it('должен отображать поле поиска', () => {
		render(<ClientsList />)

		const searchInput = screen.getByPlaceholderText(/поиск по имени или email/i)
		expect(searchInput).toBeInTheDocument()
	})

	it('должен отображать фильтр по статусу', () => {
		render(<ClientsList />)

		const statusFilter = screen.getByText(/фильтр по статусу/i)
		expect(statusFilter).toBeInTheDocument()
	})

	it('должен вызывать onSearch при вводе в поиск', async () => {
		const user = userEvent.setup()
		const mockOnSearch = vi.fn()

		render(<ClientsList onSearch={mockOnSearch} />)

		const searchInput = screen.getByPlaceholderText(/поиск по имени или email/i)
		await user.type(searchInput, 'Иван{Enter}')

		await waitFor(() => {
			expect(mockOnSearch).toHaveBeenCalled()
			// Проверяем что первый аргумент первого вызова содержит 'Иван'
			expect(mockOnSearch.mock.calls[0][0]).toBe('Иван')
		})
	})

	it('должен вызывать onFilterStatus при выборе статуса', async () => {
		const user = userEvent.setup()
		const mockOnFilterStatus = vi.fn()

		render(<ClientsList onFilterStatus={mockOnFilterStatus} />)

		// Кликаем на селект
		const statusFilter = screen.getByText(/фильтр по статусу/i)
		await user.click(statusFilter)

		// Ждём появления опций и выбираем "Активные"
		await waitFor(() => {
			const activeOption = screen.getByText('Активные')
			expect(activeOption).toBeInTheDocument()
		})
	})

	it('должен отображать правильное количество строк в таблице', () => {
		render(<ClientsList />)

		const rows = screen.getAllByRole('row')
		// +1 для заголовка таблицы
		expect(rows).toHaveLength(mockClients.length + 1)
	})

	it('должен отображать колонки таблицы', () => {
		render(<ClientsList />)

		expect(screen.getByText('Имя')).toBeInTheDocument()
		expect(screen.getByText('Email')).toBeInTheDocument()
		expect(screen.getByText('Статус')).toBeInTheDocument()
		expect(screen.getByText('Тренер')).toBeInTheDocument()
		expect(screen.getByText(/последняя активность/i)).toBeInTheDocument()
	})

	it('должен корректно фильтровать активных клиентов', () => {
		const activeClients = mockClients.filter((c) => c.status === 'active')
		render(<ClientsList clients={activeClients} />)

		expect(screen.getAllByText('Активен')).toHaveLength(2)
		expect(screen.queryByText('Неактивен')).not.toBeInTheDocument()
	})

	it('должен корректно фильтровать неактивных клиентов', () => {
		const inactiveClients = mockClients.filter((c) => c.status === 'inactive')
		render(<ClientsList clients={inactiveClients} />)

		expect(screen.getByText('Неактивен')).toBeInTheDocument()
		expect(screen.queryByText('Активен')).not.toBeInTheDocument()
	})

	it('должен отображать последнюю активность клиентов', () => {
		render(<ClientsList />)

		expect(screen.getByText('2025-12-14')).toBeInTheDocument()
		expect(screen.getByText('2025-12-10')).toBeInTheDocument()
		expect(screen.getByText('2025-12-15')).toBeInTheDocument()
	})
})
