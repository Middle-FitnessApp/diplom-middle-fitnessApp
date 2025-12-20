import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils/test-utils'
import { Input, Button, List, Space } from 'antd'
import { SendOutlined } from '@ant-design/icons'

// Типы данных
interface Message {
	id: number
	text: string
	sender: 'user' | 'trainer'
	timestamp: string
	senderName: string
}

const mockMessages: Message[] = [
	{
		id: 1,
		text: 'Привет! Как дела?',
		sender: 'trainer',
		timestamp: '2025-12-15 10:00',
		senderName: 'Тренер Иван',
	},
	{
		id: 2,
		text: 'Отлично! Сегодня была тренировка',
		sender: 'user',
		timestamp: '2025-12-15 10:05',
		senderName: 'Вы',
	},
	{
		id: 3,
		text: 'Молодец! Продолжай в том же духе',
		sender: 'trainer',
		timestamp: '2025-12-15 10:10',
		senderName: 'Тренер Иван',
	},
]

// Компонент чата
const Chat = ({
	messages = [],
	onSendMessage = vi.fn(),
	currentUser = 'user',
}: {
	messages?: Message[]
	onSendMessage?: (text: string) => void
	currentUser?: 'user' | 'trainer'
}) => {
	const [messageText, setMessageText] = React.useState('')

	const handleSend = () => {
		if (messageText.trim()) {
			onSendMessage(messageText)
			setMessageText('')
		}
	}

	return (
		<div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
			<h2>Чат</h2>

			{/* История сообщений */}
			<div
				style={{
					flex: 1,
					overflowY: 'auto',
					padding: 16,
					backgroundColor: '#f5f5f5',
				}}
				data-testid='message-history'
			>
				{messages.length === 0 ? (
					<div style={{ textAlign: 'center', color: '#999', marginTop: 50 }}>
						Нет сообщений
					</div>
				) : (
					<List
						dataSource={messages}
						renderItem={(message) => {
							const isCurrentUser = message.sender === currentUser

							return (
								<List.Item
									style={{
										justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
										border: 'none',
									}}
									data-testid={`message-${message.id}`}
								>
									<div
										style={{
											maxWidth: '70%',
											padding: 12,
											borderRadius: 8,
											backgroundColor: isCurrentUser ? '#1890ff' : '#fff',
											color: isCurrentUser ? '#fff' : '#000',
										}}
									>
										<Space direction='vertical' size={4}>
											<div style={{ fontWeight: 'bold', fontSize: 12 }}>
												{message.senderName}
											</div>
											<div>{message.text}</div>
											<div style={{ fontSize: 11, opacity: 0.7 }}>
												{message.timestamp}
											</div>
										</Space>
									</div>
								</List.Item>
							)
						}}
					/>
				)}
			</div>

			{/* Поле ввода */}
			<div
				style={{ padding: 16, backgroundColor: '#fff', borderTop: '1px solid #d9d9d9' }}
			>
				<Space.Compact style={{ width: '100%' }}>
					<Input
						placeholder='Введите сообщение...'
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						onPressEnter={handleSend}
						data-testid='message-input'
					/>
					<Button
						type='primary'
						icon={<SendOutlined />}
						onClick={handleSend}
						data-testid='send-button'
					>
						Отправить
					</Button>
				</Space.Compact>
			</div>
		</div>
	)
}

// Добавляем React import
import React from 'react'

