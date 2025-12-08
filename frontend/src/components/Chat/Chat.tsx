import React, { useState, useEffect } from 'react'
import { Form, Typography } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import type { MessageType, ChatUploadFile } from '../../types'
import { MessageList } from './MessageList'
import { InputPanel } from './InputPanel'
import { ImagePreviewModal } from './ImagePreviewModal'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addMessage, markAsRead } from '../../store/slices/chat.slice'

const { Text } = Typography

// Демо сообщения для первого открытия
const getInitialMessages = (role: 'client' | 'trainer'): MessageType[] => {
	if (role === 'client') {
		return [
			{
				id: 1,
				text: 'Здравствуйте! Я ваш тренер. Готов помочь вам достичь ваших целей! 💪',
				createdAt: '10:00',
				sender: 'trainer',
			},
			{
				id: 2,
				text: 'Как прошла ваша тренировка на этой неделе?',
				createdAt: '10:01',
				sender: 'trainer',
			},
		]
	}
	return [
		{
			id: 1,
			text: 'Здравствуйте! Я записался к вам на тренировки',
			createdAt: '09:30',
			sender: 'client',
		},
	]
}

type ChatProps = {
	role: 'client' | 'trainer'
	chatId?: string // Опциональный ID чата (для тренера - ID клиента)
	partnerName?: string // Имя собеседника
}

export const Chat: React.FC<ChatProps> = ({
	role,
	chatId: propChatId,
	partnerName,
}) => {
	// Формируем chatId
	const chatId = propChatId || (role === 'client' ? 'client_trainer' : 'trainer_client')

	const dispatch = useAppDispatch()
	const storedMessages = useAppSelector((state) => state.chat.messages[chatId])

	const [form] = Form.useForm()
	const [showEmoji, setShowEmoji] = useState(false)
	const [fileList, setFileList] = useState<ChatUploadFile[]>([])
	const [previewImage, setPreviewImage] = useState<string | undefined>()
	const [inputValue, setInputValue] = useState('')

	// Используем сохранённые сообщения или демо
	const messages = storedMessages || getInitialMessages(role)

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
						uid: info.file.uid ? Number(info.file.uid) : Date.now(),
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

		const newMessage: MessageType = {
			id: Date.now(),
			text,
			createdAt: new Date().toLocaleTimeString('ru-RU', {
				hour: '2-digit',
				minute: '2-digit',
			}),
			sender: role,
			imageUrl,
		}

		// Добавляем в Redux (автоматически сохранится в localStorage)
		dispatch(addMessage({ chatId, message: newMessage }))

		form.resetFields()
		setInputValue('')
		setFileList([])
	}

	// Форматируем текущую дату
	const today = new Date().toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const title = role === 'client' ? 'Чат с тренером' : `Чат с клиентом${partnerName ? `: ${partnerName}` : ''}`

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

			<MessageList messages={messages} onPreview={handlePreview} role={role} />

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
				disabledSend={!inputValue && fileList.length === 0}
			/>

			<ImagePreviewModal imageUrl={previewImage} onClose={handleClosePreview} />
		</div>
	)
}
