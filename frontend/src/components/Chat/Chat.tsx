import React, { useState, useEffect, useMemo } from 'react'
import { Form, Typography, Spin, Alert, message } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import type { MessageType, ChatUploadFile } from '../../types'
import { MessageList } from './MessageList'
import { InputPanel } from './InputPanel'
import { ImagePreviewModal } from './ImagePreviewModal'
import { TypingIndicator } from './TypingIndicator'
import {
	useAppDispatch,
	useAppSelector,
	selectChatMessages,
	useThemeClasses,
} from '../../store/hooks'
import {
	addMessage,
	receiveMessage,
	setActiveChat,
	markAsRead,
	updateTyping,
	updateMessageStatus,
	replaceMessage,
} from '../../store/slices/chat.slice'
import { setUser } from '../../store/slices/auth.slice'
import {
	useGetMessagesQuery,
	useSendMessageMutation,
	useGetChatsQuery,
} from '../../store/api/chat.api'
import { chatApi } from '../../store/api/chat.api'
import { socketService } from '../../utils/socket'
import { useGetMeQuery } from '../../store/api/user.api'

const { Text } = Typography

type ChatProps = {
	role: 'client' | 'trainer'
	chatId?: string // Опциональный - если не передан, возьмем из списка чатов
	partnerId?: string // ID партнера для поиска конкретного чата
	partnerName?: string // Имя собеседника
}

