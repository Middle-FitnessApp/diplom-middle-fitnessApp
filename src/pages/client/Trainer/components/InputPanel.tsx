import React from 'react'
import { Form, Input, Button, Tooltip, Upload } from 'antd'
import { SmileOutlined, PictureOutlined, CloseOutlined } from '@ant-design/icons'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { EmojiPicker } from './EmojiPicker'
import type { ChatUploadFile } from '../../../../types'

type InputPanelProps = {
	form: ReturnType<typeof Form.useForm>[0]
	inputValue: string
	setInputValue: (val: string) => void
	fileList: ChatUploadFile[]
	onUploadChange: (info: UploadChangeParam<UploadFile>) => void
	onRemoveImage: () => void
	onPreviewImage: (url: string) => void
	onShowEmojiToggle: () => void
	showEmoji: boolean
	onEmojiSelect: (emoji: string) => void
	onSend: () => void
	disabledSend: boolean
}

export const InputPanel: React.FC<InputPanelProps> = ({
	form,
	inputValue,
	setInputValue,
	fileList,
	onUploadChange,
	onRemoveImage,
	onPreviewImage,
	onShowEmojiToggle,
	showEmoji,
	onEmojiSelect,
	onSend,
	disabledSend,
}) => (
	<>
		<Form
			form={form}
			layout='inline'
			onFinish={onSend}
			className='w-full px-5 py-4 flex items-center gap-3'
			style={{
				borderTop: '1.5px solid #dbe4ee',
				background: '#f8fbff',
				borderBottomLeftRadius: 24,
				borderBottomRightRadius: 24,
				position: 'relative',
			}}
		>
			<Tooltip title='Прикрепить изображение'>
				<Upload
					showUploadList={false}
					beforeUpload={() => false}
					onChange={onUploadChange}
					accept='image/*'
					multiple={false}
				>
					<Button
						icon={<PictureOutlined />}
						type='text'
						size='large'
						style={{
							color: '#6783b5',
							background: 'transparent',
							border: '1.5px solid #dbe4ee',
							borderRadius: 12,
							width: 40,
							height: 40,
							boxShadow: 'none',
						}}
					/>
				</Upload>
			</Tooltip>
			<Tooltip title='Смайлик'>
				<Button
					icon={<SmileOutlined />}
					type='text'
					size='large'
					style={{
						color: '#6783b5',
						background: 'transparent',
						border: '1.5px solid #dbe4ee',
						borderRadius: 12,
						width: 40,
						height: 40,
						boxShadow: 'none',
					}}
					onClick={onShowEmojiToggle}
				/>
			</Tooltip>

			{showEmoji && <EmojiPicker onSelect={onEmojiSelect} onClose={onShowEmojiToggle} />}

			<Form.Item name='text' style={{ flex: 1, marginBottom: 0 }}>
				<Input
					placeholder='Напишите сообщение'
					size='large'
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value)
						form.setFieldsValue({ text: e.target.value })
					}}
					style={{
						borderRadius: 14,
						background: '#eef4fc',
						border: '1.5px solid #dbe4ee',
						color: '#222d3b',
						fontSize: 15,
					}}
					autoComplete='off'
				/>
			</Form.Item>

			{fileList.length > 0 && (
				<div style={{ position: 'relative', marginRight: 8 }}>
					<img
						src={fileList[0].url}
						alt='preview'
						style={{
							width: 46,
							borderRadius: 7,
							border: '1.5px solid #cfe2f7',
							cursor: 'pointer',
						}}
						onClick={() => onPreviewImage(fileList[0].url)}
					/>
					<Button
						icon={<CloseOutlined />}
						type='text'
						style={{
							position: 'absolute',
							top: -6,
							right: -7,
							fontSize: '12px',
							color: '#999',
							background: '#fff',
							borderRadius: '50%',
							padding: 2,
							border: 'none',
						}}
						onClick={onRemoveImage}
					/>
				</div>
			)}
			<Button
				type='primary'
				htmlType='submit'
				size='large'
				disabled={disabledSend}
				style={{
					borderRadius: 16,
					padding: '0 28px',
					fontWeight: 500,
					height: 42,
					background: 'linear-gradient(90deg,#569DF4 0%,#6A86F1 100%)',
					border: 'none',
					letterSpacing: 0.2,
				}}
			>
				Отправить
			</Button>
		</Form>
	</>
)
