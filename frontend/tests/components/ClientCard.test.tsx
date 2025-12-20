import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils/test-utils'
import { Card, Avatar, Button, Tag, Space } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'

// Типы данных
interface Client {
	id: number
	name: string
	email: string
	phone: string
	status: 'active' | 'inactive'
	avatar?: string
	progress: {
		weight: number
		target: number
	}
	lastWorkout: string
}

// Компонент карточки клиента
const ClientCard = ({
	client,
	onViewDetails = vi.fn(),
	onSendMessage = vi.fn(),
	onAssignWorkout = vi.fn(),
}: {
	client: Client
	onViewDetails?: (id: number) => void
	onSendMessage?: (id: number) => void
	onAssignWorkout?: (id: number) => void
}) => {
	return (
		<Card hoverable style={{ width: 300 }} data-testid={`client-card-${client.id}`}>
			<Space direction='vertical' size='middle' style={{ width: '100%' }}>
				{/* Аватар и имя */}
				<div style={{ textAlign: 'center' }}>
					<Avatar size={64} icon={<UserOutlined />} src={client.avatar} />
					<h3 style={{ marginTop: 8 }}>{client.name}</h3>
					<Tag color={client.status === 'active' ? 'green' : 'red'}>
						{client.status === 'active' ? 'Активен' : 'Неактивен'}
					</Tag>
				</div>

				{/* Контактная информация */}
				<Space direction='vertical' size='small' style={{ width: '100%' }}>
					<div>
						<MailOutlined /> {client.email}
					</div>
					<div>
						<PhoneOutlined /> {client.phone}
					</div>
				</Space>

				{/* Прогресс */}
				<div>
					<div style={{ fontSize: 12, color: '#666' }}>Прогресс веса:</div>
					<div>
						<strong>{client.progress.weight} кг</strong> / {client.progress.target} кг
					</div>
				</div>

				{/* Последняя тренировка */}
				<div>
					<div style={{ fontSize: 12, color: '#666' }}>Последняя тренировка:</div>
					<div>{client.lastWorkout}</div>
				</div>

				{/* Действия */}
				<Space style={{ width: '100%', justifyContent: 'space-between' }}>
					<Button type='primary' onClick={() => onViewDetails(client.id)}>
						Подробнее
					</Button>
					<Button onClick={() => onSendMessage(client.id)}>Написать</Button>
					<Button onClick={() => onAssignWorkout(client.id)}>Назначить</Button>
				</Space>
			</Space>
		</Card>
	)
}

describe('ClientCard - Карточка клиента', () => {
	const mockClient: Client = {
		id: 1,
		name: 'Иван Петров',
		email: 'ivan@example.com',
		phone: '+7 (999) 123-45-67',
		status: 'active',
		progress: {
			weight: 75,
			target: 70,
		},
		lastWorkout: '2025-12-14',
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен отображать имя клиента', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText('Иван Петров')).toBeInTheDocument()
	})

	it('должен отображать статус клиента', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText('Активен')).toBeInTheDocument()
	})

	it('должен отображать статус "Неактивен" для неактивного клиента', () => {
		const inactiveClient = { ...mockClient, status: 'inactive' as const }
		render(<ClientCard client={inactiveClient} />)

		expect(screen.getByText('Неактивен')).toBeInTheDocument()
	})

	it('должен отображать email клиента', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText('ivan@example.com')).toBeInTheDocument()
	})

	it('должен отображать телефон клиента', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText('+7 (999) 123-45-67')).toBeInTheDocument()
	})

	it('должен отображать прогресс веса', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText(/75 кг/)).toBeInTheDocument()
		expect(screen.getByText(/70 кг/)).toBeInTheDocument()
	})

	it('должен отображать дату последней тренировки', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText('2025-12-14')).toBeInTheDocument()
	})

	it('должен отображать аватар', () => {
		render(<ClientCard client={mockClient} />)

		const card = screen.getByTestId('client-card-1')
		// Ищем иконку пользователя внутри аватара
		const userIcon = within(card).getByLabelText('user')
		expect(userIcon).toBeInTheDocument()
	})

	it('должен отображать три кнопки действий', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByRole('button', { name: /подробнее/i })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /написать/i })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /назначить/i })).toBeInTheDocument()
	})

	it('должен вызывать onViewDetails при клике на кнопку "Подробнее"', async () => {
		const user = userEvent.setup()
		const mockOnViewDetails = vi.fn()

		render(<ClientCard client={mockClient} onViewDetails={mockOnViewDetails} />)

		const button = screen.getByRole('button', { name: /подробнее/i })
		await user.click(button)

		expect(mockOnViewDetails).toHaveBeenCalledWith(1)
		expect(mockOnViewDetails).toHaveBeenCalledTimes(1)
	})

	it('должен вызывать onSendMessage при клике на кнопку "Написать"', async () => {
		const user = userEvent.setup()
		const mockOnSendMessage = vi.fn()

		render(<ClientCard client={mockClient} onSendMessage={mockOnSendMessage} />)

		const button = screen.getByRole('button', { name: /написать/i })
		await user.click(button)

		expect(mockOnSendMessage).toHaveBeenCalledWith(1)
		expect(mockOnSendMessage).toHaveBeenCalledTimes(1)
	})

	it('должен вызывать onAssignWorkout при клике на кнопку "Назначить"', async () => {
		const user = userEvent.setup()
		const mockOnAssignWorkout = vi.fn()

		render(<ClientCard client={mockClient} onAssignWorkout={mockOnAssignWorkout} />)

		const button = screen.getByRole('button', { name: /назначить/i })
		await user.click(button)

		expect(mockOnAssignWorkout).toHaveBeenCalledWith(1)
		expect(mockOnAssignWorkout).toHaveBeenCalledTimes(1)
	})

	it('должен корректно отображать разные данные клиентов', () => {
		const anotherClient: Client = {
			id: 2,
			name: 'Мария Сидорова',
			email: 'maria@example.com',
			phone: '+7 (999) 987-65-43',
			status: 'inactive',
			progress: {
				weight: 60,
				target: 55,
			},
			lastWorkout: '2025-12-10',
		}

		render(<ClientCard client={anotherClient} />)

		expect(screen.getByText('Мария Сидорова')).toBeInTheDocument()
		expect(screen.getByText('maria@example.com')).toBeInTheDocument()
		expect(screen.getByText(/60 кг/)).toBeInTheDocument()
		expect(screen.getByText('2025-12-10')).toBeInTheDocument()
	})

	it('должен отображать label "Прогресс веса:"', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText(/прогресс веса:/i)).toBeInTheDocument()
	})

	it('должен отображать label "Последняя тренировка:"', () => {
		render(<ClientCard client={mockClient} />)

		expect(screen.getByText(/последняя тренировка:/i)).toBeInTheDocument()
	})

	it('карточка должна быть hoverable', () => {
		render(<ClientCard client={mockClient} />)

		const card = screen.getByTestId('client-card-1')
		// Проверяем что сама карточка имеет класс hoverable
		expect(card).toHaveClass('ant-card-hoverable')
	})
})