export const Chat: React.FC<ChatProps> = ({
	role,
	chatId: propChatId,
	partnerId,
	partnerName,
}) => {
	const dispatch = useAppDispatch()
	const token = useAppSelector((state) => state.auth.token)
	const user = useAppSelector((state) => state.auth.user)
	const classes = useThemeClasses()

	// Загружаем данные пользователя если есть токен, но нет пользователя
	const { data: meData } = useGetMeQuery(undefined, {
		skip: !token || !!user,
	})

	// Используем данные пользователя из Redux или из API
	const currentUser = user || meData?.user

	// Сохраняем пользователя в Redux если он загружен из API
	useEffect(() => {
		if (meData?.user && !user) {
			dispatch(setUser(meData.user))
		}
	}, [meData?.user, user, dispatch])

	// Получить список чатов
	const { data: chatsData } = useGetChatsQuery(undefined, { skip: !currentUser })

	// Определить реальный chatId
	const chatId = useMemo(() => {
		let id: string | undefined = propChatId

		if (!id && chatsData?.chats.length) {
			if (partnerId) {
				// Ищем чат с конкретным партнером
				const targetChat = chatsData.chats.find((chat) => {
					if (role === 'client') {
						return chat.trainerId === partnerId
					} else {
						return chat.clientId === partnerId
					}
				})
				id = targetChat?.id
			} else {
				// Берем первый чат из списка
				id = chatsData.chats[0].id
			}
		}

		return id
	}, [propChatId, chatsData, partnerId, role])

	// Подключение к Socket.IO и подписка на события
	useEffect(() => {
		if (!currentUser) return

		const connectAndSubscribe = async () => {
			try {
				await socketService.connect()
				const socket = socketService.getSocket()

				if (!socket) {
					console.error('Socket not available after connect')
					return
				}

				// Обработчик обновления списка чатов
				const handleChatUpdated = () => {
					dispatch(chatApi.util.invalidateTags(['Chats']))
				}

				// Обработчик новых сообщений
				const handleNewMessage = (message: MessageType) => {
					dispatch(receiveMessage({ chatId: message.chatId, message }))

					// Отмечаем как прочитанное только если это активный чат
					if (message.chatId === chatId) {
						dispatch(markAsRead(message.chatId))
					}
				}

				// Обработчик начала печати
				const handleUserTyping = (data: { chatId: string; userId: string }) => {
					// Проверяем только что это не наше сообщение
					if (data.userId !== currentUser.id) {
						dispatch(updateTyping({ chatId: data.chatId, isTyping: true }))
					}
				}

				// Обработчик остановки печати
				const handleUserStoppedTyping = (data: { chatId: string; userId: string }) => {
					// Проверяем только что это не наше сообщение
					if (data.userId !== currentUser.id) {
						dispatch(updateTyping({ chatId: data.chatId, isTyping: false }))
					}
				}

				// Подписываемся на события
				socket.on('chat_updated', handleChatUpdated)
				socket.on('new_message', handleNewMessage)
				socket.on('user_typing', handleUserTyping)
				socket.on('user_stopped_typing', handleUserStoppedTyping)

				// Присоединяемся к комнате чата если есть chatId
				if (chatId) {
					socket.emit('join_chat', chatId)
				}

				// Cleanup при размонтировании
				return () => {
					socket.off('chat_updated', handleChatUpdated)
					socket.off('new_message', handleNewMessage)
					socket.off('user_typing', handleUserTyping)
					socket.off('user_stopped_typing', handleUserStoppedTyping)

					if (chatId) {
						socket.emit('leave_chat', chatId)
					}
				}
			} catch (error) {
				console.error('Failed to connect socket:', error)
			}
		}

		connectAndSubscribe()
	}, [currentUser, chatId, dispatch])
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
	const reduxMessages = useAppSelector((state) => selectChatMessages(state, chatId))

	// Объединяем сообщения из API и Redux, удаляя дубликаты по id
	const messages = useMemo(() => {
		const apiMessages = messagesData?.messages || []
		const allMessages = [...apiMessages, ...reduxMessages]

		// Удаляем дубликаты по id
		const uniqueMessages = Array.from(
			new Map(allMessages.map((msg) => [msg.id, msg])).values(),
		)

		// Сортируем по времени создания
		return uniqueMessages.sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		)
	}, [messagesData?.messages, reduxMessages])

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
			console.error('Выбранный файл не является Blob/File:', file)
			return
		}

		// Валидация типа файла
		if (!file.type.startsWith('image/')) {
			console.error('Разрешены только файлы изображений')
			message.error(
				'Разрешены только изображения. Выберите файл с расширением .jpg, .png, .gif и т.д.',
			)
			return
		}

		// Валидация размера файла (500KB = 500 * 1024 байт)
		const maxSize = 500 * 1024
		if (file.size > maxSize) {
			console.error('Размер файла превышает лимит 500KB')
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
			console.error('Не удалось прочитать файл')
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
		const text = form.getFieldValue('text') || ''
		const imageFile = fileList.length > 0 ? fileList[0].originFileObj : undefined

		if (!text) {
			return
		}

		// Создать временное сообщение со статусом 'sending'
		const tempMessageId = `temp-${Date.now()}`
		const tempMessage: MessageType = {
			id: tempMessageId,
			chatId: chatId || 'temp-chat', // Временно используем temp-chat, обновим после отправки
			senderId: currentUser?.id || 'current-user',
			text: text || '',
			imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
			createdAt: new Date().toISOString(),
			isRead: false,
			sender: {
				id: currentUser?.id || 'current-user',
				name: currentUser?.name || 'Вы',
				photo: currentUser?.photo || undefined,
			},
			status: 'sending',
		}

		// Добавить временное сообщение в локальное состояние
		dispatch(addMessage({ chatId: chatId || 'temp-chat', message: tempMessage }))

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
			const messageData: { chatId?: string; text?: string; image?: File } = {}
			if (chatId) messageData.chatId = chatId
			if (text) messageData.text = text
			if (imageFile) messageData.image = imageFile

			const result = await sendMessage(messageData).unwrap()

			// Если чат был создан (chatId был undefined), обновляем chatId
			if (!chatId && result.message.chatId) {
				dispatch(setActiveChat(result.message.chatId))
				// Заменяем временное сообщение на реальное в новом чате
				dispatch(
					replaceMessage({
						chatId: 'temp-chat',
						tempMessageId,
						realMessage: result.message,
					}),
				)
				// Перезагружаем список чатов
				dispatch(chatApi.util.invalidateTags(['Chats']))
			} else {
				// Заменяем временное сообщение на реальное
				dispatch(
					replaceMessage({
						chatId: chatId || result.message.chatId,
						tempMessageId,
						realMessage: result.message,
					}),
				)
			}

			// Заменить временное сообщение на реальное (если нужно)
			// В идеале сервер должен вернуть то же сообщение, но с правильным ID
		} catch (error) {
			console.error('Не удалось отправить сообщение:', error)
			// Обновить статус на 'error'
			dispatch(
				updateMessageStatus({
					chatId: chatId || 'temp-chat',
					messageId: tempMessageId,
					status: 'error',
				}),
			)
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
		<div
			className={`w-full max-w-2xl flex flex-col mx-auto justify-between ${classes.cardBg} border-2 ${classes.border} rounded-3xl h-[80vh] max-h-[600px] shadow-xl p-2.5 mt-6 md:h-[90vh] md:mt-2 md:rounded-t-2xl md:rounded-b-none md:p-2`}
		>
			{/* Заголовок чата */}
			<div
				className={`p-3 border-b ${classes.border} flex items-center justify-between ${classes.textSecondary}`}
			>
				<div className={`flex items-center gap-2`}>
					<Text strong className={`text-base`}>
						{title}
					</Text>
					{!isOnline && (
						<Text type='danger' className='text-red-500 text-xs'>
							(Оффлайн)
						</Text>
					)}
				</div>
				<div className='flex flex-col items-end gap-0.5'>
					<Text type='secondary' className='text-sm'>
						{today}
					</Text>
					{role === 'client' && partnerName && (
						<Text type='secondary' className='text-sm font-medium text-blue-500'>
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
				<>
					<div
						className={`chat-messages-container ${classes.bodyBg} border ${classes.border} rounded-lg`}
					>
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
							<MessageList
								messages={messages}
								onPreview={handlePreview}
								currentUserId={currentUser?.id}
							/>
						)}
					</div>

					{/* Индикатор печати вне скроллящегося контейнера */}
					{typing && messages.length > 0 && (
						<div className='px-6 py-2'>
							<TypingIndicator />
						</div>
					)}
				</>
			)}

			<InputPanel
				form={form}
				inputValue={inputValue}
				setInputValue={setInputValue}
				onInputChange={handleInputChange}
				fileList={fileList}
				onUploadChange={handleUpload}
				onRemoveImage={handleRemoveImage}
				onPreviewImage={handlePreview}
				onShowEmojiToggle={() => setShowEmoji(!showEmoji)}
				showEmoji={showEmoji}
				onEmojiSelect={insertEmoji}
				onSend={handleSend}
				disabledSend={!inputValue || sendLoading}
				loading={sendLoading}
			/>

			<ImagePreviewModal imageUrl={previewImage} onClose={handleClosePreview} />
		</div>
	)
}