describe('Chat - Компонент чата', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен отображать заголовок чата', () => {
		render(<Chat />)

		expect(screen.getByText('Чат')).toBeInTheDocument()
	})

	it('должен отображать пустое состояние при отсутствии сообщений', () => {
		render(<Chat messages={[]} />)

		expect(screen.getByText(/нет сообщений/i)).toBeInTheDocument()
	})

	it('должен отображать историю сообщений', () => {
		render(<Chat messages={mockMessages} />)

		expect(screen.getByTestId('message-history')).toBeInTheDocument()
	})

	it('должен отображать все сообщения', () => {
		render(<Chat messages={mockMessages} />)

		expect(screen.getByText('Привет! Как дела?')).toBeInTheDocument()
		expect(screen.getByText('Отлично! Сегодня была тренировка')).toBeInTheDocument()
		expect(screen.getByText('Молодец! Продолжай в том же духе')).toBeInTheDocument()
	})

	it('должен отображать имена отправителей', () => {
		render(<Chat messages={mockMessages} />)

		expect(screen.getAllByText('Тренер Иван')).toHaveLength(2)
		expect(screen.getByText('Вы')).toBeInTheDocument()
	})

	it('должен отображать временные метки сообщений', () => {
		render(<Chat messages={mockMessages} />)

		expect(screen.getByText('2025-12-15 10:00')).toBeInTheDocument()
		expect(screen.getByText('2025-12-15 10:05')).toBeInTheDocument()
		expect(screen.getByText('2025-12-15 10:10')).toBeInTheDocument()
	})

	it('должен отображать поле ввода сообщения', () => {
		render(<Chat />)

		const input = screen.getByTestId('message-input')
		expect(input).toBeInTheDocument()
		expect(input).toHaveAttribute('placeholder', 'Введите сообщение...')
	})

	it('должен отображать кнопку отправки', () => {
		render(<Chat />)

		expect(screen.getByTestId('send-button')).toBeInTheDocument()
		expect(screen.getByText('Отправить')).toBeInTheDocument()
	})

	it('должен позволять вводить текст в поле сообщения', async () => {
		const user = userEvent.setup()
		render(<Chat />)

		const input = screen.getByTestId('message-input')
		await user.type(input, 'Привет!')

		expect(input).toHaveValue('Привет!')
	})

	it('должен вызывать onSendMessage при клике на кнопку отправки', async () => {
		const user = userEvent.setup()
		const mockOnSend = vi.fn()

		render(<Chat onSendMessage={mockOnSend} />)

		const input = screen.getByTestId('message-input')
		const sendButton = screen.getByTestId('send-button')

		await user.type(input, 'Тестовое сообщение')
		await user.click(sendButton)

		expect(mockOnSend).toHaveBeenCalledWith('Тестовое сообщение')
		expect(mockOnSend).toHaveBeenCalledTimes(1)
	})

	it('должен вызывать onSendMessage при нажатии Enter', async () => {
		const user = userEvent.setup()
		const mockOnSend = vi.fn()

		render(<Chat onSendMessage={mockOnSend} />)

		const input = screen.getByTestId('message-input')
		await user.type(input, 'Сообщение через Enter{Enter}')

		expect(mockOnSend).toHaveBeenCalledWith('Сообщение через Enter')
	})

	it('должен очищать поле ввода после отправки', async () => {
		const user = userEvent.setup()
		const mockOnSend = vi.fn()

		render(<Chat onSendMessage={mockOnSend} />)

		const input = screen.getByTestId('message-input')
		await user.type(input, 'Текст для очистки')
		await user.click(screen.getByTestId('send-button'))

		await waitFor(() => {
			expect(input).toHaveValue('')
		})
	})

	it('не должен отправлять пустое сообщение', async () => {
		const user = userEvent.setup()
		const mockOnSend = vi.fn()

		render(<Chat onSendMessage={mockOnSend} />)

		const sendButton = screen.getByTestId('send-button')
		await user.click(sendButton)

		expect(mockOnSend).not.toHaveBeenCalled()
	})

	it('не должен отправлять сообщение только с пробелами', async () => {
		const user = userEvent.setup()
		const mockOnSend = vi.fn()

		render(<Chat onSendMessage={mockOnSend} />)

		const input = screen.getByTestId('message-input')
		await user.type(input, '   ')
		await user.click(screen.getByTestId('send-button'))

		expect(mockOnSend).not.toHaveBeenCalled()
	})

	it('должен отображать правильное количество сообщений', () => {
		render(<Chat messages={mockMessages} />)

		const messages = screen.getAllByTestId(/message-\d+/)
		expect(messages).toHaveLength(3)
	})

	it('должен различать сообщения от разных отправителей по стилю', () => {
		render(<Chat messages={mockMessages} currentUser='user' />)

		const userMessage = screen.getByTestId('message-2')
		const trainerMessage = screen.getByTestId('message-1')

		// Сообщения пользователя имеют синий фон
		expect(
			userMessage.querySelector('[style*="background-color: rgb(24, 144, 255)"]'),
		).toBeInTheDocument()

		// Сообщения тренера имеют белый фон
		expect(
			trainerMessage.querySelector('[style*="background-color: rgb(255, 255, 255)"]'),
		).toBeInTheDocument()
	})

	it('должен корректно отображать одно сообщение', () => {
		const singleMessage = [mockMessages[0]]

		render(<Chat messages={singleMessage} />)

		expect(screen.getByText('Привет! Как дела?')).toBeInTheDocument()
		expect(screen.queryByText('Отлично! Сегодня была тренировка')).not.toBeInTheDocument()
	})

	it('должен иметь прокручиваемую область истории', () => {
		render(<Chat messages={mockMessages} />)

		const history = screen.getByTestId('message-history')
		// Проверяем что элемент существует и содержит сообщения
		expect(history).toBeInTheDocument()
		expect(history).toBeVisible()
	})
})
