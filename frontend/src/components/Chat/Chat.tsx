import React, { useState } from 'react'
import { Form } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { ImagePreviewModal, InputPanel, MessageList } from './components'
import type { MessageType, ChatUploadFile } from '../../types'

const initialMessages: MessageType[] = [
	{ id: 1, text: 'Сообщение клиента', createdAt: '19:30', sender: 'client' },
	{ id: 2, text: 'Сообщение тренера', createdAt: '19:35', sender: 'trainer' },
	{ id: 3, text: 'Сообщение клиента', createdAt: '19:40', sender: 'client' },
	{ id: 4, text: 'Сообщение тренера', createdAt: '19:40', sender: 'trainer' },
]

type ChatProps = {
	role: 'client' | 'trainer'
}

export const Chat: React.FC<ChatProps> = ({ role }) => {
	const [messages, setMessages] = useState<MessageType[]>(initialMessages)
	const [form] = Form.useForm()
	const [showEmoji, setShowEmoji] = useState(false)
	const [fileList, setFileList] = useState<ChatUploadFile[]>([])
	const [previewImage, setPreviewImage] = useState<string | undefined>()
	const [inputValue, setInputValue] = useState('')

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

		setMessages([
			...messages,
			{
				id: messages.length + 1,
				text,
				createdAt: new Date().toLocaleTimeString().slice(0, 5),
				sender: role,
				imageUrl,
			},
		])
		form.resetFields()
		setInputValue('')
		setFileList([])
	}

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
			<div
				className='py-2 text-center text-sm tracking-wide'
				style={{ color: '#7a90a4', borderBottom: '1px solid #dbe4ee' }}
			>
				1.04.2024
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
