import React, { useState, useEffect } from 'react'
import { Form, Typography, Spin, Alert } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import type { MessageType, ChatUploadFile } from '../../types'
import { MessageList } from './MessageList'
import { InputPanel } from './InputPanel'
import { ImagePreviewModal } from './ImagePreviewModal'
import { useAppDispatch } from '../../store/hooks'
import { addMessage, markAsRead } from '../../store/slices/chat.slice'
import { useGetMessagesQuery, useSendMessageMutation } from '../../store/api/chat.api'
import { socketService } from '../../utils/socket'

const { Text } = Typography

type ChatProps = {
	role: 'client' | 'trainer'
	chatId: string // Обязательный ID чата
	partnerName?: string // Имя собеседника
}

export const Chat: React.FC<ChatProps> = ({ role, chatId, partnerName }) => {
	const dispatch = useAppDispatch()

	// RTK Query hooks
	const {
		data: messagesData,
		isLoading: messagesLoading,
		error: messagesError,
	} = useGetMessagesQuery({ chatId, page: 1, limit: 50 }, { skip: !chatId })
	const [sendMessage, { isLoading: sendLoading }] = useSendMessageMutation()

	const [form] = Form.useForm()
	const [showEmoji, setShowEmoji] = useState(false)
	const [fileList, setFileList] = useState<ChatUploadFile[]>([])
	const [previewImage, setPreviewImage] = useState<string | undefined>()
	const [inputValue, setInputValue] = useState('')

	// Сообщения из API или пустой массив
	const messages = messagesData?.messages || []

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
							dispatch(addMessage({ chatId, message }))
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
	}, [chatId, dispatch])

	// Отмечаем сообщения как прочитанные при открытии чата
	useEffect(() => {
		dispatch(markAsRead(chatId))
	}, [chatId, dispatch])

	const insertEmoji = (emoji: string) => {
		const text = form.getFieldValue('text') || ''
		form.setFieldsValue({ text: text + emoji })
		setInputValue(text + emoji)
		setShowEmoji(false)
	}

	const handleUpload = (info: UploadChangeParam<UploadFile>) => {
		const file = info.file.originFileObj ?? info.file

		if (!(file instanceof Blob)) {
			console.error('Selected file is not a Blob/File:', file)
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
					},
				])
			}
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
		const imageUrl = fileList.length > 0 ? fileList[0].url : undefined

		if (!text && !imageUrl) {
			return
		}

		try {
			const result = await sendMessage({
				chatId,
				text,
				image: imageUrl,
			}).unwrap()

			// Сообщение уже добавлено через WebSocket или RTK Query invalidation
			// Но для надежности добавим локально
			dispatch(addMessage({ chatId, message: result.message }))

			form.resetFields()
			setInputValue('')
			setFileList([])
		} catch (error) {
			console.error('Failed to send message:', error)
			// Можно показать уведомление об ошибке
		}
	}

	// Форматируем текущую дату
	const today = new Date().toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const title =
		role === 'client'
			? 'Чат с тренером'
			: `Чат с клиентом${partnerName ? `: ${partnerName}` : ''}`

	return (
		<div
			className='w-full max-w-2xl flex flex-col mx-auto justify-between'
			style={{
				background: '#fff',
				border: '2px solid #b1b1b1',
				borderRadius: 24,
				height: '80vh',
				boxShadow: '0 6px 32px rgba(50,50,90,.1)',
				padding: '10px',
				marginTop: '1.5rem',
			}}
		>
			{/* Заголовок чата */}
			<div
				className='py-3 px-4 flex items-center justify-between'
				style={{ borderBottom: '1px solid #dbe4ee' }}
			>
				<Text strong className='text-base'>
					{title}
				</Text>
				<Text type='secondary' className='text-sm'>
					{today}
				</Text>
			</div>

			{/* Loading и Error состояния */}
			{messagesLoading && (
				<div className='flex justify-center items-center py-8'>
					<Spin size='large' />
				</div>
			)}
			{messagesError && (
				<div className='p-4'>
					<Alert
						message='Ошибка загрузки сообщений'
						description='Не удалось загрузить историю чата. Попробуйте обновить страницу.'
						type='error'
						showIcon
					/>
				</div>
			)}

			{/* Сообщения */}
			{!messagesLoading && !messagesError && (
				<MessageList messages={messages} onPreview={handlePreview} role={role} />
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
