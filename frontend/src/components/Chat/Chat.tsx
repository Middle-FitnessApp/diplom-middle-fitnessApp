import React, { useState, useEffect } from 'react'
import { Form, Typography, Spin, Alert, message } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import type { MessageType, ChatUploadFile } from '../../types'
import { MessageList } from './MessageList'
import { InputPanel } from './InputPanel'
import { ImagePreviewModal } from './ImagePreviewModal'
import { TypingIndicator } from './TypingIndicator'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
	addMessage,
	receiveMessage,
	setActiveChat,
	markAsRead,
	updateTyping,
	updateMessageStatus,
} from '../../store/slices/chat.slice'
import {
	useGetMessagesQuery,
	useSendMessageMutation,
	useGetChatsQuery,
} from '../../store/api/chat.api'
import { socketService } from '../../utils/socket'

const { Text } = Typography

type ChatProps = {
	role: 'client' | 'trainer'
	chatId?: string // Опциональный - если не передан, возьмем из списка чатов
	partnerName?: string // Имя собеседника
}

export const Chat: React.FC<ChatProps> = ({ role, chatId: propChatId, partnerName }) => {
	const dispatch = useAppDispatch()
	const user = useAppSelector((state) => state.auth.user)

	// Получить список чатов
	const { data: chatsData } = useGetChatsQuery(undefined, { skip: !user })

	// Определить реальный chatId
	const chatId = propChatId || (chatsData?.chats.length ? chatsData.chats[0].id : null)

	// RTK Query hooks
	const {
		data: messagesData,
		isLoading: messagesLoading,
		error: messagesError,
	} = useGetMessagesQuery({ chatId: chatId!, page: 1, limit: 50 }, { skip: !chatId })
	const [sendMessage, { isLoading: sendLoading }] = useSendMessageMutation()

	const [form] = Form.useForm()
	const [showEmoji, setShowEmoji] = useState(false)
	const [fileList, setFileList] = useState<ChatUploadFile[]>([])
	const [previewImage, setPreviewImage] = useState<string | undefined>()
	const [inputValue, setInputValue] = useState('')
	const [isOnline, setIsOnline] = useState(navigator.onLine)
	const [typingTimeout, setTypingTimeout] = useState<number | null>(null)

	// Получить состояние чата из Redux
	const typing = useAppSelector((state) => (chatId ? state.chat.typing[chatId] : false))

	// Сообщения из API или пустой массив
	const messages = messagesData?.messages || []

	// Обработка онлайн/оффлайн статуса
	useEffect(() => {
		const handleOnline = () => setIsOnline(true)
		const handleOffline = () => setIsOnline(false)

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [])

	// WebSocket подключение
	useEffect(() => {
		if (!chatId) return

		const connectSocket = async () => {
			try {
				await socketService.connect()
				socketService.joinChat(chatId)

				// Подписка на новые сообщения
				const socket = socketService.getSocket()
				if (socket) {
					socket.on('new_message', (message: MessageType) => {
						if (message.chatId === chatId) {
							dispatch(receiveMessage({ chatId, message }))
						}
					})

					// Подписка на индикатор печати
					socket.on('user_typing', (data: { chatId: string; userId: string }) => {
						if (data.chatId === chatId && data.userId !== user?.id) {
							dispatch(updateTyping({ chatId, isTyping: true }))
						}
					})

					socket.on('user_stopped_typing', (data: { chatId: string; userId: string }) => {
						if (data.chatId === chatId && data.userId !== user?.id) {
							dispatch(updateTyping({ chatId, isTyping: false }))
						}
					})
				}
			} catch (error) {
				console.error('Failed to connect socket:', error)
			}
		}

		connectSocket()

		return () => {
			socketService.leaveChat(chatId)
		}
	}, [chatId, dispatch, user?.id])

	// Отмечаем сообщения как прочитанные при открытии чата
	useEffect(() => {
		if (chatId) {
			dispatch(setActiveChat(chatId))
			dispatch(markAsRead(chatId))
		}
	}, [chatId, dispatch])

	// Обработка набора текста
	const handleInputChange = (value: string) => {
		setInputValue(value)
		form.setFieldsValue({ text: value })

		if (chatId && value.trim()) {
			// Отправить событие начала набора
			socketService.getSocket()?.emit('typing_start', chatId)

			// Очистить предыдущий таймер
			if (typingTimeout) {
				clearTimeout(typingTimeout)
			}

			// Установить таймер для остановки набора
			const timeout = setTimeout(() => {
				socketService.getSocket()?.emit('typing_stop', chatId)
			}, 1000)

			setTypingTimeout(timeout)
		} else if (chatId) {
			// Остановить набор если поле пустое
			socketService.getSocket()?.emit('typing_stop', chatId)
			if (typingTimeout) {
				clearTimeout(typingTimeout)
				setTypingTimeout(null)
			}
		}
	}

	const insertEmoji = (emoji: string) => {
		const text = form.getFieldValue('text') || ''
		const newText = text + emoji
		handleInputChange(newText)
		setShowEmoji(false)
	}

	const handleUpload = (info: UploadChangeParam<UploadFile>) => {
		const file = info.file.originFileObj ?? info.file

		if (!(file instanceof Blob)) {
			console.error('Selected file is not a Blob/File:', file)
			return
		}

		// Валидация типа файла
		if (!file.type.startsWith('image/')) {
			console.error('Only image files are allowed')
			message.error(
				'Разрешены только изображения. Выберите файл с расширением .jpg, .png, .gif и т.д.',
			)
			return
		}

		// Валидация размера файла (500KB = 500 * 1024 байт)
		const maxSize = 500 * 1024
		if (file.size > maxSize) {
			console.error('File size exceeds 500KB limit')
			message.error('Размер файла превышает 500KB. Выберите файл меньшего размера.')
			return
		}

		const reader = new FileReader()
		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target?.result) {
				setFileList([
					{
						uid: info.file.uid,
						name: info.file.name,
						url: e.target.result as string,
						originFileObj: file as File,
					},
				])
			}
		}
		reader.onerror = () => {
			console.error('Failed to read file')
			message.error('Не удалось прочитать файл. Попробуйте выбрать другое изображение.')
			setFileList([]) // Очищаем список файлов при ошибке
		}
		reader.readAsDataURL(file)
	}

	const handlePreview = (imageUrl: string) => {
		setPreviewImage(imageUrl)
	}

	const handleClosePreview = () => {
		setPreviewImage(undefined)
	}

	const handleRemoveImage = () => {
		setFileList([])
	}

	const handleSend = async () => {
		if (!chatId) return

		const text = form.getFieldValue('text') || ''
		const imageFile = fileList.length > 0 ? fileList[0].originFileObj : undefined

		if (!text && !imageFile) {
			return
		}

		// Создать временное сообщение со статусом 'sending'
		const tempMessageId = `temp-${Date.now()}`
		const tempMessage: MessageType = {
			id: tempMessageId,
			chatId,
			senderId: user?.id || 'current-user',
			text: text || '',
			imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
			createdAt: new Date().toISOString(),
			isRead: false,
			sender: {
				id: user?.id || 'current-user',
				name: user?.name || 'Вы',
				photo: user?.photo || undefined,
			},
			status: 'sending',
		}

		// Добавить временное сообщение в локальное состояние
		dispatch(addMessage({ chatId, message: tempMessage }))

		// Очистить форму сразу
		form.resetFields()
		setInputValue('')
		setFileList([])

		// Остановить индикатор набора
		if (chatId) {
			socketService.getSocket()?.emit('typing_stop', chatId)
			if (typingTimeout) {
				clearTimeout(typingTimeout)
				setTypingTimeout(null)
			}
		}

		try {
			await sendMessage({
				chatId,
				text: text || undefined,
				image: imageFile,
			}).unwrap()

			// Обновить статус временного сообщения на 'sent'
			dispatch(updateMessageStatus({ chatId, messageId: tempMessageId, status: 'sent' }))

			// Заменить временное сообщение на реальное (если нужно)
			// В идеале сервер должен вернуть то же сообщение, но с правильным ID
		} catch (error) {
			console.error('Failed to send message:', error)
			// Обновить статус на 'error'
			dispatch(updateMessageStatus({ chatId, messageId: tempMessageId, status: 'error' }))
			message.error('Не удалось отправить сообщение. Попробуйте еще раз.')
		}
	}

	// Форматируем текущую дату
	const today = new Date().toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const title = role === 'client' ? 'Чат с тренером' : 'Чат с клиентом'

	return (
		<div className='w-full max-w-2xl flex flex-col mx-auto justify-between chat-container chat-main-container'>
			{/* Заголовок чата */}
			<div className='chat-header'>
				<div className='chat-header-title'>
					<Text strong className='text-base'>
						{title}
					</Text>
					{!isOnline && (
						<Text type='danger' className='chat-offline-indicator'>
							(Оффлайн)
						</Text>
					)}
				</div>
				<div className='chat-header-info'>
					<Text type='secondary' className='text-sm'>
						{today}
					</Text>
					{role === 'client' && partnerName && (
						<Text type='secondary' className='text-sm chat-partner-name'>
							{partnerName}
						</Text>
					)}
				</div>
			</div>

			{/* Loading состояние */}
			{messagesLoading && (
				<div className='chat-loading-container'>
					<Spin size='large' />
				</div>
			)}

			{/* Error состояние */}
			{messagesError && (
				<div className='chat-error-container'>
					<Alert
						message='Ошибка загрузки сообщений'
						description='Не удалось загрузить историю чата. Попробуйте обновить страницу.'
						type='error'
						showIcon
					/>
				</div>
			)}

			{/* Сообщения или приветственное сообщение */}
			{!messagesLoading && !messagesError && (
				<div className='chat-messages-container'>
					{messages.length === 0 ? (
						<div className='chat-empty-state'>
							<div className='chat-empty-message'>
								<Text type='secondary' className='text-base'>
									{role === 'client'
										? '👋 Привет! Напишите вашему тренеру, чтобы начать общение'
										: '👋 Привет! Напишите вашему клиенту, чтобы начать общение'}
								</Text>
								<Text type='secondary' className='text-sm chat-empty-subtitle'>
									{role === 'client'
										? 'Здесь вы можете обсудить тренировки, питание и прогресс'
										: 'Здесь вы можете обсудить тренировки, питание и прогресс с клиентом'}
								</Text>
							</div>
						</div>
					) : (
						<>
							<MessageList messages={messages} onPreview={handlePreview} role={role} />
							{typing && <TypingIndicator />}
						</>
					)}
				</div>
			)}

			<InputPanel
				form={form}
				inputValue={inputValue}
				setInputValue={setInputValue}
				fileList={fileList}
				onUploadChange={handleUpload}
				onRemoveImage={handleRemoveImage}
				onPreviewImage={handlePreview}
				onShowEmojiToggle={() => setShowEmoji(!showEmoji)}
				showEmoji={showEmoji}
				onEmojiSelect={insertEmoji}
				onSend={handleSend}
				disabledSend={(!inputValue && fileList.length === 0) || sendLoading}
				loading={sendLoading}
			/>

			<ImagePreviewModal imageUrl={previewImage} onClose={handleClosePreview} />
		</div>
	)
}
